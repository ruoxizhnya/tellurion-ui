import { test, expect } from '@playwright/test';
import { apiRequest, dataApiRequest, getJsonWithBackoff, waitForBackendReady } from '../helpers/api';
import { isolateTestEnvironment } from '../helpers/isolation';

/**
 * A-06 证据质问内嵌 —— 三条断言用**真实后端**验，一条补退役面。
 *
 * 分工不是偷懒，是照着"哪条断言今天真的有真数据"划的：
 *
 * - 真数据能覆盖的：`ingest.raw`（命中态 / 404 未摄取态）、`backtest_jobs`
 *   有完成的回测（无坐标 → 无法回溯）、深链 `?content_hash=` 仍在。
 * - 原「有坐标的抽屉」两条 mock 用例已随因子读面退役**一并退役**（2026-11-12，
 *   ADR-037）：它们唯一的坐标来源是 `GET /api/factors/:name` 的 citation 五元组，
 *   而该端点已被 core 收回为 410 `factor_http_surface_retired`，`/factors` 页也
 *   按产品裁决改成了退役说明页 —— 再去 mock 一个不存在的读面，只是在测一个
 *   虚构的产品路径。抽屉的三态机本身由 `EvidenceProbe.test.ts`（11 例，逐态）
 *   守着，这里改为钉住退役说明本身（不发请求、文案含 ADR-037 落点）。
 *
 * ⚠️ 深链那条（断言 6）原先硬编码一条 2026-09 的 akshare content_hash；
 * 2026-10-23 实测该行已不在 ingest.raw（深链翻成「未摄取」），硬编码 hash
 * 会随数据消失而腐烂。现在改为**用平台唯一写门 POST /api/ingest/raw 自建
 * 夹具**（幂等：content_hash 主键 + ON CONFLICT DO NOTHING），hash 由服务端
 * 算出，不再手工维护。
 */

// 只用到一个 64 位 hash 作为"库里必然没有"的探针值。
const ABSENT_HASH = '0'.repeat(64);

/**
 * 归档一条本用例自建的 raw 记录，返回服务端算出的 content_hash。
 * 写的是 ingest.raw 这条**追加式归档**（ADR-022 的 class A），不碰 factor_cache，
 * 因此不会像假因子那样渗进真回测。
 */
async function ensureArchivedEvidence(): Promise<{ content_hash: string; dataset: string; key: string }> {
  const ctx = await dataApiRequest();
  const res = await ctx.post('/api/ingest/raw', {
    data: {
      source: 'e2e.fixture',
      dataset: 'e2e.fixture.evidence_probe',
      key: '600519.SH/2024Q1',
      as_of: '2024-09-30T00:00:00Z',
      payload: { instrument: '600519.SH', note: 'AUD-61 e2e fixture (idempotent)' },
    },
    timeout: 10000,
  });
  const body = await res.json();
  await ctx.dispose();
  expect(res.status(), `POST /api/ingest/raw 未成功：${res.status()} ${JSON.stringify(body)}`).toBe(201);
  expect(body.content_hash).toHaveLength(64);
  return body as { content_hash: string; dataset: string; key: string };
}

/** 拿一条真完成的回测 id；拿不到就让测试红，不静默 skip */
async function aCompletedBacktestID(): Promise<string> {
  const ctx = await apiRequest();
  // 只对 429 退避（本地限流桶是全进程共享的，见 helpers/api.ts 的注记）；
  // 其他状态码原样交给下面的断言去红。body 必须在 dispose 之前读。
  const res = await getJsonWithBackoff(ctx, '/api/backtest?limit=20');
  const body = res.ok()
    ? ((await res.json()) as { jobs?: { id: string; status: string }[] })
    : null;
  await ctx.dispose();
  expect(body, `GET /api/backtest 未成功（末次状态码 ${res.status()}）`).toBeTruthy();
  const hit = (body!.jobs ?? []).find((j) => j.status === 'completed');
  expect(hit, '本地库里没有 completed 回测，A-06 的回测报告用例无法取证').toBeTruthy();
  return hit!.id;
}

