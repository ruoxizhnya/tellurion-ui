import { test, expect } from '@playwright/test'
import { waitForBackendReady } from '../helpers/api'
import { isolateTestEnvironment } from '../helpers/isolation'

/**
 * B-02 审阅台 + B-06 三干预的页面级取证。
 *
 * 环境限制：core `:8085` 仍在共享限流下（AUD-61 第④类），真跑一次探索会 429。
 * 因此这里**只断言渲染与失败态**：页面必须把「近似」写在明面上；拿不到 run 时
 * 必须显示错误，而不是画一批看起来像候选的假卡片。
 */
test.describe('B-02 审阅台', () => {
  test.beforeAll(async () => {
    expect(await waitForBackendReady(60000)).toBe(true)
  })

  test.beforeEach(async ({ page }) => {
    await isolateTestEnvironment(page)
  })

  test('/review 渲染审阅台，并显式标注排序为「近似」', async ({ page }) => {
    await page.goto('/review')
    await page.waitForSelector('[data-testid="review-desk"]', { timeout: 15000 })

    await expect(page.getByTestId('approx-banner')).toBeVisible()
    await expect(page.getByTestId('approx-banner')).toContainText('近似')
    await expect(page.getByTestId('review-run-input')).toBeVisible()
  })

  test('没有 run_id 时提示先填，不渲染候选列表', async ({ page }) => {
    await page.goto('/review')
    await page.waitForSelector('[data-testid="review-desk"]', { timeout: 15000 })

    await page.getByTestId('review-load').click()
    await expect(page.getByTestId('review-error')).toContainText('先填一个 run_id')
    await expect(page.getByTestId('ranked-list')).toHaveCount(0)
  })

  test('run 不存在/取数失败时显示错误，不用空列表冒充「没有候选」', async ({ page }) => {
    await page.goto('/review')
    await page.waitForSelector('[data-testid="review-desk"]', { timeout: 15000 })

    await page.getByTestId('review-run-input').locator('input').fill('no-such-run-0000')
    await page.getByTestId('review-load').click()

    // 404 与 429 都是可信的失败态；关键是 error 可见且没有伪造候选。
    await expect(page.getByTestId('review-error')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('ranked-list')).toHaveCount(0)
  })

  test('顶栏「待审阅」显示数字或「—」', async ({ page }) => {
    await page.goto('/review')
    await page.waitForSelector('[data-testid="review-desk"]', { timeout: 15000 })

    const badge = page.getByTestId('header-review-badge')
    await expect(badge).toHaveText(/待审阅 (\d+|—)/)
  })

  /**
   * A-12 校准驾驶舱（审阅台第二 tab）。
   *
   * 只断言「能到达 + 读数或显式失败态」：真库的采纳台账条数随套件执行变化，
   * 把具体百分比钉进 e2e 就是又一条把数据烙进断言的假护栏（同 visual-regression 的教训）。
   */
  test('A-12：?tab=calibration 深链直达校准驾驶舱，不新增路由', async ({ page }) => {
    await page.goto('/review?tab=calibration')
    await page.waitForSelector('[data-testid="review-desk"]', { timeout: 15000 })

    await expect(page).toHaveURL(/\/review\?tab=calibration$/)
    await expect(page.getByTestId('calibration-panel')).toBeVisible()
    // 候选排序面板不与校准同屏堆叠
    await expect(page.getByTestId('ranked-list')).toHaveCount(0)
  })

  test('A-12：校准 tab 的读数或失败态必须二选一可见，不拿空白冒充 0%', async ({ page }) => {
    await page.goto('/review?tab=calibration')
    await page.waitForSelector('[data-testid="calibration-panel"]', { timeout: 15000 })

    const readable = page.getByTestId('cal-sample-size')
    const failed = page.getByTestId('cal-error')
    await expect(readable.or(failed).first()).toBeVisible({ timeout: 15000 })
    // 明确不允许「评分 / 等级」这类包装词
    await expect(page.getByTestId('calibration-panel')).not.toContainText('评级')
  })

  test('A-12：点「校准」tab 后 URL 带 query，可直接分享', async ({ page }) => {
    await page.goto('/review')
    await page.waitForSelector('[data-testid="review-desk"]', { timeout: 15000 })

    await page.locator('.n-tabs-tab').filter({ hasText: '校准' }).click()
    await expect(page).toHaveURL(/tab=calibration/)
    await expect(page.getByTestId('calibration-panel')).toBeVisible()
  })

  /**
   * A-12 非空态（**fixture，非真后端**）：今天真库台账是空的，分箱 / holdout 分离 /
   * 待回填三件事只能用确定回包取证。形状逐字段对齐 `api/pipeline.ts` 的 `Calibration`，
   * 不造后端没有的字段。
   */
  test('A-12（fixture 非空态）：分箱 / holdout 分离 / 待回填不混算', async ({ page }) => {
    const entry = (over: Record<string, unknown>) => ({
      proposal_id: 'run-1:1',
      actor: 'local',
      intervention: 'fixture',
      adopted: true,
      claimed_confidence: 0.8,
      is_holdout: false,
      outcome_hit: true,
      result_ref: 'exp:1',
      created_at: '2026-05-06T09:00:00Z',
      resolved_at: '2026-05-06T10:00:00Z',
      ...over,
    })
    const fixture = {
      sample_size: 8,
      hit_rate: 0.625,
      claimed_rate: 0.75,
      calibration_error: 0.125,
      brier_score: 0.2513,
      pending: 2,
      holdout: { sample_size: 2, hit_rate: 0.5 },
      entries: [
        entry({ proposal_id: 'run-1:1', outcome_hit: true }),
        entry({ proposal_id: 'run-1:2', outcome_hit: false }),
        entry({ proposal_id: 'run-1:3', outcome_hit: null, resolved_at: null }),
        entry({ proposal_id: 'run-1:4', outcome_hit: false, is_holdout: true }),
      ],
    }
    await page.route('**/api/pipeline/calibration**', (route) =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(fixture) }),
    )

    await page.goto('/review?tab=calibration')
    await page.waitForSelector('[data-testid="calibration-panel"]', { timeout: 15000 })

    await expect(page.getByTestId('cal-sample-size')).toHaveText('8')
    await expect(page.getByTestId('cal-hit-rate')).toHaveText('62.5%')
    await expect(page.getByTestId('cal-brier')).toHaveText('0.251')
    await expect(page.getByTestId('cal-pending')).toContainText('已回填 8 条（不含 holdout）计入命中率')
    await expect(page.getByTestId('cal-pending')).toContainText('待回填 2 条不计入')
    // 样本 < 30 ⇒ 必须显式标注，不能只画一张漂亮图
    await expect(page.getByTestId('cal-low-sample')).toContainText('样本不足')

    const rows = page.getByTestId('cal-bins').locator('tbody tr')
    await expect(rows).toHaveCount(2)
    await expect(rows.nth(0)).toContainText('50.0%')
    await expect(rows.nth(1)).toContainText('（holdout）')
    await expect(rows.nth(1)).toContainText('0.0%')
    await expect(page.getByTestId('cal-result-pending')).toHaveCount(1)
  })
})

