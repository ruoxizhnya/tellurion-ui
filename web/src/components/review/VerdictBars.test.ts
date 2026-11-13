import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import VerdictBars from './VerdictBars.vue'
import type { Verdict } from '@/api/explore'

function verdict(over: Partial<Verdict> = {}): Verdict {
  return {
    dimensions: {
      statistical: 0.8,
      economic: 0.6,
      robustness: 0.55,
      bias: 0.7,
      redundancy: 0.65,
      causal: 0.9,
    },
    probability: 0.55,
    geometric_mean: 0.69,
    blocking: 0,
    challenges: [],
    ...over,
  }
}

describe('VerdictBars（A-14 断言 1）', () => {
  it('六维按 DIMENSION_ORDER 固定顺序渲染，每维显示 assessed 值', () => {
    const w = mount(VerdictBars, { props: { verdict: verdict() } })

    const rows = w.findAll('[data-testid^="verdict-row-"]')
    expect(rows).toHaveLength(6)
    expect(rows.map((r) => r.attributes('data-testid'))).toEqual([
      'verdict-row-statistical',
      'verdict-row-economic',
      'verdict-row-robustness',
      'verdict-row-bias',
      'verdict-row-redundancy',
      'verdict-row-causal',
    ])
    expect(w.find('[data-testid="verdict-value-statistical"]').text()).toBe('0.80')
    // 全评估时不出现否决提示
    expect(w.find('[data-testid="verdict-veto"]').exists()).toBe(false)
  })

  it('unassessed 维显式标「未评估」，不画成 0 分（不渲染填充条）', () => {
    const w = mount(VerdictBars, {
      props: {
        verdict: verdict({
          // 契约上二者不该冲突；真冲突时按未评估处理
          dimensions: { statistical: 0.8, economic: 0.6, robustness: 0.9 },
          unassessed: ['robustness', 'bias', 'redundancy', 'causal'],
        }),
      },
    })

    expect(w.find('[data-testid="verdict-unassessed-robustness"]').text()).toBe('未评估')
    expect(w.find('[data-testid="verdict-value-robustness"]').text()).toBe('—')
    // 关键反例：绝不出现 0% 宽的填充条
    expect(w.find('[data-testid="verdict-fill-robustness"]').exists()).toBe(false)
    expect(w.find('[data-testid="verdict-veto"]').exists()).toBe(true)
  })

  it('六维全未评估时六行都是「未评估」并给出否决提示', () => {
    const w = mount(VerdictBars, {
      props: {
        verdict: verdict({
          dimensions: {},
          unassessed: ['statistical', 'economic', 'robustness', 'bias', 'redundancy', 'causal'],
        }),
      },
    })

    expect(w.findAll('[data-testid^="verdict-unassessed-"]')).toHaveLength(6)
    expect(w.findAll('[data-testid^="verdict-fill-"]')).toHaveLength(0)
    expect(w.find('[data-testid="verdict-veto"]').exists()).toBe(true)
  })

  it('verdict 缺席（失败尝试）时整块不渲染', () => {
    const w = mount(VerdictBars, { props: { verdict: null } })
    expect(w.find('[data-testid="verdict-bars"]').exists()).toBe(false)
  })
})
