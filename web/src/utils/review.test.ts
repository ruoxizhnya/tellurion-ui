import { describe, expect, it } from 'vitest'
import type { AttemptView, Challenge, Verdict } from '@/api/explore'
import { causalStrength, groupChallenges, plateauArea, rankAttempts } from './review'

function attempt(seq: number, sharpe: number, opts: Partial<AttemptView> = {}): AttemptView {
  return {
    seq,
    hypothesis: `h${seq}`,
    params: {},
    experiment_id: seq,
    sharpe,
    ok: true,
    verdict: null,
    ...opts,
  }
}

function verdictWith(causalProbability?: number): Verdict {
  return {
    dimensions: { statistical: 0.6, economic: 0.5 },
    probability: 0.5,
    geometric_mean: 0.55,
    blocking: 0,
    challenges: [],
    causal:
      causalProbability === undefined
        ? null
        : { mechanism: 'm', testable: 2, passed: 2, failed: 0, probability: causalProbability },
  }
}

describe('plateauArea', () => {
  it('统计 ±10% 邻域内的成功尝试个数（含自身）', () => {
    const all = [attempt(1, 1.5), attempt(2, 1.52), attempt(3, 1.48), attempt(4, 2.4)]
    expect(plateauArea(all[0], all)).toBe(3)
    expect(plateauArea(all[3], all)).toBe(1)
  })

  it('失败尝试不参与邻域，自身也没有平台面积', () => {
    const all = [attempt(1, 1.5), attempt(2, 1.5, { ok: false }), attempt(3, 0.2)]
    expect(plateauArea(all[1], all)).toBe(0)
    expect(plateauArea(all[0], all)).toBe(1)
  })

  it('负 Sharpe 的邻域按绝对值取半径，不会区间反向', () => {
    const all = [attempt(1, -1.0), attempt(2, -1.05), attempt(3, -2.0)]
    expect(plateauArea(all[0], all)).toBe(2)
  })
})

describe('causalStrength', () => {
  it('有因果维时用因果概率；未评估时取中性 0.5（不是 0）', () => {
    expect(causalStrength(attempt(1, 1, { verdict: verdictWith(0.9) }))).toBe(0.9)
    expect(causalStrength(attempt(1, 1, { verdict: verdictWith() }))).toBe(0.5)
    expect(causalStrength(attempt(1, 1, { verdict: null }))).toBe(0.5)
  })
})

describe('rankAttempts', () => {
  it('反例：Sharpe 最高的孤峰**不**排第一，宽平台优先', () => {
    // A（seq 1）Sharpe 2.0，四周空无一物；B（seq 2..4）挤在 1.5 附近的平台上。
    // 平台内再按因果强度分先后（0.9 / 0.5 / 0.4），避免同分时靠 Sharpe 决出 ——
    // 那会让「不按 Sharpe 排序」这条断言退化成靠运气。
    const all = [
      attempt(1, 2.0),
      attempt(2, 1.5, { verdict: verdictWith(0.9) }),
      attempt(3, 1.52, { verdict: verdictWith(0.5) }),
      attempt(4, 1.48, { verdict: verdictWith(0.4) }),
    ]
    const ranked = rankAttempts(all)

    expect(ranked[0].attempt.seq).toBe(2)
    expect(ranked[0].plateau).toBe(3)
    // 孤峰排在其后，证明主排序键不是 Sharpe
    expect(ranked.findIndex((r) => r.attempt.seq === 1)).toBeGreaterThan(0)
    expect(ranked[0].score).toBeGreaterThan(ranked.find((r) => r.attempt.seq === 1)!.score)
  })

  it('输出按 seq 升序归档后的稳定排序（同分不抖动）', () => {
    const all = [attempt(3, 1.0), attempt(1, 1.0), attempt(2, 1.0)]
    const ids = rankAttempts(all).map((r) => r.attempt.seq)
    expect(ids).toEqual([1, 2, 3])
  })

  it('失败尝试排在成功尝试之后', () => {
    const all = [attempt(1, 0, { ok: false }), attempt(2, 1.2)]
    const ranked = rankAttempts(all)
    expect(ranked[0].attempt.seq).toBe(2)
    expect(ranked[1].score).toBe(0)
  })
})

describe('groupChallenges（A-14 断言 2）', () => {
  function challenge(severity: Challenge['severity'], message: string): Challenge {
    return { dimension: 'robustness', severity, message }
  }

  it('乱序输入按 blocking → warning → note 分组，组内保持原序', () => {
    const groups = groupChallenges([
      challenge('note', 'n1'),
      challenge('blocking', 'b1'),
      challenge('warning', 'w1'),
      challenge('blocking', 'b2'),
      challenge('note', 'n2'),
    ])

    expect(groups.map((g) => g.severity)).toEqual(['blocking', 'warning', 'note'])
    expect(groups[0].items.map((c) => c.message)).toEqual(['b1', 'b2'])
    expect(groups[1].items.map((c) => c.message)).toEqual(['w1'])
    expect(groups[2].items.map((c) => c.message)).toEqual(['n1', 'n2'])
  })

  it('空组被丢掉：只有 note 时 blocking 排在最前这条也不制造空标题', () => {
    const groups = groupChallenges([challenge('note', 'n1')])
    expect(groups.map((g) => g.severity)).toEqual(['note'])
  })

  it('空清单返回空数组（页面据此显示「无质疑」）', () => {
    expect(groupChallenges([])).toEqual([])
  })
})
