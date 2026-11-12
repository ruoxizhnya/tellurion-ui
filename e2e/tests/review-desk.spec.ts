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
})
