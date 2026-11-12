import { test, expect } from '@playwright/test'
import { waitForBackendReady } from '../helpers/api'
import { isolateTestEnvironment } from '../helpers/isolation'

/**
 * A-04 断言 5：⌘K 命令面板 + 「待审阅」disabled 角标。
 *
 * 断言口径：
 * - Ctrl/⌘+K 打开面板，列表与侧栏同源（13 项）；
 * - 过滤后只剩命中项，Enter 真的跳过去；
 * - 「待审阅 N」在 core 聚合读面（G1）就绪前必须是 disabled 形态，不能点了没反应
 *   又看不出原因。
 */
test.describe('⌘K 命令面板', () => {
  test.beforeAll(async () => {
    expect(await waitForBackendReady(60000)).toBe(true)
  })

  test.beforeEach(async ({ page }) => {
    await isolateTestEnvironment(page)
    await page.goto('/')
    await page.waitForSelector('.dashboard-page', { timeout: 15000 })
  })

  test('Ctrl+K 打开面板，Esc 关闭', async ({ page }) => {
    await expect(page.getByTestId('command-palette')).toHaveCount(0)

    await page.keyboard.press('Control+k')
    await expect(page.getByTestId('command-palette')).toBeVisible()
    await expect(page.locator('[data-testid^="command-item-"]')).toHaveCount(14)

    await page.keyboard.press('Escape')
    await expect(page.getByTestId('command-palette')).toHaveCount(0)
  })

  test('输入过滤后 Enter 跳到目标页', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await page.getByTestId('command-input').locator('input').fill('合规')
    await expect(page.locator('[data-testid^="command-item-"]')).toHaveCount(1)
    await expect(page.getByTestId('command-item-compliance')).toBeVisible()

    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/compliance/)
    await expect(page.locator('.compliance-page')).toBeVisible()
  })

  test('无匹配时给出显式空态而不是空白列表', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await page.getByTestId('command-input').locator('input').fill('zzz')
    await expect(page.getByTestId('command-empty')).toBeVisible()
    await expect(page.locator('[data-testid^="command-item-"]')).toHaveCount(0)
  })

  test('header 的 ⌘K 按钮能打开同一面板', async ({ page }) => {
    await page.getByTestId('header-command-trigger').click()
    await expect(page.getByTestId('command-palette')).toBeVisible()
  })

  test('「待审阅」角标是 disabled 形态，点击不跳转', async ({ page }) => {
    const badge = page.getByTestId('header-review-badge')
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('待审阅')
    await expect(badge).toHaveAttribute('aria-disabled', 'true')

    await badge.click()
    await expect(page).toHaveURL(/\/$/)
  })
})
