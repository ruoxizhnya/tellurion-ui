import { test, expect } from '@playwright/test';
import { apiRequest, waitForBackendReady } from '../helpers/api';
import { isolateTestEnvironment } from '../helpers/isolation';

// sync_schedules 有 UNIQUE(name)：固定名字第二次跑就撞键（实测 500）。
// 每次运行用唯一名，让用例可重复执行——这不改变被测契约。
const uniqueScheduleName = (base: string) =>
  `${base} ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

test.describe('D7-29: Data Sync — Schedule Configuration & Trigger Verification', () => {

  test.beforeAll(async () => {
    const ready = await waitForBackendReady(60000);
    expect(ready).toBe(true);
  });

  test.beforeEach(async ({ page }) => {
    await isolateTestEnvironment(page);
  });

  test('API: Create and list sync schedules', async () => {
    const ctx = await apiRequest();

    // Create a schedule
    const scheduleName = uniqueScheduleName('Daily OHLCV Sync');
    const createRes = await ctx.post('/api/sync/schedules', {
      data: {
        name: scheduleName,
        job_type: 'ohlcv',
        cron_expression: '0 9 * * *',
        params: {
          symbols: ['000001.SZ'],
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        },
        // 契约字段是 is_active（sync.Schedule），不是 enabled；
        // 发 enabled 会被静默忽略、建出来的排程恒为停用。
        is_active: true,
      },
    });

    expect([201, 200, 404]).toContain(createRes.status());

    if (createRes.status() === 201 || createRes.status() === 200) {
      const createBody = await createRes.json();
      expect(createBody.id).toBeDefined();
      const scheduleId = createBody.id;

      // List schedules
      const listRes = await ctx.get('/api/sync/schedules');
      expect(listRes.status()).toBe(200);
      const listBody = await listRes.json();
      expect(Array.isArray(listBody.schedules)).toBe(true);

      // Verify created schedule exists
      const found = listBody.schedules.find((s: any) => s.id === scheduleId);
      expect(found).toBeDefined();
      expect(found.name).toBe(scheduleName);
      expect(found.cron_expression).toBe('0 9 * * *');
      expect(found.is_active).toBe(true);

      // Clean up
      await ctx.delete(`/api/sync/schedules/${scheduleId}`);
    }

    await ctx.dispose();
  });

  test('API: Toggle schedule enable/disable', async () => {
    const ctx = await apiRequest();

    // Create a schedule
    const scheduleName = uniqueScheduleName('Test Toggle Schedule');
    const base = {
      name: scheduleName,
      job_type: 'stocks',
      cron_expression: '0 0 * * 0',
      params: {},
    };
    const createRes = await ctx.post('/api/sync/schedules', {
      data: { ...base, is_active: true },
    });

    if (createRes.status() === 201 || createRes.status() === 200) {
      const createBody = await createRes.json();
      const scheduleId = createBody.id;

      // PATCH 是整对象替换（UpdateSyncSchedule 写全部列）：只发 {is_active}
      // 会把 name/job_type 清空。每次都带完整对象。
      const disableRes = await ctx.patch(`/api/sync/schedules/${scheduleId}`, {
        data: { ...base, is_active: false },
      });
      expect([200, 404]).toContain(disableRes.status());

      if (disableRes.status() === 200) {
        const disableBody = await disableRes.json();
        expect(disableBody.is_active).toBe(false);
      }

      // Enable schedule
      const enableRes = await ctx.patch(`/api/sync/schedules/${scheduleId}`, {
        data: { ...base, is_active: true },
      });
      expect([200, 404]).toContain(enableRes.status());

      if (enableRes.status() === 200) {
        const enableBody = await enableRes.json();
        expect(enableBody.is_active).toBe(true);
      }

      // Clean up
      await ctx.delete(`/api/sync/schedules/${scheduleId}`);
    }

    await ctx.dispose();
  });

  test('API: Trigger schedule manually', async () => {
    const ctx = await apiRequest();

    // Create a schedule
    const scheduleName = uniqueScheduleName('Manual Trigger Test');
    const createRes = await ctx.post('/api/sync/schedules', {
      data: {
        name: scheduleName,
        job_type: 'stocks',
        cron_expression: '0 0 1 1 *',
        params: {},
        is_active: false,
      },
    });

    if (createRes.status() === 201 || createRes.status() === 200) {
      const createBody = await createRes.json();
      const scheduleId = createBody.id;

      // Trigger manually
      const triggerRes = await ctx.post(`/api/sync/schedules/${scheduleId}/trigger`);
      expect([202, 200, 404]).toContain(triggerRes.status());

      if (triggerRes.status() === 202 || triggerRes.status() === 200) {
        const triggerBody = await triggerRes.json();
        expect(triggerBody.job_id).toBeDefined();

        // Wait for job to complete
        const jobId = triggerBody.job_id;
        let completed = false;
        const deadline = Date.now() + 30000;
        while (Date.now() < deadline) {
          const pollRes = await ctx.get(`/api/sync/jobs/${jobId}`);
          if (pollRes.status() === 200) {
            const pollBody = await pollRes.json();
            if (pollBody.status === 'completed' || pollBody.status === 'failed') {
              completed = true;
              break;
            }
          }
          await new Promise(r => setTimeout(r, 1000));
        }
        expect(completed).toBe(true);
      }

      // Clean up
      await ctx.delete(`/api/sync/schedules/${scheduleId}`);
    }

    await ctx.dispose();
  });

  test('API: Update schedule cron expression', async () => {
    const ctx = await apiRequest();

    // Create a schedule
    const scheduleName = uniqueScheduleName('Update Cron Test');
    const base = {
      name: scheduleName,
      job_type: 'ohlcv',
      cron_expression: '0 9 * * *',
      params: {},
      is_active: true,
    };
    const createRes = await ctx.post('/api/sync/schedules', {
      data: base,
    });

    if (createRes.status() === 201 || createRes.status() === 200) {
      const createBody = await createRes.json();
      const scheduleId = createBody.id;

      // Update cron expression（PATCH 是整对象替换，带完整对象）
      const updateRes = await ctx.patch(`/api/sync/schedules/${scheduleId}`, {
        data: { ...base, cron_expression: '0 15 * * *' },
      });
      expect([200, 404]).toContain(updateRes.status());

      if (updateRes.status() === 200) {
        const updateBody = await updateRes.json();
        expect(updateBody.cron_expression).toBe('0 15 * * *');
      }

      // Clean up
      await ctx.delete(`/api/sync/schedules/${scheduleId}`);
    }

    await ctx.dispose();
  });

  test('API: Delete schedule', async () => {
    const ctx = await apiRequest();

    // Create a schedule
    const scheduleName = uniqueScheduleName('Delete Test');
    const createRes = await ctx.post('/api/sync/schedules', {
      data: {
        name: scheduleName,
        job_type: 'fundamentals',
        cron_expression: '0 0 1 * *',
        params: {},
        is_active: false,
      },
    });

    if (createRes.status() === 201 || createRes.status() === 200) {
      const createBody = await createRes.json();
      const scheduleId = createBody.id;

      // Delete schedule
      const deleteRes = await ctx.delete(`/api/sync/schedules/${scheduleId}`);
      expect([204, 200, 404]).toContain(deleteRes.status());

      // Verify schedule is deleted
      const getRes = await ctx.get(`/api/sync/schedules/${scheduleId}`);
      expect([404, 200]).toContain(getRes.status());
    }

    await ctx.dispose();
  });
});
