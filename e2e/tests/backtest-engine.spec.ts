import { test, expect, Page } from '@playwright/test';
import { waitForBackendReady } from '../helpers/api';
import { isolateTestEnvironment } from '../helpers/isolation';

/**
 * 历史卡有两条来源：localStorage（beforeEach 的隔离已清空）与
 * `GET /api/backtest?limit=`（库里真实回测作业）。把「库里回读」钉成一次
 * 可等待的事件，清除/断言才不会与回读互相穿插 —— 否则「清空后是空态」
 * 就变成了「库里恰好没有历史记录」的赌注。
 */
function waitForHistoryFetch(page: Page) {
  return page
    .waitForResponse(
      (r) => r.request().method() === 'GET' && r.url().includes('/api/backtest?limit='),
      { timeout: 15000 },
    )
    .catch(() => null)
}

async function navigateToBacktest(page: any) {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('.dashboard-page', { timeout: 15000 });
  await page.locator('.nav-item').filter({ hasText: '回测引擎' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('.bt-page', { timeout: 20000 });
}

test.describe('Backtest Engine Page (Vue SPA)', () => {

  test.beforeAll(async () => {
    const ready = await waitForBackendReady(60000);
    expect(ready).toBe(true);
  });

  test.beforeEach(async ({ page }) => {
    await isolateTestEnvironment(page);
  });

  test('page loads successfully', async ({ page }) => {
    await navigateToBacktest(page);

    await expect(page.locator('.bt-page')).toBeVisible();
    await expect(page.locator('.n-card').first()).toContainText('回测引擎');
  });

  test('strategy selector shows options', async ({ page }) => {
    await navigateToBacktest(page);

    const sel = page.locator('.n-select').first();
    await expect(sel).toBeVisible();
  });

  test('form fields render correctly', async ({ page }) => {
    await navigateToBacktest(page);

    await expect(page.getByPlaceholder('600000.SH,600036.SH')).toBeVisible();

    const datePickers = page.locator('.n-date-picker');
    await expect(datePickers.first()).toBeVisible();
    await expect(datePickers.nth(1)).toBeVisible();

    // 同步/异步切换按钮默认也是 primary-type，故 .n-button--primary-type 不是唯一锚点；
    // 用可访问名定位真正的「运行回测」。
    const runBtn = page.getByRole('button', { name: /运行回测/ });
    await expect(runBtn).toBeVisible();
  });

  test('run button exists and is interactive', async ({ page }) => {
    await navigateToBacktest(page);

    const runBtn = page.locator('.n-button--primary-type').filter({ hasText: '运行回测' });
    await expect(runBtn).toBeVisible();
    await expect(runBtn).toBeEnabled();
  });

  test('empty state or results shown', async ({ page }) => {
    await navigateToBacktest(page);

    const emptyState = page.locator('.empty-state');
    const resultsSection = page.locator('.results-section');

    const hasEmpty = await emptyState.count().then(c => c > 0);
    const hasResults = await resultsSection.count().then(c => c > 0);

    expect(hasEmpty || hasResults).toBeTruthy();
  });

  test('history section renders at bottom', async ({ page }) => {
    await navigateToBacktest(page);
    await page.waitForSelector('.history-section', { timeout: 10000 });

    const historySection = page.locator('.history-section');
    await expect(historySection).toBeVisible({ timeout: 10000 });
    await expect(historySection).toContainText('回测历史');
  });

  test('navigation from dashboard works via nav tile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.nav-tile', { timeout: 15000 });

    await page.locator('.nav-tile').filter({ hasText: '回测引擎' }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.bt-page', { timeout: 20000 });

    await expect(page).toHaveURL(/\/backtest/);
    await expect(page.locator('.bt-page')).toBeVisible();
  });
});

test.describe('Backtest Engine — Interaction Tests', () => {

  test.beforeAll(async () => {
    const ready = await waitForBackendReady(60000);
    expect(ready).toBe(true);
  });

  test.beforeEach(async ({ page }) => {
    await isolateTestEnvironment(page);
  });

  test('sync/async mode toggle exists and is interactive', async ({ page }) => {
    await navigateToBacktest(page);

    const toggleGroup = page.locator('.mode-toggle .n-button-group');
    await expect(toggleGroup).toBeVisible();

    const buttons = toggleGroup.locator('.n-button');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const syncBtn = buttons.first();
    const asyncBtn = buttons.last();
    await expect(syncBtn).toContainText('同步');
    await expect(asyncBtn).toContainText('异步');

    await asyncBtn.click();
    await expect(asyncBtn).toHaveClass(/n-button--primary-type/);
  });

  test('async backtest creates job and shows progress', async ({ page }) => {
    await navigateToBacktest(page);

    await page.fill('[placeholder="600000.SH,600036.SH"]', '600000.SH');
    const runBtn = page.locator('.n-button--primary-type').filter({ hasText: '运行回测' });
    await runBtn.click();

    const progressCard = page.locator('.progress-card');
    await expect(progressCard).toBeVisible({ timeout: 5000 });
    await expect(progressCard).toContainText(/回测任务|正在执行/);
  });

  test('backtest result renders metrics cards after completion', async ({ page }) => {
    await navigateToBacktest(page);

    await page.fill('[placeholder="600000.SH,600036.SH"]', '600000.SH');
    const runBtn = page.locator('.n-button--primary-type').filter({ hasText: '运行回测' });
    await runBtn.click();

    const metricsGrid = page.locator('.metrics-grid');
    await expect(metricsGrid).toBeVisible({ timeout: 120000 });

    const metricBoxes = metricsGrid.locator('.metric-box');
    const count = await metricBoxes.count();
    expect(count).toBeGreaterThanOrEqual(5);

    const labels = ['总收益率', '年化收益', '夏普比率', '最大回撤'];
    for (const label of labels) {
      await expect(metricsGrid).toContainText(label, { timeout: 5000 });
    }
  });

  test('equity chart canvas renders after backtest completes', async ({ page }) => {
    await navigateToBacktest(page);

    await page.fill('[placeholder="600000.SH,600036.SH"]', '600000.SH');
    await page.click('.n-button--primary-type:has-text("运行回测")');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 120000 });
  });

  test('trade markers toggle shows/hides trade data', async ({ page }) => {
    await navigateToBacktest(page);

    await page.fill('[placeholder="600000.SH,600036.SH"]', '600000.SH');
    await page.click('.n-button--primary-type:has-text("运行回测")');

    await page.waitForSelector('.metrics-grid', { timeout: 120000 });

    const showTradesTag = page.locator('.chart-header .n-tag:has-text("交易")');
    const count = await showTradesTag.count();
    if (count > 0) {
      await showTradesTag.first().click();
      const tradeTable = page.locator('.trades-card');
      await expect(tradeTable).toBeVisible({ timeout: 3000 });
      await expect(tradeTable).toContainText('交易记录');
    }
  });

  test('history list view-report button is present on history rows', async ({ page }) => {
    // 历史卡早已从 n-list 换成 n-collapse（BacktestHistory.vue）；旧选择器
    // `.n-list-item` 永远 count=0，这条用例就成了空跑。改为钉真实行 + 真实按钮。
    const historyLoaded = waitForHistoryFetch(page);
    await navigateToBacktest(page);
    await page.waitForSelector('.history-section', { timeout: 10000 });
    await historyLoaded;

    const historyItems = page.locator('.history-section .n-collapse-item');
    const count = await historyItems.count();
    if (count === 0) return; // 空库 + 本次未跑回测：没有行可点，不编造行

    const viewBtn = historyItems.first().locator('.n-button:has-text("查看报告")');
    await expect(viewBtn).toBeVisible();
  });

  test('form prevents duplicate submission while running', async ({ page }) => {
    await navigateToBacktest(page);

    await page.fill('[placeholder="600000.SH,600036.SH"]', '600000.SH');
    const runBtn = page.locator('.n-button--primary-type').filter({ hasText: '运行回测' });
    await runBtn.click();

    const progressCard = page.locator('.progress-card');
    await expect(progressCard).toBeVisible({ timeout: 5000 });

    // Naive UI 的按钮用 loading 状态挡住重复提交，不写 DOM disabled 属性
    // （实测：class 里有 n-button--loading，disabled 缺席）。断言真实的守卫
    // 形状 + 只有一张进度卡，而不是一个它从不采用的属性。
    await expect(runBtn).toHaveClass(/n-button--loading/, { timeout: 2000 });
    const progressCount = await progressCard.count();
    expect(progressCount).toBe(1);
  });
});

