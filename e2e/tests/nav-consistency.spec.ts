import { test, expect } from '@playwright/test'
import { waitForBackendReady } from '../helpers/api'

/**
 * A-04 侧栏与顶栏统一 —— 可执行取证（TASKS.md A-04 断言 1/3/4/6）。
 *
 * 为什么用 e2e 而不是单测：这三条断言测的是**渲染结果**，不是源码。
 * 本轮已经栽过四次"grep 到 0 命中 ≠ 页面上真的生效"（Chart.js 库默认色、rgba 形式旧色、
 * NavTiles 的 scoped 死规则、BacktestHistory 的死复制），所以导航这种"每页都渲染"的东西
 * 必须在真实页面上量。
 */

/**
 * A-13：侧栏可达的 14 条路由（与 `navItems.ts` 逐项对应）。
 * `/evidence` 已从导航移除（A-06 降级为数字旁内嵌侧滑），路由与页面保留作深链兜底，
 * 因此不进本清单；它的深链可达性与「侧栏无该入口」由下方独立用例覆盖。
 */
const ROUTES = [
  '/',
  '/backtest',
  '/backtest/compare',
  '/walkforward',
  '/screener',
  '/explore',
  '/review',
  '/strategy-lab',
  '/paper-trading',
  '/data-sync',
  '/factors',
  '/alerts',
  '/compliance',
  '/system-admin',
]

test.describe('A-04 导航与顶栏统一', () => {
  test.beforeAll(async () => {
    expect(await waitForBackendReady(60000)).toBe(true)
  })

  /**
   * 断言 1：14 个**导航可达**页面渲染出的侧栏条目集合完全相同。
   *
   * B-04 把 `/copilot`、`/strategy-builder` 收成 `/strategy-lab` 的路由别名：
   * 两个 URL 仍可直达（深链不断），但侧栏不再有对应入口，因此它们不进本清单 ——
   * 这里量的是「侧栏在每页是否一致」，别名页的侧栏本来就与 `/strategy-lab` 同一份。
   */
  test('全部路由的侧栏条目数组逐字相同', async ({ page }) => {
    let baseline: string[] | null = null
    for (const route of ROUTES) {
      await page.goto(route)
      const labels = page.locator('.nav-item .nav-label')
      // 等**条件**而不是等时长：goto 之后 Vue 还要渲染，直接读会拿到 0 个（首跑即如此）
      await expect(labels).not.toHaveCount(0, { timeout: 10000 })
      const texts = (await labels.allTextContents()).map((s) => s.trim())
      if (baseline === null) {
        baseline = texts
        // A-13：绝对值，不从现状推导（曾用 ≥9 下限，会放过"顺手加回一项"）
        expect(texts.length).toBe(14)
      }
      expect(texts, `${route} 的侧栏与首页不一致`).toEqual(baseline)
    }
  })

  /**
   * 高亮唯一：旧实现 `route.path.startsWith(item.path)` 让 /backtest/compare 上
   * 「回测引擎」与「多策略对比」同时高亮。这条断言把"恰好一个 active"钉住。
   */
  test('每条路由恰好一个高亮项，且与路由匹配', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route)
      const active = page.locator('.nav-item.active')
      await expect(active, `${route} 上高亮项数应为 1`).toHaveCount(1)
      const href = await active.getAttribute('href')
      expect(href, `${route} 高亮了 ${href}`).toBe(route)
    }
  })

  /**
   * A-13 断言 1 的另一半：证据质问只降级为**深链**，不是删除。
   * 侧栏不再有入口（A-06 已改为数字旁内嵌侧滑），但 `/evidence` 直达仍必须可用 ——
   * 这两件事必须同时成立，否则要么深链被误删、要么旧入口偷偷留在侧栏。
   */
  test('证据质问：深链 /evidence 仍可达，侧栏无该入口', async ({ page }) => {
    await page.goto('/evidence')
    await page.waitForSelector('.evidence-page', { timeout: 15000 })
    await expect(page.locator('.evidence-page')).toBeVisible()

    await expect(page.locator('[data-nav-path="/evidence"]')).toHaveCount(0)
    await expect(page.locator('.nav-item').filter({ hasText: '证据质问' })).toHaveCount(0)
  })

  /** 断言 4：顶栏不得出现行情/L2/集群字样（ODR-066 B3 判删项） */
  test('顶栏无 SSE / L2 / probe/h / iter/h / QUEUE 字样', async ({ page }) => {
    await page.goto('/')
    const header = page.locator('header.app-header')
    await expect(header.getByText(/\bSSE\b|\bL2\b|probe\/h|iter\/h|HERMES|DETERMINISTIC STABLE|\bQUEUE\b/i)).toHaveCount(0)
  })

  /**
   * 断言 6：键盘 Tab 可达 + 焦点环用 --q-focus 且 ≥3:1。
   *
   * 必须用**真键盘事件**：`:focus-visible` 按交互方式判定，`el.focus()` 程序化聚焦拿不到
   * 焦点环（本轮就因此误判过一次"焦点环没生效"）。
   */
  test('Tab 进入侧栏时焦点环为 --q-focus 且对比度 ≥3:1', async ({ page }) => {
    await page.goto('/')
    // 等侧栏真的渲染出来再按 Tab：全量套件里后端响应慢一拍时，goto 返回后
    // Vue 还没挂载完，Tab 会落在随后被重渲染替换掉的元素上（实测 full-suite 红、
    // 隔离连跑 3 次全绿）。与断言 1 同一条纪律：等条件，不等时长。
    await expect(page.locator('.nav-item').first()).toBeVisible({ timeout: 15000 })
    const focusVar = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--q-focus').trim())
    expect(focusVar).toBe('#b4c5ff')

    let onNavItem = false
    for (let i = 0; i < 20 && !onNavItem; i++) {
      await page.keyboard.press('Tab')
      onNavItem = await page.evaluate(() =>
        document.activeElement?.classList?.contains('nav-item') === true)
    }
    expect(onNavItem, '20 次 Tab 内未到达侧栏任何入口').toBe(true)

    /**
     * 必须 poll 而不是读完就走：`.nav-item` 上有 `transition: all`，而
     * `outline-color` / `outline-width` 是**可动画**属性（`outline-style` 是离散的，立刻生效）。
     * 聚焦后立刻取 computed 会读到动画起点（currentColor / 3px），看起来就像规则没生效 ——
     * 本轮排查焦点环时正是被这个假象带偏了一次。等条件成立，不猜时长。
     */
    await expect
      .poll(() => page.evaluate(() => {
        const cs = getComputedStyle(document.activeElement as Element)
        return `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`
      }), { timeout: 3000 })
      .toBe('solid 2px rgb(180, 197, 255)')
  })
})
