import { test, expect } from '@playwright/test'
import { waitForBackendReady } from '../helpers/api'
import { isolateTestEnvironment } from '../helpers/isolation'

/**
 * A-09 纸交易观测台（F16）。
 *
 * 断言口径：
 * - 四块（订单/持仓/账户/外部信号）都在；
 * - 页面明示 Mock，不出现暗示真实交易通道的词；
 * - 外部信号流 disabled 并写清依赖（core 只有 POST 写门）；
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

  test('外部信号流 disabled，依赖写在原位', async ({ page }) => {
    await expect(page.getByTestId('signals-dependency')).toContainText('POST /api/signals')
    await expect(page.getByTestId('signals-dependency')).toContainText('没有读面')
    await expect(page.getByTestId('signals-disabled-subscribe')).toBeDisabled()
    await expect(page.getByTestId('signals-disabled-input').locator('input')).toBeDisabled()
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
