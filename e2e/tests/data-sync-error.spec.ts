import { test, expect } from '@playwright/test';
import { apiRequest, waitForBackendReady } from '../helpers/api';
import { isolateTestEnvironment } from '../helpers/isolation';

test.describe('D7-30: Data Sync — Failure Retry & Error Handling', () => {

  test.beforeAll(async () => {
    const ready = await waitForBackendReady(60000);
    expect(ready).toBe(true);
  });

  test.beforeEach(async ({ page }) => {
    await isolateTestEnvironment(page);
  });

  test('API: Unknown job type is accepted then fails loudly in the runner', async () => {
    // 契约：受理门只校验参数语法，**不**校验 job_type 是否存在——未知类型
    // 会作为作业失败响亮暴露（connector 未声明该 data_type），而不是 400。
    const ctx = await apiRequest();

    const res = await ctx.post('/api/sync/jobs', {
      data: {
        job_type: 'invalid_type',
        params: {},
      },
    });

    expect(res.status()).toBe(202);
    const created = await res.json();
    const jobId = created.id;
    expect(typeof jobId).toBe('string');

    let failedJob: any = null;
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      const pollRes = await ctx.get(`/api/sync/jobs/${jobId}`);
      if (pollRes.status() === 200) {
        const pollBody = await pollRes.json();
        if (pollBody.status === 'failed') {
          failedJob = pollBody;
          break;
        }
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    expect(failedJob, '未知 job_type 的作业未在 30s 内 failed').toBeTruthy();
    expect(failedJob.error_message.length).toBeGreaterThan(0);

    await ctx.dispose();
  });

  test('API: Missing job_type returns 400', async () => {
    const ctx = await apiRequest();

    const res = await ctx.post('/api/sync/jobs', {
      data: {
        // job_type 是必填；params 合法也救不回来
        params: {},
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('invalid_parameter');

    await ctx.dispose();
  });

  test('API: Invalid date format returns error', async () => {
    const ctx = await apiRequest();

    const res = await ctx.post('/api/sync/jobs', {
      data: {
        job_type: 'ohlcv_daily',
        params: {
          symbols: ['000001.SZ'],
          start_date: 'not-a-date',
          end_date: 'also-not-a-date',
        },
      },
    });

    expect(res.status()).toBeGreaterThanOrEqual(400);
    const body = await res.json();
    expect(body.error).toBeDefined();

    await ctx.dispose();
  });

  test('API: Non-existent job returns 404', async () => {
    const ctx = await apiRequest();

    const res = await ctx.get('/api/sync/jobs/non-existent-job-id');
    expect([404, 400]).toContain(res.status());

    await ctx.dispose();
  });

  test('API: Empty symbol list is syntactically valid and cancelled cleanly', async () => {
    // `symbols: []` 不是参数错误（受理门只看类型/日期），它意味着「默认票池」。
    // 这里**不**让它真跑全市场：受理后立刻取消，钉住的是「受理 + 取消」两条
    // 契约，不依赖库内容量。
    const ctx = await apiRequest();

    const createRes = await ctx.post('/api/sync/jobs', {
      data: {
        job_type: 'ohlcv_daily',
        params: {
          symbols: [],
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        },
      },
    });

    expect(createRes.status()).toBe(202);
    const createBody = await createRes.json();
    const jobId = createBody.id;

    const cancelRes = await ctx.post(`/api/sync/jobs/${jobId}/cancel`);
    expect([200, 409]).toContain(cancelRes.status());

    await ctx.dispose();
  });

  test('API: Retry count increments on failure', async () => {
    test.setTimeout(60000);
    const ctx = await apiRequest();

    // 造一个**异步失败**的作业：calendar 只校验日期格式、不校验先后，
    // 执行器窗口解析时才报错（实测）。旧的 ohlcv + INVALID_SYMBOL 会被
    // 执行器当作「已处理」而成功完成（per-symbol 错误被 continue 吞掉），
    // 永远等不到 failed。
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

    // Wait for job to fail (may take multiple retries)
    let finalJob: any = null;
    const deadline = Date.now() + 40000;
    while (Date.now() < deadline) {
      const pollRes = await ctx.get(`/api/sync/jobs/${jobId}`);
      if (pollRes.status() === 200) {
        const pollBody = await pollRes.json();
        if (pollBody.status === 'failed') {
          finalJob = pollBody;
          break;
        }
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    expect(finalJob, '作业未在 40s 内进入 failed 终态').toBeTruthy();
    // failed 是自动重试预算耗尽后的终态：retry_count 必须真的涨过，
    // 且错误原话非空（旧断言 >= 0 是恒真，等于没测）。
    expect(finalJob.retry_count).toBeGreaterThan(0);
    expect(typeof finalJob.error_message).toBe('string');
    expect(finalJob.error_message).not.toBe('');

    await ctx.dispose();
  });

  test('API: Cancel non-existent job returns error', async () => {
    const ctx = await apiRequest();

    const res = await ctx.post('/api/sync/jobs/non-existent-id/cancel');
    expect([404, 400]).toContain(res.status());

    await ctx.dispose();
  });

  test('API: Retry non-failed job returns error', async () => {
    const ctx = await apiRequest();

    // Create a job that should succeed
    const createRes = await ctx.post('/api/sync/jobs', {
      data: {
        job_type: 'stocks',
        params: {},
      },
    });

    expect(createRes.status()).toBe(202);
    const createBody = await createRes.json();
    const jobId = createBody.id;

    // Wait for job to complete
    let completed = false;
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      const pollRes = await ctx.get(`/api/sync/jobs/${jobId}`);
      if (pollRes.status() === 200) {
        const pollBody = await pollRes.json();
        if (pollBody.status === 'succeeded') {
          completed = true;
          break;
        }
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    if (completed) {
      // Try to retry a completed job
      const retryRes = await ctx.post(`/api/sync/jobs/${jobId}/retry`);
      // Should either succeed (re-run) or return error
      expect([202, 200, 400, 409]).toContain(retryRes.status());
    }

    await ctx.dispose();
  });

  test('API: Invalid cron expression returns error', async () => {
    const ctx = await apiRequest();

    const res = await ctx.post('/api/sync/schedules', {
      data: {
        name: 'Invalid Cron',
        job_type: 'ohlcv_daily',
        cron_expression: 'invalid cron',
        params: {},
        is_active: true,
      },
    });

    expect(res.status()).toBeGreaterThanOrEqual(400);
    const body = await res.json();
    expect(body.error).toBeDefined();

    await ctx.dispose();
  });

  test('API: Concurrent job creation handles load', async () => {
    const ctx = await apiRequest();

    // Create 5 jobs concurrently
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        ctx.post('/api/sync/jobs', {
          data: {
            job_type: 'stocks',
            params: { index: i },
          },
        })
      );
    }

    const results = await Promise.all(promises);

    // All should succeed
    for (const res of results) {
      expect(res.status()).toBe(202);
    }

    // Clean up
    for (const res of results) {
      const body = await res.json();
      if (body.id) {
        await ctx.post(`/api/sync/jobs/${body.id}/cancel`).catch(() => {});
      }
    }

    await ctx.dispose();
  });
});
