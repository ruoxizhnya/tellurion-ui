import { test, expect } from '@playwright/test'
import { waitForBackendReady } from '../helpers/api'

/**
 * A-10 / F17：合规页 e2e。
 *
 * 只断言"页面把真实端点接上了"的可见证据，不假装后端一定返回某条规则：
 * 规则表可能为空，但四个 tab 与 9 条端点徽标必须存在；点"检查"必须真的
 * 发出 POST /api/compliance/check。
 */
test.describe('F17 合规页', () => {
  test.beforeAll(async () => {
    expect(await waitForBackendReady(60000)).toBe(true)
  })

  test('四个面板与 9 条端点徽标可见', async ({ page }) => {
    await page.goto('/compliance')
    await page.waitForSelector('[data-testid="compliance-page"]', { timeout: 15000 })

    await expect(page.locator('[data-testid="compliance-tabs"]')).toBeVisible()
    for (const tab of ['适当性', '异常交易', '大额交易日报', '减持规则']) {
      await expect(page.locator('.n-tabs-tab').filter({ hasText: tab })).toBeVisible()
    }
    await expect(page.locator('[data-testid="compliance-page"]')).toContainText('/api/compliance/* 9 条')
  })

  test('适当性检查真的发出 POST /api/compliance/check', async ({ page }) => {
    await page.goto('/compliance')
    await page.waitForSelector('[data-testid="compliance-page"]', { timeout: 15000 })

    await page.locator('[data-testid="compliance-symbol"] input').fill('600000')
    const apiCall = page.waitForResponse(
      (res) => res.url().includes('/api/compliance/check') && res.request().method() === 'POST',
    )
    await page.locator('[data-testid="compliance-check"]').click()

    const res = await apiCall
    expect([200, 422]).toContain(res.status())
    await expect(page.locator('[data-testid="compliance-verdict"]')).toBeVisible()
  })

  test('减持 tab 的规则快照来自 GET .../divestment/rules', async ({ page }) => {
    // 规则在页面挂载时就并发拉取；监听必须在 goto 之前建立。
    const apiCall = page.waitForResponse((res) =>
      res.url().includes('/api/compliance/divestment/rules'),
    )
    await page.goto('/compliance')
    await page.waitForSelector('[data-testid="compliance-page"]', { timeout: 15000 })
    expect((await apiCall).status()).toBe(200)

    await page.locator('.n-tabs-tab').filter({ hasText: '减持规则' }).click()
    await expect(page.locator('[data-testid="dv-check"]')).toBeVisible()
    await expect(page.locator('[data-testid="dv-holder-type"]')).toBeVisible()
  })

  test('不画后端不存在的"实盘/券商"控件', async ({ page }) => {
    await page.goto('/compliance')
    await page.waitForSelector('[data-testid="compliance-page"]', { timeout: 15000 })
    await expect(page.locator('[data-testid="compliance-page"]').getByText(/实盘|券商|FIX|TWAP/)).toHaveCount(0)
  })
})
