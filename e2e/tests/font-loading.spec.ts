import { test, expect } from '@playwright/test'

/**
 * A-11 字体决策的证据（ODR-001，自托管拉丁子集）。
 *
 * 断言口径：
 * - 断言 2：`document.fonts.check('12px Inter')` 在真实页面为 true；
 * - 断言 4（订正版）：**CJK 不打包**，由系统栈承担 —— 用「没有 Noto Sans SC 的
 *   @font-face」证明没有自带该字体，并记录 `document.fonts.check` 的实际值；
 *   不把「宿主没装这个字体」伪装成加载失败；
 * - 断言 5：数据单元的计算样式 `font-variant-numeric` 为 tabular-nums。
 */
test.describe('A-11 字体加载', () => {
  test('Inter 与 JetBrains Mono 由页面自带并已就绪', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.dashboard-page', { timeout: 15000 })
    // JetBrains Mono 只用在数据单元（等宽），首屏不一定有元素触发它 ——
    // 显式 load 再 check，否则 check() 对「声明了但没被用到」的字体一律回 false。
    await page.evaluate(() => document.fonts.load('12px "JetBrains Mono"'))
    await page.evaluate(() => document.fonts.ready)

    const report = await page.evaluate(() => ({
      inter: document.fonts.check('12px Inter'),
      mono: document.fonts.check('12px "JetBrains Mono"'),
      bodyFamily: getComputedStyle(document.body).fontFamily,
      faceFamilies: [...document.fonts].map((f) => f.family),
    }))

    expect(report.inter).toBe(true)
    expect(report.mono).toBe(true)
    expect(report.bodyFamily).toContain('Inter')
    // @font-face 只应有自带的两族（Inter 三个字重 + JetBrains Mono 一个字重）
    expect(report.faceFamilies.filter((f) => /Inter/i.test(f)).length).toBeGreaterThanOrEqual(1)
    expect(report.faceFamilies.some((f) => /JetBrains Mono/i.test(f))).toBe(true)
  })

  test('CJK 不自带：页面没有 Noto Sans SC 的 @font-face，实际值如实记录', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.dashboard-page', { timeout: 15000 })
    await page.evaluate(() => document.fonts.ready)

    const cjk = await page.evaluate(() => {
      const families = [...document.fonts].map((f) => f.family)
      return {
        selfBundled: families.some((f) => /Noto Sans SC/i.test(f)),
        check: document.fonts.check('12px "Noto Sans SC"'),
        // 栈里仍在 CJK 位留了 Noto Sans SC → PingFang SC → Microsoft YaHei
        stack: getComputedStyle(document.body).fontFamily,
      }
    })

    // 断言 4 的订正：不打包 CJK；栈里保留系统族顺序
    expect(cjk.selfBundled).toBe(false)
    expect(cjk.stack).toContain('Noto Sans SC')
    expect(cjk.stack).toContain('PingFang SC')
    expect(cjk.stack).toContain('Microsoft YaHei')
    // 真实值写进报告（宿主装了该系统字体时为 true），不做成败断言
    test.info().annotations.push({
      type: 'document.fonts.check(Noto Sans SC)',
      description: String(cjk.check),
    })
  })

  test('数据单元使用 tabular-nums，数字不横向跳动', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.dashboard-page', { timeout: 15000 })

    const variant = await page.evaluate(() => {
      const cell = document.createElement('td')
      document.body.appendChild(cell)
      const value = getComputedStyle(cell).fontVariantNumeric
      cell.remove()
      return value
    })
    expect(variant).toBe('tabular-nums')
  })
})