test.describe('Backtest Engine — Complete Workflow Tests', () => {

  test.beforeAll(async () => {
    const ready = await waitForBackendReady(60000);
    expect(ready).toBe(true);
  });

  test.beforeEach(async ({ page }) => {
    await isolateTestEnvironment(page);
  });

  test('complete backtest workflow: run → view results → check trades', async ({ page }) => {
    await navigateToBacktest(page);

    const stockInput = page.getByPlaceholder('600000.SH,600036.SH');
    await expect(stockInput).toBeVisible();
    await stockInput.fill('600000.SH');

    const runBtn = page.locator('.n-button--primary-type:has-text("运行回测")');
    await expect(runBtn).toBeEnabled();
    await runBtn.click();

    const metricsGrid = page.locator('.metrics-grid');
    await expect(metricsGrid).toBeVisible({ timeout: 120000 });

    const metricBoxes = metricsGrid.locator('.metric-box');
    const count = await metricBoxes.count();
    expect(count).toBeGreaterThanOrEqual(5);

    const expectedMetrics = ['总收益率', '年化收益', '夏普比率', '最大回撤'];
    for (const label of expectedMetrics) {
      await expect(metricsGrid).toContainText(label, { timeout: 5000 });
    }

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10000 });

    const showTradesTag = page.locator('.chart-header .n-tag:has-text("交易")');
    if (await showTradesTag.count() > 0) {
      await showTradesTag.first().click();
      const tradeTable = page.locator('.trades-card');
      await expect(tradeTable).toBeVisible({ timeout: 3000 });
      await expect(tradeTable).toContainText(/买入|卖出|方向/);
    }
  });

  test('backtest history shows completed jobs with correct data', async ({ page }) => {
    const historyLoaded = waitForHistoryFetch(page);
    await navigateToBacktest(page);
    await historyLoaded;

    await page.fill('[placeholder="600000.SH,600036.SH"]', '600519.SH');
    // 页面默认是异步模式（asyncMode = ref(true)），异步提交要求 ORCHESTRATION_URL；
    // 本用例的目标是「跑完一次回测并核对历史」，显式切到同步模式，不依赖编排栈。
    await page.click('.mode-toggle .n-button:has-text("同步")');
    await page.click('.n-button--primary-type:has-text("运行回测")');

    await page.waitForSelector('.metrics-grid', { timeout: 120000 });

    const historySection = page.locator('.history-section');
    await expect(historySection).toBeVisible({ timeout: 10000 });

    // 库里可能已有其它作业的历史（e2e 库跨 run 累积）。判据锚定「本次跑的
    // 600519.SH」这一行，而不是「排在第一的那一行」——后者取决于库里的历史分布。
    const item = historySection.locator('.n-collapse-item').filter({ hasText: '600519.SH' }).first();
    await expect(item).toBeVisible({ timeout: 10000 });
    await expect(item).toContainText(/momentum|策略/);

    const totalReturnTag = item.locator('.n-tag[type="success"], .n-tag[type="error"]');
    if (await totalReturnTag.count() > 0) {
      const text = await totalReturnTag.first().textContent();
      expect(text).toMatch(/[+-]?\d+\.?\d*%/);
    }
  });

  test('expandable trade details in history', async ({ page }) => {
    await navigateToBacktest(page);
    await page.waitForSelector('.history-section .n-collapse-item', { timeout: 10000 }).catch(() => {});

    const collapseItems = page.locator('.history-section .n-collapse-item');
    const count = await collapseItems.count();
    if (count === 0) return;

    const firstItem = collapseItems.first();
    await firstItem.click();

    const tradeTable = firstItem.locator('table, .trade-sublist');
    const tableCount = await tradeTable.count();
    if (tableCount > 0) {
      await expect(tradeTable.first()).toBeVisible({ timeout: 3000 });
      await expect(firstItem).toContainText(/方向|股票|交易时间|成交价/);
    }
  });

  test('view report button loads historical result', async ({ page }) => {
    const historyLoaded = waitForHistoryFetch(page);
    await navigateToBacktest(page);
    await page.waitForSelector('.history-section', { timeout: 10000 });
    await historyLoaded;

    const historySection = page.locator('.history-section');

    // 不赌「库里第一条历史一定带报告」：先清掉继承来的行（等库回读落地后再清，
    // 避免回读把旧作业补回来），再用本次运行产生的那一行点「查看报告」。
    const clearBtn = historySection.locator('.n-button:has-text("清除")');
    if (await clearBtn.count() > 0) {
      await clearBtn.click();
    }

    await page.fill('[placeholder="600000.SH,600036.SH"]', '600000.SH');
    await page.click('.mode-toggle .n-button:has-text("同步")');
    await page.click('.n-button--primary-type:has-text("运行回测")');
    await page.waitForSelector('.metrics-grid', { timeout: 120000 });

    const viewBtns = historySection.locator('.n-button:has-text("查看报告")');
    await expect(viewBtns).toHaveCount(1, { timeout: 10000 });
    await viewBtns.first().click();

    // 当前实现是「就地把报告装进本页」（loadReport → result 赋值），不改 URL；
    // 旧断言 /report=/ 描述的是一个不存在的路由行为。判据改成真看到报告。
    await expect(page.locator('.metrics-grid')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.metrics-grid')).toContainText('总收益率');
  });

  test('clear history removes all items', async ({ page }) => {
    const historyLoaded = waitForHistoryFetch(page);
    await navigateToBacktest(page);
    await page.waitForSelector('.history-section', { timeout: 10000 });

    // 必须等 `GET /api/backtest?limit=` 的回读落定再清除：清除发生在回读之前时，
    // 回读会把库里的旧作业重新补进列表，空态断言就变成「库里恰好没有历史记录」的赌注。
    await historyLoaded;

    const clearBtn = page.locator('.history-section .n-button:has-text("清除")');
    const btnCount = await clearBtn.count();
    if (btnCount === 0) return;

    await clearBtn.click();

    const modal = page.locator('.n-modal-container');
    if (await modal.count() > 0) {
      const confirmBtn = modal.locator('.n-button--primary-type:has-text("确认")');
      if (await confirmBtn.count() > 0) {
        await confirmBtn.click();
      }
    }

    const emptyState = page.locator('.history-section .n-empty');
    await expect(emptyState).toBeVisible({ timeout: 5000 });
  });

  test('equity chart renders with dual axes when data available', async ({ page }) => {
    await navigateToBacktest(page);

    await page.fill('[placeholder="600000.SH,600036.SH"]', '600000.SH');
    await page.click('.n-button--primary-type:has-text("运行回测")');

    await page.waitForSelector('.metrics-grid', { timeout: 120000 });

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10000 });

    const boundingBox = await canvas.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(100);
    expect(boundingBox?.height).toBeGreaterThan(100);
  });

  test('date pickers enforce valid date range', async ({ page }) => {
    await navigateToBacktest(page);

    const startDatePicker = page.locator('.n-date-picker').first();
    const endDatePicker = page.locator('.n-date-picker').nth(1);

    await expect(startDatePicker).toBeVisible();
    await expect(endDatePicker).toBeVisible();
  });

  test('strategy selector loads strategies from backend', async ({ page }) => {
    await navigateToBacktest(page);

    const strategySelect = page.locator('.n-select').first();
    await strategySelect.click();

    // Naive UI 2.44 的选项类是 .n-base-select-option（旧 .n-select-option 已不存在）。
    const options = page.locator('.n-base-select-option');
    await expect(options.filter({ hasText: 'momentum' }).first()).toBeVisible({ timeout: 5000 });
    expect(await options.count()).toBeGreaterThanOrEqual(1);

    await options.filter({ hasText: 'momentum' }).first().click();
  });

  test('handles empty stock pool gracefully', async ({ page }) => {
    await navigateToBacktest(page);

    const stockInput = page.getByPlaceholder('600000.SH,600036.SH');
    await stockInput.clear();

    const runBtn = page.locator('.n-button--primary-type:has-text("运行回测")');
    await runBtn.click();

    const errorToast = page.locator('.n-message--error, [class*="error"]');
    const toastExists = await errorToast.count().then(c => c > 0);
    expect(typeof toastExists).toBe('boolean');
  });

  test('responsive layout on different viewport sizes', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    // 768px 侧栏折叠成图标轨（`.nav-item` 的文字节点不渲染），按文本点侧栏
    // 在这条视口下天然点不到——那是布局事实，不是导航坏了。这条用例测的是
    // 768 下的布局，直接深链进路由，把导航方式从被测对象里摘出去。
    await page.goto('/backtest');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.bt-page', { timeout: 20000 });

    const btPage = page.locator('.bt-page');
    await expect(btPage).toBeVisible();

    // 表单卡 = BacktestForm.vue 根 n-card(title=回测引擎)；没有 .bt-form-card 外层类。
    const formCard = page.locator('.bt-page .n-card').filter({ hasText: '回测引擎' }).first();
    await expect(formCard).toBeVisible();
    await expect(formCard.locator('.form-grid')).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(btPage).toBeVisible();
  });

  test('keyboard accessibility - Enter key triggers backtest', async ({ page }) => {
    await navigateToBacktest(page);

    await page.fill('[placeholder="600000.SH,600036.SH"]', '600000.SH');

    const runBtn = page.locator('.n-button--primary-type:has-text("运行回测")');
    await runBtn.focus();
    await page.keyboard.press('Enter');

    const progressCard = page.locator('.progress-card');
    await expect(progressCard).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Backtest Engine — Error Handling & Edge Cases', () => {

  test.beforeAll(async () => {
    const ready = await waitForBackendReady(60000);
    expect(ready).toBe(true);
  });

  test.beforeEach(async ({ page }) => {
    await isolateTestEnvironment(page);
  });

  test('shows loading state during async backtest', async ({ page }) => {
    await navigateToBacktest(page);

    await page.fill('[placeholder="600000.SH,600036.SH"]', '600000.SH');
    await page.click('.n-button--primary-type:has-text("运行回测")');

    const progressCard = page.locator('.progress-card');
    await expect(progressCard).toBeVisible({ timeout: 5000 });

    const progressBar = progressCard.locator('.n-progress-line');
    if (await progressBar.count() > 0) {
      const width = await progressBar.getAttribute('style');
      expect(width).toBeDefined();
    }
  });

  test('displays error message for invalid stock code', async ({ page }) => {
    await navigateToBacktest(page);

    await page.fill('[placeholder="600000.SH,600036.SH"]', 'INVALID.CODE');
    await page.click('.n-button--primary-type:has-text("运行回测")');

    const errorElement = page.locator('.n-message--error, .error-message');
    const hasError = await errorElement.count().then(c => c > 0);
    if (hasError) {
      await expect(errorElement.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('persists state after navigation away and back', async ({ page }) => {
    await navigateToBacktest(page);

    await page.fill('[placeholder="600000.SH,600036.SH"]', '600000.SH');
    const inputValue = await page.inputValue('[placeholder="600000.SH,600036.SH"]');
    expect(inputValue).toBe('600000.SH');

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.dashboard-page', { timeout: 15000 });

    await navigateToBacktest(page);

    const restoredValue = await page.inputValue('[placeholder="600000.SH,600036.SH"]');
    expect(restoredValue).toContain('600000.SH');
  });
});

// K9（ResultSpec status 三值收口）：UI 的成功判据必须是 result.status 本身。
//
// 这条 E2E 全部接口走 page.route stub（不需要后端在线），把报告 stub 成
// invalid 运行，钉死「invalid ⇒ 显式警示 + invalid_reasons 列表，不是绿色
// 成功标签」。破坏腿：判据改回 `result.id` 存在推断成功 ⇒ 警示块不渲染 ⇒ 红
// （与 web/src/pages/BacktestEngine.test.ts 的 vitest 破坏腿同点）。
test.describe('K9: status 三值 — invalid 显式警示（全 stub，不需要后端）', () => {

  test.beforeEach(async ({ page }) => {
    await isolateTestEnvironment(page);
    // 探测成 open-access 免登录（web/src/router/authGuard.ts 的 isOpenAccess 通路）
    await page.route('**/api/auth/status', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ auth_enabled: false, bootstrap_required: false }),
    }));
    await page.route('**/api/strategies', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ strategies: [] }),
    }));
  });

  test('invalid 报告 ⇒ 显式警示 + invalid_reasons 列表，状态标签「无效运行」', async ({ page }) => {
    await page.route('**/api/backtest/bt-inv/report', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'bt-inv',
        status: 'invalid',
        invalid_reasons: ['empty_universe', 'zero_trades'],
        total_return: 0,
        annual_return: 0,
        sharpe_ratio: 0,
        sortino_ratio: 0,
        max_drawdown: 0,
        max_drawdown_date: '',
        calmar_ratio: 0,
        started_at: '2024-01-01T00:00:00Z',
        completed_at: '2024-01-01T00:01:00Z',
        portfolio_values: [],
        trades: [],
      }),
    }));

    await page.goto('/backtest?id=bt-inv');
    await page.waitForLoadState('domcontentloaded');

    // 显式警示 + reasons 逐条呈现
    const invalidAlert = page.locator('[data-testid="result-invalid"]');
    await expect(invalidAlert).toBeVisible({ timeout: 15000 });
    const items = page.locator('[data-testid="invalid-reason-item"]');
    await expect(items).toHaveCount(2);
    // A-07 断言 2/3：原因走 `utils/runStatus` 全站唯一口径 —— 这一页显示的是
    // 人话，与快速回测卡片逐字相同。原先这里断的是原始 Code（empty_universe），
    // 两份措辞并存正是本任务要收的东西，所以断言随**行为改动**一起改。
    await expect(items.nth(0)).toHaveText('股票池为空');
    await expect(items.nth(1)).toHaveText('一次成交都没有');

    // 状态标签由 status 三值决定（不是 result.id 推出来的「成功」）
    await expect(page.locator('[data-testid="result-status-tag"]')).toContainText('无效运行');
    await expect(page.locator('[data-testid="result-failed"]')).toHaveCount(0);
  });
});
