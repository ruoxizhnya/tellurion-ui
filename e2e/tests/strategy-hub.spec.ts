import { test, expect } from '@playwright/test'
import { waitForBackendReady } from '../helpers/api'
import { isolateTestEnvironment } from '../helpers/isolation'

/**
 * B-04：策略库 / 编辑器 / Copilot 三页合一（F11）。
 *
 * 断言口径：
 * - 合并后侧栏只剩一个入口，三个内容面通过 tab 切换；
 * - 旧 URL `/copilot`、`/strategy-builder` 作为**路由别名**仍然直达，
 *   且停在各自内容上（不是被重定向到 `/strategy-lab` 丢掉上下文）；
 * - Copilot 依赖 ai-service，页面必须把这条依赖写在明面上，而不是等失败才发现。
 */
test.describe('B-04 策略库三页合一', () => {
  test.beforeAll(async () => {
    expect(await waitForBackendReady(60000)).toBe(true)
  })

  test.beforeEach(async ({ page }) => {
    await isolateTestEnvironment(page)
  })

  test('/strategy-lab 渲染 hub 与三个 tab，默认停在策略库', async ({ page }) => {
    await page.goto('/strategy-lab')
    await page.waitForSelector('[data-testid="strategy-hub"]', { timeout: 15000 })

    await expect(page.getByTestId('strategy-tabs')).toBeVisible()
    // naive-ui 的 tab 头是 .n-tabs-tab，用文案过滤；不要用 getByRole('tab')，
    // 该实现下 role 与可访问名不保证暴露（首跑即裁在这里，不是页面没渲染）。
    const tabs = page.locator('.n-tabs-tab')
    await expect(tabs).toHaveCount(3)
    await expect(tabs.nth(0)).toContainText('策略库')
    await expect(tabs.nth(1)).toContainText('编辑器')
    await expect(tabs.nth(2)).toContainText('Copilot')

    // 默认 tab 是策略库：原 StrategyLab 页面在 DOM 中可见
    await expect(page.locator('.strategy-lab-page')).toBeVisible()
    // display-directive="show" 保留非激活 tab 的 DOM，但不可见
    await expect(page.locator('.copilot-page')).toBeHidden()
  })

  test('切到编辑器与 Copilot 时 URL 带 tab，内容面随之可见', async ({ page }) => {
    await page.goto('/strategy-lab')
    await page.waitForSelector('[data-testid="strategy-hub"]', { timeout: 15000 })

    await page.locator('.n-tabs-tab').filter({ hasText: '编辑器' }).click()
    await expect(page).toHaveURL(/\/strategy-lab\?tab=builder/)
    await expect(page.locator('.builder-page')).toBeVisible()

    await page.locator('.n-tabs-tab').filter({ hasText: 'Copilot' }).click()
    await expect(page).toHaveURL(/\/strategy-lab\?tab=copilot/)
    await expect(page.locator('.copilot-page')).toBeVisible()
  })

  test('直达 /copilot 保留别名 URL 并落在 Copilot tab', async ({ page }) => {
    await page.goto('/copilot')
    await page.waitForSelector('.copilot-page', { timeout: 15000 })

    await expect(page).toHaveURL(/\/copilot$/)
    await expect(page.locator('.copilot-page')).toBeVisible()
    await expect(page.locator('.strategy-lab-page')).toBeHidden()
  })

  test('直达 /strategy-builder 保留别名 URL 并落在编辑器 tab', async ({ page }) => {
    await page.goto('/strategy-builder')
    await page.waitForSelector('.builder-page', { timeout: 15000 })

    await expect(page).toHaveURL(/\/strategy-builder$/)
    await expect(page.locator('.builder-page')).toBeVisible()
  })

  test('侧栏只有一个「策略库」入口，不再有编辑器/Copilot 独立项', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="sidebar-nav"]', { timeout: 15000 })

    await expect(page.locator('[data-nav-path="/strategy-lab"]')).toHaveCount(1)
    await expect(page.locator('[data-nav-path="/copilot"]')).toHaveCount(0)
    await expect(page.locator('[data-nav-path="/strategy-builder"]')).toHaveCount(0)
  })

  test('Copilot 依赖写在前台：ai-service 与 llm_failed 真实失败路径', async ({ page }) => {
    await page.goto('/strategy-lab')
    const dep = page.getByTestId('copilot-dependency')
    await expect(dep).toBeVisible()
    await expect(dep).toContainText('ai-service')
    await expect(dep).toContainText('llm_failed')
  })
})
