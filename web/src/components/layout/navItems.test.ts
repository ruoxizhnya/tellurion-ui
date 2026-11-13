import { describe, expect, it } from 'vitest'
import { commandItemTestId, filterNavItems, NAV_ITEMS, navTestId } from './navItems'

/**
 * A-04 断言 5：命令面板与侧栏共用 `navItems.ts`。
 * 这里只测**纯函数**（过滤/锚点）；键盘与跳转在 e2e/command-palette.spec.ts 里跑真实 DOM。
 */
describe('filterNavItems', () => {
  it('空关键词返回全量导航项（14 项，与侧栏一致）', () => {
    expect(NAV_ITEMS).toHaveLength(14)
    expect(filterNavItems('')).toHaveLength(14)
    expect(filterNavItems('   ')).toHaveLength(14)
  })

  it('按标签子串过滤，大小写不敏感、去首尾空格', () => {
    // 「策略」同时命中 多策略对比 与 策略库 —— 顺序沿用导航表声明顺序
    expect(filterNavItems('策略').map((i) => i.label)).toEqual(['多策略对比', '策略库'])
    expect(filterNavItems('  SYSTEM-ADMIN  ').map((i) => i.label)).toEqual(['系统管理'])
  })

  it('也按路径子串过滤（记得住 URL 的人不必记中文标签）', () => {
    expect(filterNavItems('compare').map((i) => i.path)).toEqual(['/backtest/compare'])
  })

  it('无匹配时返回空数组，不回落成全量', () => {
    expect(filterNavItems('zzz')).toEqual([])
  })
})

describe('testid 生成', () => {
  it('侧栏锚点保持 AUD-63 口径', () => {
    expect(navTestId('/')).toBe('nav-item-home')
    expect(navTestId('/backtest/compare')).toBe('nav-item-backtest-compare')
  })

  it('命令面板锚点与侧栏同规则', () => {
    expect(commandItemTestId('/')).toBe('command-item-home')
    expect(commandItemTestId('/backtest/compare')).toBe('command-item-backtest-compare')
    expect(commandItemTestId('/system-admin')).toBe('command-item-system-admin')
  })
})
