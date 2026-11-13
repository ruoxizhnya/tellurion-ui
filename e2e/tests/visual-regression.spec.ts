import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { waitForBackendReady } from '../helpers/api';
import { isolateTestEnvironment } from '../helpers/isolation';

/**
 * P2-26: Visual regression tests — screenshot comparison for key pages.
 *
 * Uses Playwright's toHaveScreenshot() for pixel-diff comparison.
 * First run generates baseline screenshots; subsequent runs compare.
 * Update baselines with: npx playwright test --update-snapshots
 */

/**
 * 冻结挂钟，但**只冻结 Date，不冻结定时器**。
 *
 * 页头有 `setInterval(updateClock, 1000)` 的秒级时钟，全页快照因此永远不可复现：
 * 实测 12 张基线里 5 张在**刚生成完立刻重跑**就红，diff 图显示唯一差异像素就在页头
 * 时间上（30–57 px）。用 setFixedTime 而不是 clock.install —— 后者会让待触发的
 * setTimeout 永不执行，把依赖轮询/延迟渲染的页面打成空态，那是"为了变绿而破坏被测行为"。
 *
 * ⚠️ 响应式两例自己 `browser.newContext()` 造页，拿不到 `beforeEach({ page })` 的注入，
 * 必须各自调用本函数 —— 漏掉的表现是基线里烙进真实时间，下次跑必红。
 */
const FROZEN_CLOCK = new Date('2026-05-06T10:30:00');
async function freezeClock(page: Page): Promise<void> {
  await page.clock.setFixedTime(FROZEN_CLOCK);
}

/**
 * 回测历史（控制台历史 / 回测页「回测历史」）走**固定 fixture**。
 *
 * 来历（F5，2026-11-13）：这两块在基线里读真库（store.loadHistoryFromDB →
 * GET /api/backtest）。同一份代码，库里历史多一条少一条、或者被清空，全页截图就
 * 变一次——2026-11-13 全量跑基线里有一条 value_screening、实跑却是空态。这不是
 * 视觉回归，是基线把库内容烙进了像素，直接重录只会让下一次数据一变又红。
 *
 * 与 data-sync 同一套纪律：真数据不进基线，用 fixture 保住这一块的像素覆盖；
 * 真数据的正确性由 api-backtest.spec.ts 与组件单测兜。只钉 GET 列表读面，
 * POST /api/backtest 与 /api/backtest/:id/* 一律 fallback，避免假绿扩散到别的断言。
 */
const BACKTEST_HISTORY_FIXTURE = {
  jobs: [
    {
      id: 'vs-bt-momentum', status: 'completed', strategy_id: 'momentum',
      universe: '600000.SH,600519.SH', start_date: '2024-01-02', end_date: '2024-03-29',
      created_at: '2026-05-06T09:30:00Z',
      result: {
        status: 'completed', total_return: 0.0421, sharpe_ratio: 1.37,
        max_drawdown: -0.0218, trades: [],
      },
    },
    {
      id: 'vs-bt-value', status: 'completed', strategy_id: 'value',
      universe: '600000.SH', start_date: '2023-11-01', end_date: '2024-02-29',
      created_at: '2026-05-06T08:15:00Z',
      result: {
        status: 'completed', total_return: -0.0132, sharpe_ratio: -0.21,
        max_drawdown: -0.045, trades: [],
      },
    },
  ],
};

/**
 * 页头的「待审阅 N」角标同样读真库（AppHeader → GET /api/review/pending）。
 * review-desk 的 e2e 会往库里写待审阅项，这个数字随套件执行顺序变化 ——
 * 不钉住的话，任何含页头的基线都会在不同跑次之间红。给一个确定值，
 * 「—（未知）/ 0 / N」三态的像素覆盖仍在（另两条由单测与 review-desk 兜）。
 */
const REVIEW_PENDING_FIXTURE = {
  pending: 2,
  as_of: '2026-05-06T10:30:00Z',
  sources: [{ name: 'review', status: 'available', pending: 2 }],
};

/**
 * A-15 晨间简报的三块读数也必须冻结（V-3 教训：活数据不进基线）。
 * `ql.lastRunId` 由 init script 在每次导航前写入 —— 不写就会落到「还没有探索记录」
 * 的空态，基线看着绿，实际简报的候选区一行像素都没覆盖。
 */
