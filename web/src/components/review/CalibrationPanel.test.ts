import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { flushPromises, mount } from '@vue/test-utils'
import CalibrationPanel from './CalibrationPanel.vue'
import * as pipelineApi from '@/api/pipeline'
import { ApiError } from '@/api/client'
import type { Calibration, CalibrationEntry } from '@/api/pipeline'

vi.mock('@/api/pipeline', () => ({ getCalibration: vi.fn() }))

function entry(overrides: Partial<CalibrationEntry> = {}): CalibrationEntry {
  return {
    proposal_id: 'run-1:1',
    actor: 'local',
    intervention: '因为平台宽',
    adopted: true,
    claimed_confidence: 0.8,
    is_holdout: false,
    outcome_hit: true,
    result_ref: 'exp:1',
    created_at: '2026-11-01T00:00:00Z',
    resolved_at: '2026-11-02T00:00:00Z',
    ...overrides,
  }
}

function calibration(overrides: Partial<Calibration> = {}): Calibration {
  return {
    sample_size: 12,
    hit_rate: 0.5833,
    claimed_rate: 0.7,
    calibration_error: 0.1167,
    brier_score: 0.2431,
    pending: 3,
    holdout: { sample_size: 4, hit_rate: 0.5 },
    entries: [entry()],
    ...overrides,
  }
}

async function mountPanel() {
  const w = mount(CalibrationPanel)
  await flushPromises()
  return w
}

