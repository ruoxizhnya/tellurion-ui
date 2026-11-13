import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import MorningBriefing from './MorningBriefing.vue'
import * as reviewApi from '@/api/review'
import * as pipelineApi from '@/api/pipeline'
import * as exploreApi from '@/api/explore'
import type { AttemptView, ExploreStatus, Verdict } from '@/api/explore'
import type { ReviewPending } from '@/api/review'
import type { Calibration } from '@/api/pipeline'

vi.mock('@/api/review', () => ({ getReviewPending: vi.fn() }))
vi.mock('@/api/pipeline', () => ({ getCalibration: vi.fn() }))

// 只换网络函数，保留 assessedProbability / weakestDimension 等纯口径 —— 简报必须与
// 审阅台读同一份算法，mock 掉它们等于测了一份不存在的实现。
vi.mock('@/api/explore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/explore')>()
  return { ...actual, getExploreStatus: vi.fn() }
})

function verdict(p: Partial<Verdict> = {}): Verdict {
  return {
    dimensions: {
      statistical: 0.8,
      economic: 0.7,
      robustness: 0.6,
      bias: 0.5,
      redundancy: 0.9,
      causal: 0.4,
    },
    unassessed: [],
    probability: 0.4,
    weakest: 'causal',
    geometric_mean: 0.63,
    blocking: 0,
    challenges: [],
    causal: null,
    ...p,
  }
}

function attempt(overrides: Partial<AttemptView> = {}): AttemptView {
  return {
    seq: 1,
    hypothesis: '动量因子在光模块上更稳',
    params: { lookback: 20 },
    experiment_id: 11,
    sharpe: 1.0,
    ok: true,
    verdict: verdict(),
    ...overrides,
  }
}

function pending(overrides: Partial<ReviewPending> = {}): ReviewPending {
  return {
    pending: 5,
    as_of: '2026-11-13T08:00:00Z',
    sources: [{ name: 'ai_explore', status: 'available', pending: 5 }],
    ...overrides,
  }
}

function calibration(overrides: Partial<Calibration> = {}): Calibration {
  return {
    sample_size: 42,
    hit_rate: 0.61,
    claimed_rate: 0.7,
    calibration_error: 0.083,
    brier_score: 0.21,
    pending: 1,
    holdout: { sample_size: 8, hit_rate: 0.5 },
    entries: [],
    ...overrides,
  }
}

function exploreStatus(attempts: AttemptView[], overrides: Partial<ExploreStatus> = {}): ExploreStatus {
  return { run_id: 'run-1', running: false, attempts, ...overrides }
}

async function mountBriefing() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/review', component: { template: '<div />' } },
    ],
  })
  await router.push('/')
  await router.isReady()
  const w = mount(MorningBriefing, { global: { plugins: [router] } })
  await flushPromises()
  return w
}

function candidateOrder(w: Awaited<ReturnType<typeof mountBriefing>>): string[] {
  return w.findAll('.recent-item').map((el) => el.attributes('data-testid') ?? '')
}