const CALIBRATION_FIXTURE = {
  sample_size: 42,
  hit_rate: 0.61,
  claimed_rate: 0.7,
  calibration_error: 0.083,
  brier_score: 0.21,
  pending: 1,
  holdout: { sample_size: 8, hit_rate: 0.5 },
  entries: [],
};

const BRIEF_RUN_FIXTURE = {
  run_id: 'vs-run-brief',
  running: false,
  attempts: [
    {
      seq: 1, hypothesis: '动量因子在光模块上更稳', params: { lookback: 20 },
      experiment_id: 1, sharpe: 1.0, ok: true,
      verdict: {
        dimensions: { statistical: 0.8, economic: 0.7, robustness: 0.6, bias: 0.5, redundancy: 0.9, causal: 0.4 },
        unassessed: [], probability: 0.4, weakest: 'causal', geometric_mean: 0.6,
        blocking: 0, challenges: [], causal: null,
      },
    },
    {
      seq: 2, hypothesis: '低波因子在银行上更稳', params: { lookback: 60 },
      experiment_id: 2, sharpe: 0.9, ok: true,
      verdict: {
        dimensions: { statistical: 0.7, economic: 0.6, robustness: 0.5, bias: 0.4, redundancy: 0.8, causal: 0.3 },
        unassessed: [], probability: 0.3, weakest: 'causal', geometric_mean: 0.5,
        blocking: 1, challenges: [], causal: null,
      },
    },
    {
      seq: 3, hypothesis: '反转因子在小市值上', params: { lookback: 5 },
      experiment_id: 3, sharpe: 0, ok: false, error: '数据缺口：交易日不足', verdict: null,
    },
  ],
};

async function fixVolatileApis(page: Page): Promise<void> {
  await page.addInitScript(() => localStorage.setItem('ql.lastRunId', 'vs-run-brief'));
  await page.route('**/api/backtest**', (route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    if (req.method() === 'GET' && (path === '/api/backtest' || path === '/api/backtest/')) {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(BACKTEST_HISTORY_FIXTURE),
      });
    }
    return route.fallback();
  });
  await page.route('**/api/review/pending**', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(REVIEW_PENDING_FIXTURE) }),
  );
  await page.route('**/api/pipeline/calibration**', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(CALIBRATION_FIXTURE) }),
  );
  await page.route('**/api/explore/runs/vs-run-brief**', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(BRIEF_RUN_FIXTURE) }),
  );
}

