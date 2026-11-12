import { describe, expect, it } from 'vitest'
import {
  STRATEGY_TABS,
  resolveStrategyTab,
  strategyTabLocation,
} from './strategyHub'

describe('B-04 策略库三页合一的 tab 解析', () => {
  it('三个 tab 的名字就是设计稿的三个（lab / builder / copilot）', () => {
    expect([...STRATEGY_TABS]).toEqual(['lab', 'builder', 'copilot'])
  })

  it('旧路径别名优先：/copilot 与 /strategy-builder 各自落到对应 tab', () => {
    expect(resolveStrategyTab('/copilot', undefined)).toBe('copilot')
    expect(resolveStrategyTab('/copilot', 'lab')).toBe('copilot')
    expect(resolveStrategyTab('/strategy-builder', undefined)).toBe('builder')
    expect(resolveStrategyTab('/strategy-builder', 'copilot')).toBe('builder')
  })

  it('/strategy-lab 读 query.tab；非法值落回 lab', () => {
    expect(resolveStrategyTab('/strategy-lab', 'builder')).toBe('builder')
    expect(resolveStrategyTab('/strategy-lab', 'copilot')).toBe('copilot')
    expect(resolveStrategyTab('/strategy-lab', 'nope')).toBe('lab')
    expect(resolveStrategyTab('/strategy-lab', undefined)).toBe('lab')
  })

  it('切 tab 的目标地址：lab 不带 query', () => {
    expect(strategyTabLocation('lab')).toBe('/strategy-lab')
    expect(strategyTabLocation('builder')).toBe('/strategy-lab?tab=builder')
    expect(strategyTabLocation('copilot')).toBe('/strategy-lab?tab=copilot')
  })
})
