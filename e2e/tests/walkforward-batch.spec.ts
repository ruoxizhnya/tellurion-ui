import { test, expect } from '@playwright/test'
import { waitForBackendReady } from '../helpers/api'

/**
 * A-10：走向验证 + 批量回测 e2e。
 *
 * 关键边界：后端 export 只有 json；csv 分支回 501。页面**不得**出现
 * csv 控件 —— 这条是"不画后端不存在的控件"的可执行判据。
 */
test.describe('走向验证与批量回测', () => {
  test.beforeAll(async () => {
    expect(await waitForBackendReady(60000)).toBe(true)
  })

  test('两个 tab 与表单渲染', async ({ page }) => {
    await page.goto('/walkforward')
    await page.waitForSelector('[data-testid="walkforward-batch-page"]', { timeout: 15000 })

    await expect(page.locator('.n-tabs-tab').filter({ hasText: '走向验证' })).toBeVisible()
    await expect(page.locator('.n-tabs-tab').filter({ hasText: '批量回测' })).toBeVisible()
    await expect(page.locator('[data-testid="wf-strategy"]')).toBeVisible()
    await expect(page.locator('[data-testid="wf-run"]')).toBeVisible()
  })

  test('批量 tab 默认带一条任务，且只提供 json 导出', async ({ page }) => {
    await page.goto('/walkforward')
    await page.waitForSelector('[data-testid="walkforward-batch-page"]', { timeout: 15000 })
    await page.locator('.n-tabs-tab').filter({ hasText: '批量回测' }).click()

    const tasks = page.locator('[data-testid="batch-tasks"] textarea')
    await expect(tasks).toBeVisible()
    expect(await tasks.inputValue()).toContain('"strategy"')

    // csv 后端 501 ⇒ 页面不得画 csv；报告生成前连 json 按钮也不该有。
    await expect(page.getByRole('button', { name: /csv/i })).toHaveCount(0)
    await expect(page.locator('[data-testid="batch-export"]')).toHaveCount(0)
  })

  test('walk-forward 运行发出 POST /api/walkforward', async ({ page }) => {
    await page.goto('/walkforward')
    await page.waitForSelector('[data-testid="walkforward-batch-page"]', { timeout: 15000 })

    await page.locator('[data-testid="wf-strategy"] input').fill('ma_cross')
    const apiCall = page.waitForResponse(
      (res) => res.url().includes('/api/walkforward') && res.request().method() === 'POST',
    )
    await page.locator('[data-testid="wf-run"]').click()

    const res = await apiCall
    // 路由接对了就不会是 404/405。真实后端在数据不足时可能回 400/422/500；
    // 那也必须渲染成错误态，而不是假装成功。
    expect(res.status()).not.toBe(404)
    expect(res.status()).not.toBe(405)
    if (res.status() >= 400) {
      await expect(page.locator('[data-testid="wf-error"]')).toBeVisible()
    } else {
      await expect(page.locator('[data-testid="wf-report"]')).toBeVisible()
    }
  })
})
