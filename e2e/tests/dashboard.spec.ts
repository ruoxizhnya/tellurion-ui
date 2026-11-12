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
    // 目标 IA（user-flows.md §3.2）共 12 项；差一项就说明导航少渲染了入口。
    const expected = [
      'nav-item-home',
      'nav-item-explore',
      'nav-item-evidence',
      'nav-item-backtest',
      'nav-item-backtest-compare',
      'nav-item-strategy-lab',
      'nav-item-strategy-builder',
      'nav-item-copilot',
      'nav-item-factors',
      'nav-item-screener',
      'nav-item-data-sync',
      'nav-item-alerts',
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

    // NavTiles.vue 共 5 张 tile（AUD-63 的 testid 面）；href 必须指向各自路由。
    const tiles = page.locator('[data-testid^="nav-tile-"]');
    await expect(tiles).toHaveCount(5);

    const expected: Array<[string, string]> = [
      ['nav-tile-backtest', '/backtest'],
      ['nav-tile-screener', '/screener'],
      ['nav-tile-strategy-lab', '/strategy-lab'],
      ['nav-tile-copilot', '/copilot'],
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
});
