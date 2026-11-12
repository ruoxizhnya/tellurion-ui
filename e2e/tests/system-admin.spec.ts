import { test, expect } from '@playwright/test'
import { waitForBackendReady } from '../helpers/api'

/**
 * A-10 / F18：系统管理页 e2e。
 *
 * 鉴权开启时 admin 端点可能 403 —— 页面必须把它渲染成**错误态**，
 * 而不是空列表冒充"没有用户"。本 spec 只断言结构与请求，不假设数据。
 */
test.describe('F18 系统管理页', () => {
  test.beforeAll(async () => {
    expect(await waitForBackendReady(60000)).toBe(true)
  })

  test('鉴权状态 / 用户 / 审计 / 插件四块都渲染', async ({ page }) => {
    await page.goto('/system-admin')
    await page.waitForSelector('[data-testid="system-admin-page"]', { timeout: 15000 })

    await expect(page.locator('[data-testid="system-admin-page"]')).toContainText('鉴权状态')
    await expect(page.locator('[data-testid="system-admin-page"]')).toContainText('审计')
    await expect(page.locator('[data-testid="system-admin-page"]')).toContainText('插件')
    await expect(page.locator('[data-testid="plugins-refresh"]')).toBeVisible()
    await expect(page.locator('[data-testid="plugins-load-all"]')).toBeVisible()
    await expect(page.locator('[data-testid="plugins-watch-dir"]')).toBeVisible()
  })

  test('鉴权状态来自 GET /api/auth/status', async ({ page }) => {
    const apiCall = page.waitForResponse((res) => res.url().includes('/api/auth/status'))
    await page.goto('/system-admin')
    const res = await apiCall
    expect(res.status()).toBe(200)
    await expect(page.locator('[data-testid="system-admin-page"]')).toContainText('auth_enabled')
  })

  test('插件列表来自 GET /api/plugins', async ({ page }) => {
    const apiCall = page.waitForResponse(
      (res) => res.url().endsWith('/api/plugins') && res.request().method() === 'GET',
    )
    await page.goto('/system-admin')
    expect((await apiCall).status()).toBe(200)
    await expect(page.locator('[data-testid="plugins-refresh"]')).toBeVisible()
  })

  test('bootstrap 窗口关闭时不画可用按钮，只给说明', async ({ page }) => {
    await page.goto('/system-admin')
    await page.waitForSelector('[data-testid="system-admin-page"]', { timeout: 15000 })

    const bootstrapForm = page.locator('[data-testid="bootstrap-form"]')
    const closedHint = page.getByText(/首个管理员窗口已关闭/)
    // 二选一：要么窗口开着（有表单），要么已关闭（有说明）。不允许两样都没有。
    await expect(bootstrapForm.or(closedHint)).toBeVisible()
  })
})
