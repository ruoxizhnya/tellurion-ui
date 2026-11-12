import { test, expect } from '@playwright/test'
import { waitForBackendReady } from '../helpers/api'
import { isolateTestEnvironment } from '../helpers/isolation'

/**
 * A-09 纸交易观测台（F16）。
 *
 * 断言口径：
 * - 四块（订单/持仓/账户/外部信号）都在；
 * - 页面明示 Mock，不出现暗示真实交易通道的词；
 * - 外部信号流读 `GET /api/signals`（core 2026-11-12 补的读面）；
 *   429/503 时明说「未接通」，不画成「没有信号」；
 * - 紧急平仓在页内，未填原因/确认码前不可提交。
 */
test.describe('A-09 纸交易', () => {
  test.beforeAll(async () => {
    expect(await waitForBackendReady(60000)).toBe(true)
  })

  test.beforeEach(async ({ page }) => {
    await isolateTestEnvironment(page)
    await page.goto('/paper-trading')
    await page.waitForSelector('[data-testid="paper-trading-page"]', { timeout: 15000 })
  })

  test('四块齐备且标注 Mock', async ({ page }) => {
    await expect(page.getByTestId('paper-orders')).toBeVisible()
    await expect(page.getByTestId('paper-positions')).toBeVisible()
    await expect(page.getByTestId('paper-account')).toBeVisible()
    await expect(page.getByTestId('paper-signals')).toBeVisible()
    await expect(page.getByTestId('paper-badge')).toContainText('Mock')
  })

  test('外部信号流接 GET /api/signals 读面，不再用 disabled 占位', async ({ page }) => {
    await expect(page.getByTestId('signals-disabled-subscribe')).toHaveCount(0)
    await expect(page.getByTestId('signals-disabled-input')).toHaveCount(0)
    await expect(page.getByTestId('paper-signals-feed')).toBeVisible()
    // 读数来自哪个端点必须写在页面上，别让人以为是本地造的信号
    await expect(page.getByTestId('paper-signals')).toContainText('GET /api/signals')
    // 三种合法态：有数据 / 合法空流 / 读面未接通（429 或 503）
    await expect(page.getByTestId('paper-signals-feed')).toContainText(
      /暂无外部信号|未接通|ml-model|sig-/,
    )
  })

  test('F16 文案：不出现暗示真实交易通道的词', async ({ page }) => {
    await expect(
      page.getByTestId('paper-trading-page').getByText(/实盘|FIX|Colocation|DMA|TWAP|VWAP|亚毫秒|100 FPS/),
    ).toHaveCount(0)
  })

  test('紧急平仓在页内，未填原因/确认码前不可提交', async ({ page }) => {
    const card = page.locator('.emergency-card')
    await expect(card).toBeVisible()
    await card.getByRole('button', { name: /紧急平仓 \(Arm\)/ }).click()

    const submit = card.getByRole('button', { name: /确认紧急平仓/ })
    await expect(submit).toBeVisible()
    await expect(submit).toBeDisabled()
  })
})