test.describe('Visual Regression — Key Pages', () => {

  test.beforeAll(async () => {
    const ready = await waitForBackendReady(60000);
    expect(ready).toBe(true);
  });

  test.beforeEach(async ({ page }) => {
    await freezeClock(page);
    await isolateTestEnvironment(page);
    await fixVolatileApis(page);
  });

  // ─── Dashboard ────────────────────────────────────────────

  test('dashboard renders correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.dashboard-page', { timeout: 15000 });
    // A-15：等简报三块读数都落到 fixture 值再截图（等条件，不等时长）
    await expect(page.getByTestId('brief-pending-value')).toHaveText('2', { timeout: 15000 });
    await expect(page.getByTestId('brief-calibration-note')).toHaveText('n=42');
    await expect(page.locator('.recent-item')).toHaveCount(3);
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('dashboard.png');
  });

  test('dashboard sidebar visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.dashboard-page', { timeout: 15000 });
    await page.waitForSelector('.nav-item', { timeout: 10000 });
    await page.waitForTimeout(300);
    const sidebar = page.locator('.n-layout-sider, .sidebar, nav').first();
    await expect(sidebar).toHaveScreenshot('dashboard-sidebar.png');
  });

  test('dashboard metric cards render', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.dashboard-page', { timeout: 15000 });
    const cards = page.locator('.metric-card, .quick-bt-card, .nav-tile');
    if (await cards.count() > 0) {
      await expect(cards.first()).toHaveScreenshot('dashboard-metric-card.png');
    }
  });

  // ─── Backtest Engine ──────────────────────────────────────

  test('backtest page renders correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.dashboard-page', { timeout: 15000 });
    await page.locator('[data-nav-path="/backtest"]').click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.bt-page', { timeout: 20000 });
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('backtest.png');
  });

  test('backtest form visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.dashboard-page', { timeout: 15000 });
    await page.locator('[data-nav-path="/backtest"]').click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.bt-page', { timeout: 20000 });
    const form = page.locator('.n-card').first();
    await expect(form).toHaveScreenshot('backtest-form.png');
  });

  // ─── AI Research ──────────────────────────────────────────

  test('ai research factor lab renders', async ({ page }) => {
    await page.goto('/ai-research/factor-lab');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.factor-lab-page, .ai-research-page', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('ai-factor-lab.png');
  });

  test('ai research strategy workshop renders', async ({ page }) => {
    await page.goto('/ai-research/strategy-workshop');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.strategy-workshop-page, .ai-research-page', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('ai-strategy-workshop.png');
  });

  test('ai research evolution renders', async ({ page }) => {
    await page.goto('/ai-research/evolution');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.ai-research-page', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('ai-evolution.png');
  });

  // ─── Stock Screener ───────────────────────────────────────

  test('stock screener renders correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.dashboard-page', { timeout: 15000 });
    await page.locator('[data-nav-path="/screener"]').click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('stock-screener.png');
  });

  // ─── Data Sync ────────────────────────────────────────────

  /**
   * 这一屏的基线走**固定 fixture**（route 层），不走遮罩。
   *
   * 来历（V-3，2026-10-14，两次实测才定下来）：
   *  1. 先按裁决做遮罩版（四块活数据区糊掉）。单独连跑三轮全绿 —— 但那是**假绿**：
   *     全量套件里同一条用例红了。原因不是像素抖动，而是**遮罩只糊像素、不改布局**：
   *     队列从 2 行变 3 行，被遮那块就变高，下面每一块整体下移，位移落进视口即 diff。
   *     单独跑时数据恰好没变，所以看不出来。
   *  2. 于是改走 fixture：这一屏请求的 8 条端点全部由测试给出确定回包。
   *     代价明写：**视觉网不再覆盖真数据渲染**（真实数字的宽度、真队列的深度都不在
   *     这张图上）；页面将来消费一个新字段时，回包必须跟着补，补漏了就会"基线照常绿
   *     而界面已经错"——那是**假护栏**，比没网更糟。兜它的是 A-08 的功能断言
   *     （`a08-job-console.spec.ts` 的真后端腿 + 组件单测），它们打真后端。
   *     好处是这四块**仍有像素覆盖**（遮罩版是主动放弃覆盖）。
   *
   * 三条刻意选择：
   *  - 作业全给**终态**（completed/failed/cancelled）：非终态会让面板开 SSE 并起 8s
   *    轮询，"实时连接"那颗芯片的连接态是时间函数，基线立刻不可复现。
   *    代价：这张图里没有"同步中"那一格的颜色（由 a08 功能断言与组件单测覆盖）。
   *  - `failed` 那条带 重试 按钮、`active` 那条带 下次执行 —— 按钮与三态的排版仍在图上。
   *  - 日期一律用 `created_at` 固定值 + `freezeClock` 冻住的挂钟，`toLocaleString()`
   *    在不同运行时刻会输出不同字符串，那是这条基线最初不可复现的另一半根因。
   */
  const DATA_SYNC_FIXTURE = {
    jobs: {
      count: 3,
      jobs: [
        {
          id: 'vs-job-completed', job_type: 'ohlcv', status: 'completed',
          params: { symbols: ['600000.SH'] }, progress_percent: 100,
          total_items: 1, processed_items: 1, failed_items: 0,
          created_at: '2026-05-06T09:00:00Z', completed_at: '2026-05-06T09:01:30Z',
          retry_count: 0, max_retries: 3,
        },
        {
          id: 'vs-job-failed', job_type: 'stocks', status: 'failed',
          params: { source: 'tushare' }, progress_percent: 20,
          total_items: 100, processed_items: 20, failed_items: 1,
          error_message: 'read timeout after 3 retries',
          created_at: '2026-05-06T08:00:00Z', retry_count: 1, max_retries: 3,
        },
        {
          id: 'vs-job-cancelled', job_type: 'fundamentals', status: 'cancelled',
          params: { symbols: ['000001.SZ'] }, progress_percent: 0,
          total_items: 1, processed_items: 0, failed_items: 0,
          created_at: '2026-05-06T07:00:00Z', retry_count: 0, max_retries: 3,
        },
      ],
    },
    schedules: {
      count: 2,
      schedules: [
        {
          id: 9001, name: 'Daily OHLCV Sync', job_type: 'ohlcv', cron_expression: '0 9 * * *',
          params: { symbols: ['600000.SH'] }, is_active: true,
          created_at: '2026-05-06T06:00:00Z', updated_at: '2026-05-06T06:00:00Z',
          next_run_at: '2026-05-06T09:00:00Z', last_run_at: '2026-05-06T08:59:00Z',
          last_run_status: 'completed',
        },
        {
          id: 9002, name: 'Nightly Stocks Refresh', job_type: 'stocks', cron_expression: '30 2 * * *',
          params: { source: 'tushare' }, is_active: false,
          created_at: '2026-05-06T06:00:00Z', updated_at: '2026-05-06T06:00:00Z',
          // 故意带着残留 next_run_at：前端规定停用行一律显示「—」（core SYNC-03 的防御）
          next_run_at: '2026-05-06T18:30:00Z', last_run_status: 'failed',
        },
      ],
    },
    workers: { num_workers: 3, registered_types: ['ohlcv', 'stocks', 'fundamentals', 'calendar'], is_running: true },
    schedulerStats: {
      active_schedules: 1, total_entries: 1,
      next_runs: [{ schedule_id: 9001, name: '', next_run: '2026-05-06T09:00:00Z' }],
    },
    // `/api/stocks/count` 的形状（core DATA-02 / DATA-03）：`by_status` 各档 + `latest_date`
    // 键恒在。UI-01 起这页消费 by_status 与 latest_date ⇒ fixture 必须跟着补，否则
    // 基线会把"读数缺席"的空态烙进去，而屏上真实的拆分读数没有像素覆盖（假护栏）。
    stocksCount: {
      count: 5908,
      by_status: { active: 5569, delisted: 339 },
      latest_date: '2026-05-06',
    },
    datasourceStatus: { enabled: true, primary: 'postgres', mode: 'direct' },
    datasourceHealth: { healthy: true, status: 'up' },
  };

  async function fixDataSyncApis(page: Page): Promise<void> {
    const fulfill = (path: string, body: unknown) =>
      page.route(`**${path}**`, (route) =>
        route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) }),
      );
    // 顺序有讲究：jobs 的单条与列表同前缀，先注册更宽的模式会吃掉后面的精确匹配。
    await page.route('**/api/sync/jobs**', (route) => {
      const p = new URL(route.request().url()).pathname;
      if (p === '/api/sync/jobs' || p === '/api/sync/jobs/') {
        return route.fulfill({ contentType: 'application/json', body: JSON.stringify(DATA_SYNC_FIXTURE.jobs) });
      }
      if (p.endsWith('/progress')) {
        // 终态作业不该开流；真开了就红在这条 501 上（断言 4 的同一条纪律）
        return route.fulfill({ status: 501, contentType: 'text/plain', body: 'visual baseline: no stream' });
      }
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(DATA_SYNC_FIXTURE.jobs.jobs[0]) });
    });
    await fulfill('/api/sync/schedules', DATA_SYNC_FIXTURE.schedules);
    await fulfill('/api/sync/workers', DATA_SYNC_FIXTURE.workers);
    await fulfill('/api/sync/scheduler/stats', DATA_SYNC_FIXTURE.schedulerStats);
    await fulfill('/api/stocks/count', DATA_SYNC_FIXTURE.stocksCount);
    await fulfill('/api/datasource/status', DATA_SYNC_FIXTURE.datasourceStatus);
    await fulfill('/api/datasource/health', DATA_SYNC_FIXTURE.datasourceHealth);
  }

  test('data sync page renders correctly', async ({ page }) => {
    await fixDataSyncApis(page);
    await page.goto('/data-sync');
    await page.waitForSelector('[data-testid="queue-panel"]', { timeout: 15000 });
    await expect(page.locator('[data-testid="schedule-table"]')).toBeVisible();
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot('data-sync.png');
  });

  // ─── Responsive Layout ────────────────────────────────────

  test('dashboard responsive on mobile viewport', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const page = await context.newPage();
    await freezeClock(page);
    await fixVolatileApis(page);
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.dashboard-page', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('dashboard-mobile.png');
    await context.close();
  });

  test('backtest responsive on tablet viewport', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
    const page = await context.newPage();
    await freezeClock(page);
    await fixVolatileApis(page);
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.dashboard-page', { timeout: 15000 });
    await page.locator('[data-nav-path="/backtest"]').click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.bt-page', { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('backtest-tablet.png');
    await context.close();
  });
});