/**
 * A-14 候选卡三要素。
 *
 * 环境限制（同 B-02 抬头）：core `:8085` 共享限流下真跑一次探索会 429，套件里没有可复用的
 * 真 run。因此 verdict 形状用 **route fixture**（逐字段对齐 `api/explore.ts` 的 `Verdict`）
 * 取证，并在测试名里写明；「真 run 的六维形状」留待 G1/限流解除后补真数据那条。
 */
test.describe('A-14 候选卡三要素', () => {
  const verdict = (over: Record<string, unknown> = {}) => ({
    dimensions: {
      statistical: 0.8,
      economic: 0.6,
      robustness: 0.55,
      bias: 0.7,
      redundancy: 0.65,
      causal: 0.9,
    },
    probability: 0.55,
    geometric_mean: 0.69,
    blocking: 0,
    challenges: [],
    ...over,
  })

  test.beforeEach(async ({ page }) => {
    await isolateTestEnvironment(page)
    await page.route('**/api/explore/runs/run-e2e-a14', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          run_id: 'run-e2e-a14',
          running: false,
          best_seq: 1,
          attempts: [
            {
              seq: 1,
              hypothesis: '动量 20 日',
              params: { lookback: 20 },
              experiment_id: 101,
              sharpe: 1.5,
              ok: true,
              verdict: verdict({ unassessed: ['redundancy'] }),
            },
            {
              seq: 2,
              hypothesis: '动量 40 日',
              params: { lookback: 40 },
              experiment_id: 102,
              sharpe: 0,
              ok: false,
              error: 'empty_universe',
            },
          ],
        }),
      }),
    )
    await page.addInitScript(() => localStorage.setItem('ql.lastRunId', 'run-e2e-a14'))
  })

  test('A-14（fixture 真形状）：六维微条 + 未评估显式标注 + 失败尝试无裁决', async ({ page }) => {
    await page.goto('/review')
    await page.waitForSelector('[data-testid="ranked-item-1"]', { timeout: 15000 })

    const okCard = page.getByTestId('ranked-item-1')
    await expect(okCard.getByTestId('verdict-bars')).toBeVisible()
    await expect(okCard.locator('[data-testid^="verdict-row-"]')).toHaveCount(6)
    // unassessed 维写「未评估」，不是 0 分长条
    await expect(okCard.getByTestId('verdict-unassessed-redundancy')).toHaveText('未评估')
    await expect(okCard.getByTestId('verdict-veto')).toBeVisible()
    await expect(okCard.getByTestId('probability-tag')).toBeVisible()

    const failedCard = page.getByTestId('ranked-item-2')
    await expect(failedCard.getByTestId('verdict-bars')).toHaveCount(0)
    await expect(failedCard.getByTestId('probability-tag')).toHaveCount(0)
    await expect(failedCard.getByTestId('attempt-error')).toContainText('empty_universe')
  })

  test('A-14：Sharpe 旁证据探针显示「无法回溯」，点击开侧滑如实说明缺坐标', async ({ page }) => {
    await page.goto('/review')
    await page.waitForSelector('[data-testid="ranked-item-1"]', { timeout: 15000 })

    const trigger = page.getByTestId('ranked-item-1').getByTestId('ev-probe-trigger')
    await expect(trigger).toHaveText('无法回溯')
    await trigger.click()
    await expect(page.getByTestId('ev-probe-untraceable')).toContainText('content_hash')
  })
})
