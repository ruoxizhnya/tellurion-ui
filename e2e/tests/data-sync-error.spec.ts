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

  test('API: Invalid job type returns error', async () => {
    const ctx = await apiRequest();

    const res = await ctx.post('/api/sync/jobs', {
      data: {
        type: 'invalid_type',
        params: {},
      },
    });

    expect(res.status()).toBeGreaterThanOrEqual(400);
    const body = await res.json();
    expect(body.error).toBeDefined();

    await ctx.dispose();
  });

  test('API: Missing required params returns error', async () => {
    const ctx = await apiRequest();

    const res = await ctx.post('/api/sync/jobs', {
      data: {
        type: 'ohlcv',
        // Missing required params: symbols, start_date, end_date
        params: {},
      },
    });

    expect(res.status()).toBeGreaterThanOrEqual(400);
    const body = await res.json();
    expect(body.error).toBeDefined();

    await ctx.dispose();
  });

  test('API: Invalid date format returns error', async () => {
    const ctx = await apiRequest();

    const res = await ctx.post('/api/sync/jobs', {
      data: {
        type: 'ohlcv',
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

  test('API: Job with empty symbol list fails gracefully', async () => {
    const ctx = await apiRequest();

    const createRes = await ctx.post('/api/sync/jobs', {
      data: {
        type: 'ohlcv',
        params: {
          symbols: [],
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        },
      },
    });

    // Should accept the job but fail during execution
    expect([202, 400]).toContain(createRes.status());

    if (createRes.status() === 202) {
      const createBody = await createRes.json();
      const jobId = createBody.job_id;

      // Wait for job to fail
      let failed = false;
      const deadline = Date.now() + 30000;
      while (Date.now() < deadline) {
        const pollRes = await ctx.get(`/api/sync/jobs/${jobId}`);
        if (pollRes.status() === 200) {
          const pollBody = await pollRes.json();
          if (pollBody.status === 'failed' || pollBody.status === 'completed') {
            failed = true;
            break;
          }
        }
        await new Promise(r => setTimeout(r, 1000));
      }
      expect(failed).toBe(true);
    }

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
        type: 'stocks',
        params: {},
      },
    });

    expect(createRes.status()).toBe(202);
    const createBody = await createRes.json();
    const jobId = createBody.job_id;

    // Wait for job to complete
    let completed = false;
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      const pollRes = await ctx.get(`/api/sync/jobs/${jobId}`);
      if (pollRes.status() === 200) {
        const pollBody = await pollRes.json();
        if (pollBody.status === 'completed') {
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
        job_type: 'ohlcv',
        cron_expression: 'invalid cron',
        params: {},
        enabled: true,
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
            type: 'stocks',
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
      if (body.job_id) {
        await ctx.post(`/api/sync/jobs/${body.job_id}/cancel`).catch(() => {});
      }
    }

    await ctx.dispose();
  });
});