describe('A-15 晨间简报', () => {
  beforeEach(() => {
    vi.mocked(reviewApi.getReviewPending).mockReset()
    vi.mocked(pipelineApi.getCalibration).mockReset()
    vi.mocked(exploreApi.getExploreStatus).mockReset()
    vi.mocked(reviewApi.getReviewPending).mockResolvedValue(pending())
    vi.mocked(pipelineApi.getCalibration).mockResolvedValue(calibration())
    vi.mocked(exploreApi.getExploreStatus).mockResolvedValue(exploreStatus([]))
    localStorage.clear()
  })

  it('首屏四块齐备：待审阅 / 校准误差 / 失败警示 / 最近候选', async () => {
    localStorage.setItem('ql.lastRunId', 'run-1')
    const w = await mountBriefing()

    expect(w.find('[data-testid="brief-pending"]').exists()).toBe(true)
    expect(w.find('[data-testid="brief-calibration"]').exists()).toBe(true)
    expect(w.find('[data-testid="brief-failure"]').exists()).toBe(true)
    expect(w.find('[data-testid="brief-recent"]').exists()).toBe(true)
    expect(w.find('[data-testid="brief-pending-value"]').text()).toBe('5')
  })

  it('待审阅三态：数字照抄；null + 不可用源写「—」与源名；无配置源写「—」', async () => {
    let w = await mountBriefing()
    expect(w.find('[data-testid="brief-pending-value"]').text()).toBe('5')

    vi.mocked(reviewApi.getReviewPending).mockResolvedValue(
      pending({
        pending: null,
        sources: [
          { name: 'ai_explore', status: 'available', pending: 2 },
          { name: 'adoption', status: 'unavailable', pending: null, error: 'timeout' },
        ],
      }),
    )
    w = await mountBriefing()
    expect(w.find('[data-testid="brief-pending-value"]').text()).toBe('—')
    const note = w.find('[data-testid="brief-pending-note"]').text()
    expect(note).toContain('adoption')
    expect(note).toContain('不做部分求和')
    expect(w.text()).not.toMatch(/待审阅\s*0/)

    vi.mocked(reviewApi.getReviewPending).mockResolvedValue(pending({ pending: null, sources: [] }))
    w = await mountBriefing()
    expect(w.find('[data-testid="brief-pending-value"]').text()).toBe('—')
    expect(w.find('[data-testid="brief-pending-note"]').text()).toContain('无配置源')
  })

  it('待审阅读面失败 → 「—」+ 读面未接通，不画 0', async () => {
    vi.mocked(reviewApi.getReviewPending).mockRejectedValue(new Error('503'))
    const w = await mountBriefing()

    expect(w.find('[data-testid="brief-pending-value"]').text()).toBe('—')
    expect(w.find('[data-testid="brief-pending-note"]').text()).toContain('读面未接通')
  })

  it('校准一行只读 calibration_error + sample_size：n<30 标样本不足，失败写读面未接通', async () => {
    vi.mocked(pipelineApi.getCalibration).mockResolvedValue(calibration({ sample_size: 12 }))
    let w = await mountBriefing()
    expect(w.find('[data-testid="brief-calibration-value"]').text()).toBe('8.3 个百分点')
    expect(w.find('[data-testid="brief-calibration-note"]').text()).toContain('样本不足')
    expect(w.find('[data-testid="brief-calibration-note"]').text()).toContain('n=12')

    vi.mocked(pipelineApi.getCalibration).mockResolvedValue(calibration())
    w = await mountBriefing()
    expect(w.find('[data-testid="brief-calibration-note"]').text()).toBe('n=42')

    vi.mocked(pipelineApi.getCalibration).mockRejectedValue(new Error('503'))
    w = await mountBriefing()
    expect(w.find('[data-testid="brief-calibration-value"]').text()).toBe('—')
    expect(w.find('[data-testid="brief-calibration-note"]').text()).toContain('读面未接通')
  })

  it('空台账（sample_size=0 但后端回 0）不画「0.0 个百分点」，写「—」并标样本不足', async () => {
    vi.mocked(pipelineApi.getCalibration).mockResolvedValue(
      calibration({
        sample_size: 0,
        hit_rate: 0,
        claimed_rate: 0,
        calibration_error: 0,
        brier_score: 0,
        pending: 0,
        holdout: { sample_size: 0, hit_rate: 0 },
      }),
    )
    const w = await mountBriefing()
    expect(w.find('[data-testid="brief-calibration-value"]').text()).toBe('—')
    expect(w.find('[data-testid="brief-calibration-note"]').text()).toContain('n=0')
    expect(w.find('[data-testid="brief-calibration-note"]').text()).toContain('样本不足')
  })

  it('最近候选复用 rankAttempts 排序：低 Sharpe 的宽平台排在高 Sharpe 孤峰之前', async () => {
    localStorage.setItem('ql.lastRunId', 'run-1')
    // seq1/4/5 三个近距离 Sharpe（同属一块平台，分数 3×0.4 = 1.2）；
    // seq2 是 Sharpe 3.0 的孤峰（平台 1×1.0 = 1.0）⇒ 必须排在后面。
    vi.mocked(exploreApi.getExploreStatus).mockResolvedValue(
      exploreStatus([
        attempt({ seq: 1, sharpe: 1.0 }),
        attempt({ seq: 2, sharpe: 3.0, verdict: verdict({ dimensions: { statistical: 1, economic: 1, robustness: 1, bias: 1, redundancy: 1, causal: 1 }, probability: 1 }) }),
        attempt({ seq: 4, sharpe: 1.05 }),
        attempt({ seq: 5, sharpe: 0.96 }),
      ]),
    )
    const w = await mountBriefing()

    // 同分时按 Sharpe 降序，再按 seq：1.05 / 1.00 / 0.96
    expect(candidateOrder(w)).toEqual(['brief-candidate-4', 'brief-candidate-1', 'brief-candidate-5'])
    expect(candidateOrder(w)).not.toContain('brief-candidate-2')
  })

  it('失败尝试只给失败原因：不画微条、不写 P 0', async () => {
    localStorage.setItem('ql.lastRunId', 'run-1')
    vi.mocked(exploreApi.getExploreStatus).mockResolvedValue(
      exploreStatus([
        attempt({ seq: 1, sharpe: 1.0 }),
        attempt({ seq: 2, sharpe: 2.0, verdict: verdict({ dimensions: { statistical: 1, economic: 1, robustness: 1, bias: 1, redundancy: 1, causal: 1 }, probability: 1 }) }),
        attempt({ seq: 3, sharpe: 0, ok: false, verdict: null, error: '数据缺口：交易日不足' }),
      ]),
    )
    const w = await mountBriefing()

    expect(candidateOrder(w)).toEqual(['brief-candidate-2', 'brief-candidate-1', 'brief-candidate-3'])
    const failed = w.find('[data-testid="brief-candidate-3"]')
    expect(failed.find('[data-testid="brief-candidate-error-3"]').text()).toContain('数据缺口')
    expect(failed.find('[data-testid="verdict-bars"]').exists()).toBe(false)
    expect(failed.text()).not.toContain('P 0')
  })

  it('深链：候选去审阅带 run，校准行跳校准 tab', async () => {
    localStorage.setItem('ql.lastRunId', 'run-1')
    vi.mocked(exploreApi.getExploreStatus).mockResolvedValue(exploreStatus([attempt({ seq: 1 })]))
    const w = await mountBriefing()

    expect(w.find('[data-testid="brief-open-1"]').attributes('href')).toBe('/review?run=run-1')
    expect(w.find('[data-testid="brief-calibration"]').find('a').attributes('href')).toBe(
      '/review?tab=calibration',
    )
  })

  it('不退化：VerdictBars 直接复用 A-14 组件，不在简报里再造微条', async () => {
    const src = readFileSync(resolve(__dirname, 'MorningBriefing.vue'), 'utf8')
    expect(src).toContain("from '@/components/review/VerdictBars.vue'")
    expect(src).not.toContain('bar-row')
  })

  it('没有最近 run 时给显式空态，不伪造候选', async () => {
    const w = await mountBriefing()

    expect(w.find('[data-testid="brief-recent-empty"]').text()).toContain('还没有探索记录')
    expect(candidateOrder(w)).toEqual([])
    expect(w.find('[data-testid="brief-failure-value"]').text()).toBe('—')
  })
})