describe('A-12 校准驾驶舱', () => {
  beforeEach(() => {
    vi.mocked(pipelineApi.getCalibration).mockReset()
    vi.mocked(pipelineApi.getCalibration).mockResolvedValue(calibration())
  })

  it('汇总读数照抄后端：命中率 / 声称率 / 校准误差 / Brier，不写评分或等级', async () => {
    const w = await mountPanel()

    expect(pipelineApi.getCalibration).toHaveBeenCalledTimes(1)
    expect(w.find('[data-testid="cal-sample-size"]').text()).toBe('12')
    expect(w.find('[data-testid="cal-hit-rate"]').text()).toBe('58.3%')
    expect(w.find('[data-testid="cal-claimed-rate"]').text()).toBe('70.0%')
    expect(w.find('[data-testid="cal-cal-error"]').text()).toBe('11.7 个百分点')
    expect(w.find('[data-testid="cal-brier"]').text()).toBe('0.243')
    // 不给「评级/分数等级」这类包装
    expect(w.text()).not.toContain('评级')
    expect(w.text()).not.toContain('等级')
  })

  it('已回填与待回填分开说：待回填不进命中率分母', async () => {
    const w = await mountPanel()
    const pending = w.find('[data-testid="cal-pending"]').text()
    expect(pending).toContain('已回填 12 条（不含 holdout）计入命中率')
    expect(pending).toContain('待回填 3 条不计入')
  })

  it('pending 缺失时显示「—」，不冒充 0', async () => {
    vi.mocked(pipelineApi.getCalibration).mockResolvedValue(
      calibration({ pending: null as unknown as number }),
    )
    const w = await mountPanel()
    expect(w.find('[data-testid="cal-pending"]').text()).toBe('待回填：—')
  })

  it('样本量 < 30 显式提示「样本不足，仅供参考」', async () => {
    vi.mocked(pipelineApi.getCalibration).mockResolvedValue(calibration({ sample_size: 5 }))
    const w = await mountPanel()
    expect(w.find('[data-testid="cal-low-sample"]').text()).toContain('样本不足')
    expect(w.find('[data-testid="cal-low-sample"]').text()).toContain('n=5')
  })

  it('样本量充足时不显示样本不足提示', async () => {
    vi.mocked(pipelineApi.getCalibration).mockResolvedValue(calibration({ sample_size: 30 }))
    const w = await mountPanel()
    expect(w.find('[data-testid="cal-low-sample"]').exists()).toBe(false)
  })

  it('holdout 为空显示「—」；有数据时单独给出样本与命中率', async () => {
    vi.mocked(pipelineApi.getCalibration).mockResolvedValue(
      calibration({ holdout: { sample_size: 0, hit_rate: 0 } }),
    )
    const empty = await mountPanel()
    expect(empty.find('[data-testid="cal-holdout"]').text()).toBe('holdout：—')

    vi.mocked(pipelineApi.getCalibration).mockResolvedValue(calibration())
    const filled = await mountPanel()
    expect(filled.find('[data-testid="cal-holdout"]').text()).toBe('holdout：4 条 · 命中率 50.0%')
  })

  it('holdout 条目单独成列，不与主样本混算命中率', async () => {
    vi.mocked(pipelineApi.getCalibration).mockResolvedValue(
      calibration({
        entries: [
          entry({ proposal_id: 'main:hit', claimed_confidence: 0.8, outcome_hit: true }),
          entry({
            proposal_id: 'hold:miss',
            claimed_confidence: 0.8,
            outcome_hit: false,
            is_holdout: true,
          }),
        ],
      }),
    )
    const w = await mountPanel()
    const rows = w.findAll('[data-testid="cal-bins"] tbody tr')
    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toContain('100.0%')
    expect(rows[1].text()).toContain('（holdout）')
    expect(rows[1].text()).toContain('0.0%')
  })

  it('待回填条目在记录表里显示「待回填」，不显示命中/未命中', async () => {
    vi.mocked(pipelineApi.getCalibration).mockResolvedValue(
      calibration({
        entries: [
          entry({ proposal_id: 'a', outcome_hit: null }),
          entry({ proposal_id: 'b', outcome_hit: false }),
        ],
      }),
    )
    const w = await mountPanel()
    const rows = w.findAll('[data-testid="cal-entries"] tbody tr')
    expect(rows).toHaveLength(2)
    expect(rows[0].find('[data-testid="cal-result-pending"]').text()).toBe('待回填')
    expect(rows[1].text()).toContain('未命中')
  })

  it('空台账显示显式空态，而不是一张 0% 命中率的假表', async () => {
    vi.mocked(pipelineApi.getCalibration).mockResolvedValue(
      calibration({
        sample_size: 0,
        hit_rate: 0,
        claimed_rate: 0,
        calibration_error: 0,
        brier_score: 0,
        pending: 0,
        holdout: { sample_size: 0, hit_rate: 0 },
        entries: [],
      }),
    )
    const w = await mountPanel()
    expect(w.find('[data-testid="cal-empty"]').text()).toContain('还没有采纳记录')
    expect(w.find('[data-testid="cal-entries"]').exists()).toBe(false)
    expect(w.find('[data-testid="cal-no-bins"]').exists()).toBe(true)
    // A-12 断言 2：空样本的四个派生量是「—」，不是后端回包的 0 被渲染成 0%。
    // 样本量本身照实显示 0（它是事实，不是测量）。
    expect(w.find('[data-testid="cal-sample-size"]').text()).toBe('0')
    expect(w.find('[data-testid="cal-hit-rate"]').text()).toBe('—')
    expect(w.find('[data-testid="cal-claimed-rate"]').text()).toBe('—')
    expect(w.find('[data-testid="cal-cal-error"]').text()).toBe('—')
    expect(w.find('[data-testid="cal-brier"]').text()).toBe('—')
  })

  it('只有待回填条目（sample_size=0 但台账非空）时派生量同样是「—」，不画 0%', async () => {
    vi.mocked(pipelineApi.getCalibration).mockResolvedValue(
      calibration({
        sample_size: 0,
        hit_rate: 0,
        claimed_rate: 0,
        calibration_error: 0,
        brier_score: 0,
        pending: 1,
        holdout: { sample_size: 0, hit_rate: 0 },
        entries: [entry({ outcome_hit: null, resolved_at: null })],
      }),
    )
    const w = await mountPanel()
    // 有采纳记录 ⇒ 不是「还没有采纳记录」空态，但也没有可算的命中率
    expect(w.find('[data-testid="cal-empty"]').exists()).toBe(false)
    expect(w.find('[data-testid="cal-hit-rate"]').text()).toBe('—')
    expect(w.find('[data-testid="cal-brier"]').text()).toBe('—')
    expect(w.find('[data-testid="cal-pending"]').text()).toContain('待回填 1 条不计入')
  })

  it('503 时说明校准未接入，不用空表冒充「没有样本」', async () => {
    vi.mocked(pipelineApi.getCalibration).mockRejectedValue(new ApiError(503, 'not ready'))
    const w = await mountPanel()

    expect(w.find('[data-testid="cal-error"]').text()).toContain('503')
    expect(w.find('[data-testid="cal-empty"]').exists()).toBe(false)
  })

  /**
   * 措辞守卫（A-12 断言 5）：校准 ≠ 认证。
   * 直接读源码而不是读渲染文本 —— 徽标/标题以后加进来也照样被拦。
   * 破坏验证：往组件里写一个 `VERIFIED` ⇒ 本用例红。
   */
  it('措辞守卫：面板源码不含 VALIDATED / VERIFIED / 已验证 / 已认证', () => {
    const source = readFileSync(resolve(__dirname, 'CalibrationPanel.vue'), 'utf8')
    for (const word of ['VALIDATED', 'VERIFIED', '已验证', '已认证']) {
      expect(source, `CalibrationPanel.vue 不应出现「${word}」`).not.toContain(word)
    }
  })
})
