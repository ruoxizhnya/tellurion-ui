import { describe, expect, it } from 'vitest'
import { binCalibration, binIndex, CALIBRATION_MIN_SAMPLE, splitHoldout } from './calibration'
import type { CalibrationEntry } from '@/api/pipeline'

function entry(overrides: Partial<CalibrationEntry> = {}): CalibrationEntry {
  return {
    proposal_id: 'run-1:1',
    actor: 'local',
    intervention: '因为平台宽',
    adopted: true,
    claimed_confidence: 0.7,
    is_holdout: false,
    outcome_hit: null,
    result_ref: 'exp:1',
    created_at: '2026-11-01T00:00:00Z',
    resolved_at: null,
    ...overrides,
  }
}

describe('A-12 校准分箱（纯函数）', () => {
  it('按声称置信度 10 等分箱，1.0 归入最后一箱（不越界）', () => {
    expect(binIndex(0)).toBe(0)
    expect(binIndex(0.1)).toBe(1)
    expect(binIndex(0.999)).toBe(9)
    expect(binIndex(1)).toBe(9)
    // 脏值不制造越界下标
    expect(binIndex(-1)).toBe(0)
    expect(binIndex(Number.NaN)).toBe(0)
  })

  it('命中率分母只算已回填样本，待回填单独计数', () => {
    const bins = binCalibration([
      entry({ claimed_confidence: 0.72, outcome_hit: true }),
      entry({ claimed_confidence: 0.75, outcome_hit: false }),
      entry({ claimed_confidence: 0.78, outcome_hit: null }),
    ])

    expect(bins).toHaveLength(1)
    const bin = bins[0]
    expect(bin.label).toBe('0.7–0.8')
    expect(bin.n).toBe(2)
    expect(bin.hits).toBe(1)
    expect(bin.hitRate).toBe(0.5)
    expect(bin.pending).toBe(1)
    expect(bin.claimedRate).toBeCloseTo(0.735, 3)
  })

  it('只有待回填的箱 hitRate 为 null（不渲染成 0%）', () => {
    const bins = binCalibration([entry({ claimed_confidence: 0.55, outcome_hit: null })])

    expect(bins).toHaveLength(1)
    expect(bins[0].n).toBe(0)
    expect(bins[0].pending).toBe(1)
    expect(bins[0].hitRate).toBeNull()
    expect(bins[0].claimedRate).toBeNull()
  })

  it('holdout 与主样本分流，不混算', () => {
    const entries = [
      entry({ proposal_id: 'a', claimed_confidence: 0.8, outcome_hit: true }),
      entry({ proposal_id: 'b', claimed_confidence: 0.8, outcome_hit: false, is_holdout: true }),
    ]
    const { main, holdout } = splitHoldout(entries)

    expect(main.map((e) => e.proposal_id)).toEqual(['a'])
    expect(holdout.map((e) => e.proposal_id)).toEqual(['b'])

    // 主样本单独分箱：命中率 100%，不会被 holdout 的 miss 稀释
    expect(binCalibration(main)[0].hitRate).toBe(1)
    expect(binCalibration(holdout)[0].hitRate).toBe(0)
  })

  it('不返回空箱，大小写/边界值都落到确定的一档', () => {
    const bins = binCalibration([
      entry({ proposal_id: 'a', claimed_confidence: 1, outcome_hit: true }),
      entry({ proposal_id: 'b', claimed_confidence: 0.05, outcome_hit: false }),
    ])

    expect(bins.map((b) => b.label)).toEqual(['0.0–0.1', '0.9–1.0'])
  })

  it('小样本门槛是 30（页面据此显式提示，不做显著性包装）', () => {
    expect(CALIBRATION_MIN_SAMPLE).toBe(30)
  })
})
