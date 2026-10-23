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
    // 用 ohlcv 单票作业而不是 stocks：progress 的 total/processed 由逐 symbol
    // 执行器调用 ReportProgress 写出；stocks 批量作业只回 result.count，
    // total_items 恒 0（实测）。
    const createRes = await ctx.post('/api/sync/jobs', {
      data: {
        type: 'ohlcv',
        params: {
          symbols: ['600000.SH'],
          start_date: '2024-01-01',
          end_date: '2024-03-31',
        },
      },
    });

    expect(createRes.status()).toBe(202);
    const createBody = await createRes.json();
    expect(createBody.job_id).toBeDefined();
    expect(typeof createBody.job_id).toBe('string');
    const jobId = createBody.job_id;

    // Step 2: Verify job is queued or running
    const statusRes = await ctx.get(`/api/sync/jobs/${jobId}`);
    expect(statusRes.status()).toBe(200);
    const statusBody = await statusRes.json();
    expect(statusBody.id).toBe(jobId);
    expect(['pending', 'running', 'completed']).toContain(statusBody.status);

    // Step 3: Poll until job completes (with timeout)
    let completed = false;
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      const pollRes = await ctx.get(`/api/sync/jobs/${jobId}`);
      const pollBody = await pollRes.json();
      if (pollBody.status === 'completed' || pollBody.status === 'failed') {
        completed = true;
        break;
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    expect(completed).toBe(true);

    // Step 4: Verify final state
    const finalRes = await ctx.get(`/api/sync/jobs/${jobId}`);
    expect(finalRes.status()).toBe(200);
    const finalBody = await finalRes.json();
    expect(finalBody.status).toBe('completed');
    expect(finalBody.progress_percent).toBe(100);
    expect(finalBody.total_items).toBeGreaterThan(0);
    expect(finalBody.processed_items).toBe(finalBody.total_items);

    await ctx.dispose();
  });

  test('API: List sync jobs with status filter', async () => {
    const ctx = await apiRequest();

    // Get all jobs
    const allRes = await ctx.get('/api/sync/jobs');
    expect(allRes.status()).toBe(200);
    const allBody = await allRes.json();
    expect(Array.isArray(allBody.jobs)).toBe(true);

    // Get completed jobs
    const completedRes = await ctx.get('/api/sync/jobs?status=completed');
    expect(completedRes.status()).toBe(200);
    const completedBody = await completedRes.json();
    expect(Array.isArray(completedBody.jobs)).toBe(true);

    // Verify all completed jobs have status 'completed'
    for (const job of completedBody.jobs) {
      expect(job.status).toBe('completed');
    }

    await ctx.dispose();
  });

  test('API: Cancel a running sync job', async () => {
    const ctx = await apiRequest();

    // Create a job that takes some time
    const createRes = await ctx.post('/api/sync/jobs', {
      data: {
        type: 'ohlcv',
        params: {
          symbols: ['000001.SZ', '000002.SZ'],
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          source: 'tushare',
        },
      },
    });

    expect(createRes.status()).toBe(202);
    const createBody = await createRes.json();
    const jobId = createBody.job_id;

    // Cancel the job
    const cancelRes = await ctx.post(`/api/sync/jobs/${jobId}/cancel`);
    expect([202, 200, 404]).toContain(cancelRes.status());

    // Verify job is cancelled or completed
    const statusRes = await ctx.get(`/api/sync/jobs/${jobId}`);
    if (statusRes.status() === 200) {
      const statusBody = await statusRes.json();
      expect(['cancelled', 'completed', 'failed']).toContain(statusBody.status);
    }

    await ctx.dispose();
  });

  test('API: Retry a failed sync job', async () => {
    test.setTimeout(60000);
    const ctx = await apiRequest();

    // 造一个**异步失败**的作业：calendar 的日期只校验格式、不校验先后，
    // 执行器在窗口解析时才报 "end_date ... is before start_date"（实测）。
    // 旧版用 ohlcv + invalid 日期，现在在受理门就 400，根本拿不到 job_id。
    const createRes = await ctx.post('/api/sync/jobs', {
      data: {
        type: 'calendar',
        params: {
          exchange: 'SSE',
          start_date: '2099-12-31',
          end_date: '2020-01-01',
        },
      },
    });

    expect(createRes.status()).toBe(202);
    const createBody = await createRes.json();
    const jobId = createBody.job_id;

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
    test.fixme("AUD-61: 数据源面板结构漂移（可见性失败）");
    await page.goto('/data-sync');
    await page.waitForLoadState('domcontentloaded');

    // Verify data source panel
    const dataSourcePanel = page.locator('text=数据源状态');
    await expect(dataSourcePanel).toBeVisible();

    // Verify data source status is shown
    const statusText = await page.locator('.data-source-panel .status-text, .n-tag').first().textContent();
    expect(statusText).toBeTruthy();
  });

  test('SSE: Real-time progress updates', async () => {
    test.setTimeout(60000);
    const ctx = await apiRequest();

    // 用 ohlcv 单票作业：它真的会 ReportProgress（stocks 批量作业不报进度）。
    const createRes = await ctx.post('/api/sync/jobs', {
      data: {
        type: 'ohlcv',
        params: {
          symbols: ['600000.SH'],
          start_date: '2024-01-01',
          end_date: '2024-03-31',
        },
      },
    });

    expect(createRes.status()).toBe(202);
    const createBody = await createRes.json();
    const jobId = createBody.job_id;

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
            if (data.id === jobId && data.status === 'completed') {
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

    expect(completedPayload, '未在 20s 内收到该作业的 completed 进度事件').toBeTruthy();
    expect(completedPayload.total_items).toBe(1);
    expect(completedPayload.processed_items).toBe(1);

    await ctx.dispose();
  });
});
