import { test, expect } from '@playwright/test';
import { waitForBackendReady } from '../helpers/api';
import { isolateTestEnvironment } from '../helpers/isolation';

test.describe('Dashboard Page (Vue SPA)', () => {

  test.beforeAll(async () => {
    const ready = await waitForBackendReady(60000);
    expect(ready).toBe(true);
  });

  test.beforeEach(async ({ page }) => {
    await isolateTestEnvironment(page);
  });

  test('page loads successfully with correct title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.dashboard-page', { timeout: 15000 });

    await expect(page).toHaveTitle(/控制台.*Quant Lab/);

    const greeting = page.locator('.greeting');
    await expect(greeting).toBeVisible();
  });

  test('sidebar navigation renders with all items', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.dashboard-page', { timeout: 15000 });
    await page.waitForSelector('[data-testid="sidebar-nav"]', { timeout: 10000 });

    // AUD-63：侧栏每项的锚点由 AppSidebar.vue 的 navTestId() 生成。
    // 目标 IA（user-flows.md §3.2）共 14 项：A-13 删「证据质问」独立入口
    // （/evidence 路由与页面保留作深链）、纸交易移入系统组；
    // A-10 新增 走向与批量 / 合规 / 系统管理，B-04 把 策略编辑器 / 策略 Copilot
    // 并入「策略库」一项，A-09 新增 纸交易，B-02 新增 审阅台。
    const expected = [
      'nav-item-home',
      'nav-item-explore',
      'nav-item-review',
      'nav-item-backtest',
      'nav-item-backtest-compare',
      'nav-item-walkforward',
      'nav-item-strategy-lab',
      'nav-item-paper-trading',
      'nav-item-factors',
      'nav-item-screener',
      'nav-item-data-sync',
      'nav-item-alerts',
      'nav-item-compliance',
      'nav-item-system-admin',
    ];
    const navItems = page.locator('[data-testid^="nav-item-"]');
    await expect(navItems).toHaveCount(expected.length);
    for (const id of expected) {
      await expect(page.getByTestId(id)).toBeVisible();
    }
  });

  test('header shows logo, API status and clock', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.app-header', { timeout: 15000 });

    await expect(page.locator('.logo')).toContainText('Quant Lab');

    const apiTag = page.locator('.app-header .n-tag').first();
    await expect(apiTag).toContainText(/API/);

    const timeTag = page.locator('.app-header .n-tag').nth(1);
    await expect(timeTag).toBeVisible();
    const timeText = await timeTag.textContent();
    expect(timeText?.trim().length).toBeGreaterThan(0);
  });

  test('metrics cards render with labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.dashboard-page', { timeout: 15000 });

    // 市场概览 = MarketMetrics.vue（AUD-63 的 testid 面）。有读数时 4 格；
    // 无读数时必须是 DATA-07 的显式空态，不得用 '-' / 0 伪造四格。
    const metrics = page.getByTestId('market-metrics');
    const empty = page.getByTestId('market-metrics-empty');
    await expect(metrics.or(empty)).toBeVisible({ timeout: 15000 });

    if (await metrics.isVisible()) {
      await expect(metrics.locator('.metric-item')).toHaveCount(4);
      const labels: Array<[string, string]> = [
        ['market-metric-close', '收盘价'],
        ['market-metric-pct', '涨跌幅'],
        ['market-metric-volume', '成交量'],
        ['market-metric-amount', '成交额'],
      ];
      for (const [id, label] of labels) {
        await expect(page.getByTestId(id)).toContainText(label);
      }
    } else {
      await expect(empty).toContainText(/无指数数据|读数失败/);
      await expect(page.getByTestId('market-metric-close')).toHaveCount(0);
    }
  });

  test('quick backtest form renders correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.dashboard-page', { timeout: 15000 });

    // QuickBacktest.vue 是 n-card(title=快速回测)，没有 .quick-bt-card 外层类。
    const card = page.locator('.n-card').filter({ hasText: '快速回测' }).first();
    await expect(card).toBeVisible();
    await expect(card).toContainText('快速回测');

    await expect(card.getByPlaceholder('600000.SH')).toBeVisible();
    await expect(card.locator('.n-date-picker')).toHaveCount(2);
    await expect(card.locator('.n-select')).toHaveCount(1);

    // 表单里只有「运行」这一枚按钮；用 role 锚定，避免与页头/侧栏按钮串味。
    const runBtn = card.getByRole('button', { name: /运行/ });
    await expect(runBtn).toBeVisible();
  });

  test('navigation tiles are present and link to correct routes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('[data-testid="nav-tiles"]', { timeout: 15000 });

    // NavTiles.vue 共 4 张 tile（AUD-63 的 testid 面）；href 必须指向各自路由。
    // B-04 后 Copilot 并入策略库 tab，不再单独占一张 tile。
    const tiles = page.locator('[data-testid^="nav-tile-"]');
    await expect(tiles).toHaveCount(4);

    const expected: Array<[string, string]> = [
      ['nav-tile-backtest', '/backtest'],
      ['nav-tile-screener', '/screener'],
      ['nav-tile-strategy-lab', '/strategy-lab'],
      ['nav-tile-batch', '/dashboard?tab=batch'],
    ];
    for (const [id, href] of expected) {
      const tile = page.getByTestId(id);
      await expect(tile).toBeVisible();
      await expect(tile).toHaveAttribute('href', href);
    }
  });

  test('greeting text shows time-appropriate message', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.greeting', { timeout: 15000 });

    const greeting = page.locator('.greeting');
    await expect(greeting).toBeVisible();
    const text = await greeting.textContent();
    expect(text).toMatch(/(早上好|中午好|下午好|晚上好)/);
  });

  test('history card 渲染真实回测记录：存在记录时列表结构完整，空态不出现', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.dashboard-page', { timeout: 15000 });

    // ConsoleHistory.vue 的数据来自 `GET /api/backtest/jobs`（backtest store 的
    // loadHistoryFromDB），不是 localStorage —— 隔离环境清 localStorage 只清掉
    // 本地缓存，库里已完成的回测仍会渲染。旧断言直接要「暂无历史记录」，前提早就
    // 不成立（库里已有 c31722e0 / 2e1f22e9 等完成记录），现在改成判「有记录时
    // 渲染得对」，同时保留空态**不许**出现的反向断言。
    const card = page.locator('.n-card').filter({ hasText: '控制台历史' }).first();
    await expect(card).toBeVisible();
    await expect(card).toContainText('控制台历史');

    const rows = card.locator('.n-list-item');
    await expect(rows.first()).toBeVisible({ timeout: 15000 });
    expect(await rows.count()).toBeGreaterThan(0);
    await expect(card.getByText('暂无历史记录')).toHaveCount(0);

    // 单行结构：标题是「票池 · 策略」，前缀有一枚状态标识，右侧有「查看」。
    // 这三样任一缺失都说明这一行没渲染完，而不是"样式不同"。
    const first = rows.first();
    await expect(first.locator('.n-thing-header__title')).toContainText('·');
    await expect(first.locator('.n-tag').first()).toBeVisible();
    await expect(first.getByRole('button', { name: '查看' })).toBeVisible();
  });

  test('no naive-ui provider errors in console', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.greeting', { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    const providerErrors = errors.filter(e =>
      e.includes('n-message-provider') ||
      e.includes('n-dialog-provider') ||
      e.includes('n-notification-provider') ||
      e.includes('n-config-provider')
    );
    expect(providerErrors.length).toBe(0);
  });

  /**
   * A-15 晨间简报（真栈）。
   *
   * 真栈上 `/api/review/pending` 的 ai_explore 源是 available，读数就是真实的 0 ——
   * 这不是「伪造 0」，而是「有源答话、确实没有待审阅」。未知态（源不可用）在
   * 下面的 fixture 用例与单测里取证；这里只钉「读数只可能是数字或 —，且 — 必有原因」。
   */
  test('晨间简报四块可见，读数为数字或「—」且「—」必须给出原因', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('[data-testid="morning-briefing"]', { timeout: 15000 });

    for (const id of ['brief-pending', 'brief-calibration', 'brief-failure', 'brief-recent']) {
      await expect(page.getByTestId(id)).toBeVisible();
    }

    const pendingValue = page.getByTestId('brief-pending-value');
    await expect(pendingValue).toHaveText(/^(\d+|—)$/, { timeout: 15000 });
    if ((await pendingValue.textContent())?.trim() === '—') {
      await expect(page.getByTestId('brief-pending-note')).toHaveText(
        /读面未接通|无配置源|不可用源/,
      );
    }

    await expect(page.getByTestId('brief-calibration-value')).toHaveText(
      /^(\d+\.\d 个百分点|—)$/,
    );
  });

  /**
   * A-15 fixture 态：真栈没有「待审阅未知 / 样本不足 / 失败候选」这三种数据，
   * 用 route 冻结取证（不写库、不改后端）。
   */
  test('晨间简报：待审阅未知不画 0、校准样本不足、失败候选只给原因（fixture）', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('ql.lastRunId', 'run-e2e-brief'));
    await page.route('**/api/review/pending**', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          pending: null,
          as_of: '2026-11-13T08:00:00Z',
          sources: [
            { name: 'ai_explore', status: 'available', pending: 2 },
            { name: 'adoption', status: 'unavailable', pending: null, error: 'timeout' },
          ],
        }),
      }),
    );
    await page.route('**/api/pipeline/calibration**', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          sample_size: 12, hit_rate: 0.5, claimed_rate: 0.6, calibration_error: 0.083,
          brier_score: 0.2, pending: 0, holdout: { sample_size: 0, hit_rate: 0 }, entries: [],
        }),
      }),
    );
    await page.route('**/api/explore/runs/run-e2e-brief**', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          run_id: 'run-e2e-brief',
          running: false,
          attempts: [
            {
              seq: 1, hypothesis: '动量因子在光模块上更稳', params: {}, experiment_id: 1,
              sharpe: 1.0, ok: true,
              verdict: {
                dimensions: { statistical: 0.8, economic: 0.7, robustness: 0.6, bias: 0.5, redundancy: 0.9, causal: 0.4 },
                unassessed: [], probability: 0.4, weakest: 'causal', geometric_mean: 0.6,
                blocking: 0, challenges: [], causal: null,
              },
            },
            {
              seq: 2, hypothesis: '低波因子在银行上更稳', params: {}, experiment_id: 2,
              sharpe: 2.0, ok: true,
              verdict: {
                dimensions: { statistical: 1, economic: 1, robustness: 1, bias: 1, redundancy: 1, causal: 1 },
                unassessed: [], probability: 1, weakest: 'causal', geometric_mean: 1,
                blocking: 0, challenges: [], causal: null,
              },
            },
            {
              seq: 3, hypothesis: '反转因子在小市值上', params: {}, experiment_id: 3,
              sharpe: 0, ok: false, error: '数据缺口：交易日不足', verdict: null,
            },
          ],
        }),
      }),
    );

    await page.goto('/');
    await page.waitForSelector('[data-testid="morning-briefing"]', { timeout: 15000 });

    await expect(page.getByTestId('brief-pending-value')).toHaveText('—');
    await expect(page.getByTestId('brief-pending-note')).toContainText('adoption');
    await expect(page.getByTestId('brief-pending-note')).toContainText('不做部分求和');

    await expect(page.getByTestId('brief-calibration-value')).toHaveText('8.3 个百分点');
    await expect(page.getByTestId('brief-calibration-note')).toContainText('样本不足');

    // 平台面积排序：seq2（Sharpe 2.0 孤峰但因果满分）= 1.0 > seq1 = 0.4 > seq3 = 0
    await expect(page.locator('.recent-item')).toHaveCount(3);
    await expect(page.locator('.recent-item').first()).toHaveAttribute('data-testid', 'brief-candidate-2');
    await expect(page.getByTestId('brief-candidate-error-3')).toContainText('数据缺口');
    await expect(page.getByTestId('brief-candidate-3').locator('[data-testid="verdict-bars"]')).toHaveCount(0);

    await page.getByTestId('brief-open-2').click();
    await expect(page).toHaveURL(/\/review\?run=run-e2e-brief/);
  });
});