test.describe('A-06 证据质问内嵌', () => {
  test.beforeAll(async () => {
    expect(await waitForBackendReady(60000)).toBe(true);
  });

  test.beforeEach(async ({ page }) => {
    await isolateTestEnvironment(page);
  });

  test('断言 6：/evidence 深链仍是兜底，且真能取回原始记录', async ({ page }) => {
    const fixture = await ensureArchivedEvidence();
    await page.goto(`/evidence?content_hash=${fixture.content_hash}`);
    // 真数据：这条 raw 记录由本用例经平台写门归档，content_hash 由服务端算出。
    await expect(page.locator('main')).toContainText(fixture.dataset);
    await expect(page.locator('main')).toContainText(fixture.content_hash);
    await expect(page.locator('main')).not.toContainText('未摄取');
  });

  test('断言 5：404 是「未摄取」警示态，不是查询失败（真后端）', async ({ page }) => {
    await page.goto(`/evidence?content_hash=${ABSENT_HASH}`);
    await expect(page.locator('main')).toContainText('未摄取');
    await expect(page.locator('main')).not.toContainText('查询失败');
  });

  test('断言 1+4：回测报告的每个指标都挂着质问入口，且「无法回溯」不点也看得见', async ({ page }) => {
    const id = await aCompletedBacktestID();
    await page.goto(`/backtest?id=${id}`);

    const probes = page.locator('[data-testid="ev-probe-trigger"]');
    await expect(probes).toHaveCount(5);

    // 关键：文案是**渲染出来的**，不是 hover 才出现的 title
    for (const probe of await probes.all()) {
      await expect(probe).toContainText('无法回溯');
    }

    // 为什么是 5 而不是"页面上所有数字"：同页还有个「详细指标」区块
    // （DetailMetrics.vue），但 `GET /api/backtest/:id/report` 的响应里
    // **没有 metrics 这个键**，前端也从不给它赋值 ⇒ 它的 v-if 恒假、整块永不渲染。
    // 那是个死组件，已另记（见 TASKS.md A-06 节）。给死代码加质问入口是
    // 为不存在的场景写代码，所以这里只覆盖真的会渲染出来的那 5 个。
    await expect(page.locator('.metrics-detail-grid')).toHaveCount(0);
  });

  test('断言 2：点质问入口开抽屉，URL 逐字不变（真后端）', async ({ page }) => {
    const id = await aCompletedBacktestID();
    await page.goto(`/backtest?id=${id}`);
    const before = page.url();

    await page.locator('[data-testid="ev-probe-trigger"]').first().click();
    await expect(page.locator('.n-drawer')).toBeVisible();

    // 抽屉里说的是"为什么回溯不了"，而不是一个空壳
    await expect(page.locator('.n-drawer')).toContainText('没有携带证据坐标');
    expect(page.url()).toBe(before);
  });

  test('因子证据坐标：按 ADR-037 退役后只留说明页，且不再请求 /api/factors', async ({ page }) => {
    const factorRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/api/factors')) factorRequests.push(req.url());
    });

    await page.goto('/factors');

    const notice = page.locator('[data-testid="factor-retired-notice"]');
    await expect(notice).toBeVisible();
    await expect(notice).toContainText('该能力已按 ADR-037 退役');
    await expect(notice).toContainText('因子值由 core 按需求值');
    await expect(page.locator('main')).toContainText('tellurion-docs:docs/adr/adr-037-factor-value-ownership.md');
    await expect(page.locator('main')).toContainText('factor_http_surface_retired');

    // 退役的判据是「不再有查询入口 + 不再撞 410」，不是「文案里有退役两个字」。
    await expect(page.locator('input[placeholder^="因子"]')).toHaveCount(0);
    expect(factorRequests).toEqual([]);
  });
});
