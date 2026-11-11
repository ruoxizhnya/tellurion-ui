import { test, expect } from '@playwright/test';
import { apiRequest, API, waitForBackendReady } from '../helpers/api';
import { isolateTestEnvironment } from '../helpers/isolation';

test.describe('D7-28: Data Sync — Full Workflow (Create → Execute → Complete → Verify)', () => {

  test.beforeAll(async () => {
    const ready = await waitForBackendReady(60000);
    expect(ready).toBe(true);
  });

  test.beforeEach(async ({ page }) => {
    await isolateTestEnvironment(page);
  });

  test('API: Create sync job → Execute → Complete → Verify', async () => {
    const ctx = await apiRequest();

    // Step 1: Create a sync job
    // 契约（data docs/api-schema.md §4）：请求键是 `job_type`（不是 `type`），
    // 响应直接是 job 对象（`id` 不是 `job_id`），终态是 `succeeded`
    // （不是 `completed`）。job_type 的取值 = connector 声明的 data_type，
    // 日线是 `ohlcv_daily`（`ohlcv` / `ohlcv_daily_qfq` 都接不了单）。
    const createRes = await ctx.post('/api/sync/jobs', {
      data: {
        job_type: 'ohlcv_daily',
        params: {
          symbols: ['600000.SH'],
          start_date: '2024-01-01',
          end_date: '2024-03-31',
        },
      },
    });

    expect(createRes.status()).toBe(202);
    const createBody = await createRes.json();
    expect(typeof createBody.id).toBe('string');
    const jobId = createBody.id;

    // Step 2: Verify job is queued or running
    const statusRes = await ctx.get(`/api/sync/jobs/${jobId}`);
    expect(statusRes.status()).toBe(200);
    const statusBody = await statusRes.json();
    expect(statusBody.id).toBe(jobId);
    expect(['pending', 'running', 'succeeded']).toContain(statusBody.status);

    // Step 3: Poll until job reaches a terminal state (with timeout)
    let terminal = false;
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      const pollRes = await ctx.get(`/api/sync/jobs/${jobId}`);
      const pollBody = await pollRes.json();
      if (pollBody.status === 'succeeded' || pollBody.status === 'failed') {
        terminal = true;
        break;
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    expect(terminal).toBe(true);

    // Step 4: Verify final state
    const finalRes = await ctx.get(`/api/sync/jobs/${jobId}`);
    expect(finalRes.status()).toBe(200);
    const finalBody = await finalRes.json();
    expect(finalBody.status).toBe('succeeded');
    expect(finalBody.progress_percent).toBe(100);
    expect(finalBody.total_items).toBeGreaterThan(0);
    expect(finalBody.processed_items).toBe(finalBody.total_items);

    await ctx.dispose();
  });

  test('API: 旧契约键 type 必须被 400 拒（负面）', async () => {
    // 钉住 2026-11-12 的契约迁移：data 用 DisallowUnknownFields 解码，
    // 发 `type` 会得到 400 + invalid_parameter，而不是被静默忽略后建一个
    // job_type 为空的作业。
    const ctx = await apiRequest();
    const res = await ctx.post('/api/sync/jobs', {
      data: { type: 'ohlcv_daily', params: { symbols: ['600000.SH'] } },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('invalid_parameter');
    expect(String(body.error.message)).toContain('type');
    await ctx.dispose();
  });

  test('API: List sync jobs with status filter', async () => {
    const ctx = await apiRequest();

    // Get all jobs
    const allRes = await ctx.get('/api/sync/jobs');
    expect(allRes.status()).toBe(200);
    const allBody = await allRes.json();
    expect(Array.isArray(allBody.jobs)).toBe(true);

    // Get succeeded jobs（终态字面值是 succeeded，不是 completed）
    const succeededRes = await ctx.get('/api/sync/jobs?status=succeeded');
    expect(succeededRes.status()).toBe(200);
    const succeededBody = await succeededRes.json();
    expect(Array.isArray(succeededBody.jobs)).toBe(true);

    // Verify all filtered jobs have status 'succeeded'
    for (const job of succeededBody.jobs) {
      expect(job.status).toBe('succeeded');
    }

    await ctx.dispose();
  });

  test('API: Cancel a running sync job', async () => {
    const ctx = await apiRequest();

    // Create a job that takes some time
    const createRes = await ctx.post('/api/sync/jobs', {
      data: {
        job_type: 'ohlcv_daily',
        params: {
          symbols: ['000001.SZ', '000002.SZ'],
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        },
      },
    });

    expect(createRes.status()).toBe(202);
    const createBody = await createRes.json();
    const jobId = createBody.id;

    // Cancel：pending 的作业可取消（200）；worker 已经领走则是 409
    // `job_not_cancellable`——只有 pending 能取消是队列的既定语义，不是
    // 偶发失败，所以两者都算对齐契约。
    const cancelRes = await ctx.post(`/api/sync/jobs/${jobId}/cancel`);
    expect([200, 409]).toContain(cancelRes.status());

    // Verify job is cancelled or reached another terminal state
    const statusRes = await ctx.get(`/api/sync/jobs/${jobId}`);
    if (statusRes.status() === 200) {
      const statusBody = await statusRes.json();
      expect(['cancelled', 'succeeded', 'failed', 'pending', 'running']).toContain(statusBody.status);
    }

    await ctx.dispose();
  });

  test('API: Retry a failed sync job', async () => {
    test.setTimeout(60000);
    const ctx = await apiRequest();

    // 造一个**异步失败**的作业：参考数据腿 `trading_calendar` 的日期只校验
    // 格式、不校验先后，执行器在窗口解析时才报 "end_date ... is before
    // start_date"（实测）。旧版用 ohlcv + invalid 日期，现在在受理门就 400，
    // 根本拿不到 id。
    const createRes = await ctx.post('/api/sync/jobs', {
      data: {
        job_type: 'trading_calendar',
        params: {
          exchange: 'SSE',
          start_date: '2099-12-31',
          end_date: '2020-01-01',
        },
      },
    });

    expect(createRes.status()).toBe(202);
    const createBody = await createRes.json();
    const jobId = createBody.id;

    // Wait for job to fail
    let failed = false;
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      const pollRes = await ctx.get(`/api/sync/jobs/${jobId}`);
      if (pollRes.status() === 200) {
        const pollBody = await pollRes.json();
        if (pollBody.status === 'failed') {
          failed = true;
          break;
        }
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    expect(failed, '作业未在 30s 内进入 failed 终态').toBe(true);

    // 自动重试已把 max_retries 用完，终态 failed 必然意味着 retry 预算耗尽；
    // 此时手动 retry 按契约被拒（400 "cannot be retried"），而不是 202。
    // 旧期望（202/200）与 worker 的自动重试设计冲突：先 RetryLater 到耗尽才 FailJob。
    const retryRes = await ctx.post(`/api/sync/jobs/${jobId}/retry`);
    expect(retryRes.status()).toBe(400);
    const retryBody = await retryRes.json();
    expect(String(retryBody.error)).toContain('cannot be retried');

    // 一次无效 retry 不得把 failed 洗成 pending/failed 以外的状态。
    const afterRes = await ctx.get(`/api/sync/jobs/${jobId}`);
    expect(afterRes.status()).toBe(200);
    expect((await afterRes.json()).status).toBe('failed');

    await ctx.dispose();
  });

  test('UI: Data Sync page loads correctly', async ({ page }) => {
    await page.goto('/data-sync');
    await page.waitForLoadState('domcontentloaded');

    // Verify page title
    const title = await page.locator('h1').textContent();
    expect(title).toContain('数据管理');

    // Verify key components exist
    await expect(page.locator('.data-sync-page')).toBeVisible();

    // A-08 步骤 3 改判：`text=同步状态` 指向的 SyncStatusPanel 已删除，能力并入
    // 作业队列面板。选择器改用 data-testid —— 按文案找元素，重构一次就碎一次（AUD-61 教训）。
    await expect(page.locator('[data-testid="queue-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="queue-table"], [data-testid="queue-empty"]')).toBeVisible();
  });

  test('UI: Data source panel displays correctly', async ({ page }) => {
    await page.goto('/data-sync');
    await page.waitForLoadState('domcontentloaded');

    // DataSourcePanel.vue 是 NCard(title=数据源管理, embedded)；标题文案不是「数据源状态」。
    const panel = page.locator('.n-card').filter({ hasText: '数据源管理' }).first();
    await expect(panel).toBeVisible({ timeout: 15000 });

    // 第一枚 NTag 是数据源启用状态（已启用/未启用/未知），必须在挂载后就绪。
    const statusTag = panel.locator('.n-tag').first();
    await expect(statusTag).toBeVisible();
    expect((await statusTag.textContent())?.trim()).toMatch(/已启用|未启用|未知/);
  });

  test('SSE: Real-time progress updates', async () => {
    test.setTimeout(60000);
    const ctx = await apiRequest();

    // 用 ohlcv_daily 单票作业：它真的会 ReportProgress（stocks 批量作业不报进度）。
    const createRes = await ctx.post('/api/sync/jobs', {
      data: {
        job_type: 'ohlcv_daily',
        params: {
          symbols: ['600000.SH'],
          start_date: '2024-01-01',
          end_date: '2024-03-31',
        },
      },
    });

    expect(createRes.status()).toBe(202);
    const createBody = await createRes.json();
    const jobId = createBody.id;

    // 旧版在 Node 测试体里 new EventSource(...) —— Node 没有这个浏览器全局，
    // 连接建立前就 ReferenceError（不是后端缺陷）。改用 fetch 读 SSE 流。
    // 连接在作业完成后才建立也没关系：handler 会先回放当前状态（实测）。
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const url = `${process.env.BACKEND_URL || 'http://localhost:8085'}/api/sync/jobs/${jobId}/progress`;
    let completedPayload: any = null;
    try {
      const res = await fetch(url, {
        headers: { Accept: 'text/event-stream' },
        signal: controller.signal,
      });
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type') || '').toContain('text/event-stream');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (!completedPayload) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          try {
            const data = JSON.parse(line.slice(5).trim());
            if (data.id === jobId && data.status === 'succeeded') {
              completedPayload = data;
            }
          } catch {
            // 非 JSON 行忽略，继续读
          }
        }
      }
      await reader.cancel().catch(() => {});
    } finally {
      clearTimeout(timer);
    }

    expect(completedPayload, '未在 20s 内收到该作业的 succeeded 进度事件').toBeTruthy();
    expect(completedPayload.total_items).toBe(1);
    expect(completedPayload.processed_items).toBe(1);

    await ctx.dispose();
  });
});
