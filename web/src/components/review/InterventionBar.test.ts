import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { NMessageProvider } from 'naive-ui'
import InterventionBar from './InterventionBar.vue'
import * as exploreApi from '@/api/explore'
import { ApiError } from '@/api/client'

vi.mock('@/api/explore', () => ({
  steerRun: vi.fn(),
  askAttempt: vi.fn(),
  markAttempt: vi.fn(),
}))

interface BarProps {
  /** 组件 prop 是 runId（kebab 传参 `:run-id` 会被 camelize 成 runId） */
  runId: string
  seq: number | null
  running?: boolean
  reason?: string
}

function mountBar(props: BarProps) {
  const Host = defineComponent({
    render: () => h(NMessageProvider, null, { default: () => h(InterventionBar, props) }),
  })
  const wrapper = mount(Host, { global: { stubs: { teleport: true } } })
  return wrapper.findComponent(InterventionBar)
}

/** 三个动作键的 testid；两态必须同一套 DOM，只改 disabled。 */
const ACTION_IDS = ['intervene-direction', 'intervene-followup', 'intervene-mark']

describe('B-06 人的三只手', () => {
  beforeEach(() => {
    vi.mocked(exploreApi.steerRun).mockReset()
    vi.mocked(exploreApi.askAttempt).mockReset()
    vi.mocked(exploreApi.markAttempt).mockReset()
  })

  it('可用/不可用两态下 DOM 结构完全一致，只有 disabled 位不同', async () => {
    const enabled = mountBar({ runId: 'run-1', seq: 2, running: true })
    const disabled = mountBar({ runId: 'run-1', seq: 2, running: false })
    await flushPromises()

    const shape = (w: typeof enabled) =>
      w
        .findAll('[data-testid]')
        .map((n) => `${n.attributes('data-testid')}:${n.element.tagName}`)
    expect(shape(disabled)).toEqual(shape(enabled))

    for (const id of ACTION_IDS) {
      expect(enabled.find(`[data-testid="${id}"]`).attributes('disabled'), `${id} 应可用`).toBeUndefined()
      expect(disabled.find(`[data-testid="${id}"]`).attributes('disabled'), `${id} 应禁用`).toBeDefined()
    }
  })

  it('没有 runId / seq 时三键禁用（不是隐藏）', async () => {
    const w = mountBar({ runId: '', seq: null, running: true })
    await flushPromises()
    for (const id of ACTION_IDS) {
      expect(w.find(`[data-testid="${id}"]`).attributes('disabled')).toBeDefined()
    }
  })

  it('指方向提交带 attempt_seq，并 emit changed', async () => {
    vi.mocked(exploreApi.steerRun).mockResolvedValue({
      run_id: 'run-1',
      accepted: true,
      count: 1,
      directions: [{ text: '把回看窗口限制在 20–60 日', attempt_seq: 2, at: '2026-11-12T00:00:00Z' }],
      applied_to: 'next_attempt',
    })
    const w = mountBar({ runId: 'run-1', seq: 2, running: true })

    await w.find('[data-testid="intervene-direction"]').trigger('click')
    await flushPromises()
    await w.find('[data-testid="intervene-input"] textarea').setValue('把回看窗口限制在 20–60 日')
    await w.find('[data-testid="intervene-submit"]').trigger('click')
    await flushPromises()

    expect(exploreApi.steerRun).toHaveBeenCalledWith('run-1', {
      direction: '把回看窗口限制在 20–60 日',
      attempt_seq: 2,
    })
    expect(w.emitted('changed')).toHaveLength(1)
  })

  it('run 已结束时把 409 说清楚（方向没有下一次尝试可作用）', async () => {
    vi.mocked(exploreApi.steerRun).mockRejectedValue(new ApiError(409, 'run finished'))
    const w = mountBar({ runId: 'run-1', seq: 2, running: true })

    await w.find('[data-testid="intervene-direction"]').trigger('click')
    await flushPromises()
    await w.find('[data-testid="intervene-input"] textarea').setValue('换个方向')
    await w.find('[data-testid="intervene-submit"]').trigger('click')
    await flushPromises()

    expect(w.find('[data-testid="intervene-error"]').text()).toContain('运行已结束（409）')
  })

  it('追问只回该次尝试自身的证据', async () => {
    vi.mocked(exploreApi.askAttempt).mockResolvedValue({
      run_id: 'run-1',
      seq: 2,
      question: '为什么被判过拟合？',
      answer: '因为样本内 Sharpe 远高于样本外。',
      source: 'evidence',
      evidence: {},
    })
    const w = mountBar({ runId: 'run-1', seq: 2, running: true })

    await w.find('[data-testid="intervene-followup"]').trigger('click')
    await flushPromises()
    await w.find('[data-testid="intervene-input"] input').setValue('为什么被判过拟合？')
    await w.find('[data-testid="intervene-submit"]').trigger('click')
    await flushPromises()

    expect(exploreApi.askAttempt).toHaveBeenCalledWith('run-1', 2, '为什么被判过拟合？')
    expect(w.find('[data-testid="intervene-answer"]').text()).toContain('样本内 Sharpe 远高于样本外')
  })

  it('标记默认为 derive，并 emit changed', async () => {
    vi.mocked(exploreApi.markAttempt).mockResolvedValue({
      id: 1,
      run_id: 'run-1',
      attempt_seq: 2,
      kind: 'derive',
      note: '',
      actor: '',
      experiment_id: 2,
      created_at: '2026-11-12T00:00:00Z',
    })
    const w = mountBar({ runId: 'run-1', seq: 2, running: true })

    await w.find('[data-testid="intervene-mark"]').trigger('click')
    await flushPromises()
    await w.find('[data-testid="intervene-submit"]').trigger('click')
    await flushPromises()

    expect(exploreApi.markAttempt).toHaveBeenCalledWith('run-1', 2, { kind: 'derive', note: undefined })
    expect(w.emitted('changed')).toHaveLength(1)
  })
})
