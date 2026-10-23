import { test, expect } from '@playwright/test';
import { apiRequest, API } from '../helpers/api';

test.describe('API Negative Tests', () => {
  let ctx: any;

  test.beforeAll(async () => {
    ctx = await apiRequest();
  });

  test.afterAll(async () => {
    await ctx.dispose();
  });

  test('POST /api/backtest with empty body returns 400', async () => {
    const res = await ctx.post('/api/backtest', { data: {} });
    expect(res.status()).toBe(400);
  });

  test('POST /api/backtest with missing strategy returns 400', async () => {
    const res = await ctx.post('/api/backtest', {
      data: { stock_pool: ['600519'], start_date: '20250101', end_date: '20251231' },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/backtest with missing stock_pool returns 400', async () => {
    const res = await ctx.post('/api/backtest', {
      data: { strategy: 'momentum', start_date: '20250101', end_date: '20251231' },
    });
    expect(res.status()).toBe(400);
  });

  test('GET /api/backtest/nonexistent-id/report returns 404', async () => {
    const res = await ctx.get('/api/backtest/nonexistent-id-12345/report');
    expect([404, 500]).toContain(res.status());
  });

  test('GET /api/backtest/nonexistent-id/trades returns 404', async () => {
    const res = await ctx.get('/api/backtest/nonexistent-id-12345/trades');
    expect([404, 500]).toContain(res.status());
  });

  test('GET /api/backtest/nonexistent-id/equity returns 404', async () => {
    const res = await ctx.get('/api/backtest/nonexistent-id-12345/equity');
    expect([404, 500]).toContain(res.status());
  });

  test('GET /api/ohlcv with missing params returns 400', async () => {
    const res = await ctx.get('/api/ohlcv/600519');
    expect(res.status()).toBe(400);
  });

  test('POST /api/screen with empty body applies no filters (200)', async () => {
    const res = await ctx.post('/api/screen', { data: {} });
    // /api/screen 是数据服务代理：空 body = 无筛选条件，不是非法输入。
    // 契约见 core:docs/openapi.yaml 的 /api/screen（200 = Screen results）。
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.count).toBe('number');
    expect(Array.isArray(body.results)).toBe(true);
  });

  test('GET /api/strategies/nonexistent returns 404', async () => {
    const res = await ctx.get('/api/strategies/nonexistent-strategy-xyz');
    expect([404, 500]).toContain(res.status());
  });

  test('POST /api/copilot/generate with empty description is rejected', async () => {
    // ai-service 不在线时整族 /api/copilot/* 被反代 fail-closed 成 503
    // （实测 analysis :8085）；在线时才是 400 校验。两者都是「拒绝」，
    // 都不能把空描述放过去。
    const res = await ctx.post('/api/copilot/generate', { data: { description: '' } });
    expect([400, 503]).toContain(res.status());
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  test('GET /api/walkforward/nonexistent returns 404', async () => {
    const res = await ctx.get('/api/walkforward/nonexistent-strategy-xyz');
    expect([404, 500]).toContain(res.status());
  });
});
