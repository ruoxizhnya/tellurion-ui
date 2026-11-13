import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { NMessageProvider } from 'naive-ui'
import ReviewDesk from './ReviewDesk.vue'
import * as exploreApi from '@/api/explore'
import * as pipelineApi from '@/api/pipeline'
import { ApiError } from '@/api/client'
import type { AttemptView, Verdict } from '@/api/explore'

vi.mock('@/api/explore', async () => {
  // 只 mock 网络函数，保留 assessedProbability / dimensionLabel 等纯函数
  const actual = await vi.importActual<typeof import('@/api/explore')>('@/api/explore')
  return { ...actual, getExploreStatus: vi.fn() }
})

vi.mock('@/api/pipeline', () => ({ recordAdoption: vi.fn(), getCalibration: vi.fn() }))

function verdict(causalProbability: number, statistical = 0.8, economic = 0.6): Verdict {
  return {
    dimensions: { statistical, economic },
    probability: Math.min(statistical, economic),
    geometric_mean: 0.7,
    blocking: 0,
    challenges: [],
    causal: { mechanism: 'm', testable: 2, passed: 2, failed: 0, probability: causalProbability },
  }
}

function attempt(seq: number, sharpe: number, over: Partial<AttemptView> = {}): AttemptView {
  return {
    seq,
    hypothesis: `h${seq}`,
    params: { lookback: 20 },
    experiment_id: 100 + seq,
    sharpe,
    ok: true,
    verdict: null,
    ...over,
  }
}

// 反例数据：seq1 是 Sharpe 2.0 的孤峰，seq2..4 是 1.5 附近的平台（因果强度递减）。
const ATTEMPTS = [
  attempt(1, 2.0),
  attempt(2, 1.5, { verdict: verdict(0.9) }),
  attempt(3, 1.52, { verdict: verdict(0.5) }),
  attempt(4, 1.48, { verdict: verdict(0.4) }),
]

async function mountDesk(initial = '/review'): Promise<{ wrapper: ReturnType<typeof mount>; router: Router }> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/review', component: { template: '<div />' } }],
  })
  await router.push(initial)
  await router.isReady()

  const Host = defineComponent({
    render: () => h(NMessageProvider, null, { default: () => h(ReviewDesk) }),
  })
  const wrapper = mount(Host, {
    global: { plugins: [router], stubs: { teleport: true } },
  }).findComponent(ReviewDesk)
  await flushPromises()
  return { wrapper, router }
}

describe('B-02 审阅台', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('ql.lastRunId', 'run-9')
    vi.mocked(exploreApi.getExploreStatus).mockReset()
    vi.mocked(pipelineApi.recordAdoption).mockReset()
    vi.mocked(pipelineApi.getCalibration).mockReset()
    vi.mocked(pipelineApi.getCalibration).mockResolvedValue({
      sample_size: 0,
      hit_rate: 0,
      claimed_rate: 0,
      calibration_error: 0,
      brier_score: 0,
      pending: 0,
      holdout: { sample_size: 0, hit_rate: 0 },
      entries: [],
    })
    vi.mocked(exploreApi.getExploreStatus).mockResolvedValue({
      run_id: 'run-9',
      running: true,
      attempts: ATTEMPTS,
      best_seq: 2,
    })
  })

  it('按平台面积 × 因果强度排序：孤峰不排第一，且显式标注「近似」', async () => {
    const { wrapper: w } = await mountDesk()

    const order = w.findAll('[data-testid^="ranked-item-"]').map((n) => n.attributes('data-testid'))
    expect(order[0]).toBe('ranked-item-2')
    expect(order).toContain('ranked-item-1')
    expect(w.find('[data-testid="approx-banner"]').text()).toContain('近似')
  })

  it('采纳理由为空时不可提交（F7：理由与概率快照缺一不可）', async () => {
    const { wrapper: w } = await mountDesk()

    await w.find('[data-testid="adopt-button-2"]').trigger('click')
    expect(w.find('[data-testid="adopt-prob"]').text()).toBe('0.600')
    expect(w.find('[data-testid="adopt-submit"]').attributes('disabled')).toBeDefined()

    await w.find('[data-testid="adopt-reason"] textarea').setValue('平台宽、因果链完整')
    expect(w.find('[data-testid="adopt-submit"]').attributes('disabled')).toBeUndefined()
  })

  it('提交时带概率快照与结果坐标（台账可回溯「当时声称多少把握」）', async () => {
    vi.mocked(pipelineApi.recordAdoption).mockResolvedValue({
      id: 1,
      proposal_id: 'run-9:2',
      actor: 'local',
      adopted: true,
      claimed_confidence: 0.6,
      outcome_hit: null,
    })
    const { wrapper: w } = await mountDesk()

    await w.find('[data-testid="adopt-button-2"]').trigger('click')
    await w.find('[data-testid="adopt-reason"] textarea').setValue('平台宽、因果链完整')
    await w.find('[data-testid="adopt-submit"]').trigger('click')
    await flushPromises()

    expect(pipelineApi.recordAdoption).toHaveBeenCalledWith({
      proposal_id: 'run-9:2',
      actor: 'local',
      intervention: '平台宽、因果链完整',
      adopted: true,
      claimed_confidence: 0.6,
      result_ref: 'exp:102',
    })
  })

  it('重复裁决 409 不让用户以为写成功了', async () => {
    vi.mocked(pipelineApi.recordAdoption).mockRejectedValue(new ApiError(409, 'duplicate'))
    const { wrapper: w } = await mountDesk()

    await w.find('[data-testid="adopt-button-2"]').trigger('click')
    await w.find('[data-testid="adopt-reason"] textarea').setValue('再写一次')
    await w.find('[data-testid="adopt-submit"]').trigger('click')
    await flushPromises()

    expect(w.find('[data-testid="adopt-error"]').text()).toContain('409')
  })

  it('加载失败显示错误，不渲染候选（不拿空白冒充"没有候选"）', async () => {
    vi.mocked(exploreApi.getExploreStatus).mockRejectedValue(new ApiError(404, 'run not found'))
    const { wrapper: w } = await mountDesk()

    expect(w.find('[data-testid="review-error"]').text()).toContain('run not found')
    expect(w.find('[data-testid="ranked-list"]').exists()).toBe(false)
  })

  it('A-12：?tab=calibration 深链直达校准驾驶舱，且不新增路由', async () => {
    const { wrapper: w, router } = await mountDesk('/review?tab=calibration')

    expect(router.currentRoute.value.path).toBe('/review')
    expect(w.find('[data-testid="calibration-panel"]').exists()).toBe(true)
    // 候选排序面板懒渲染，不该在同屏堆出来
    expect(w.find('[data-testid="ranked-list"]').exists()).toBe(false)
  })

  it('A-12：点「校准」tab 把状态写进 query，可被复制分享', async () => {
    const { wrapper: w, router } = await mountDesk()

    const tab = w.findAll('.n-tabs-tab').find((node) => node.text().includes('校准'))
    expect(tab).toBeTruthy()
    await tab!.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query.tab).toBe('calibration')
    expect(w.find('[data-testid="calibration-panel"]').exists()).toBe(true)
  })
})
