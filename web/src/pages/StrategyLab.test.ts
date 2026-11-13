// 「新建策略」入口的回归保护。
//
// 缺陷形状（2026-11-13 主任实测）：按钮 @click 只把 showCreateModal 置 true，
// 而模板里没有任何弹窗消费这个状态 —— 点击既不报错，也不产生任何可见反应，
// 控制台也干净，所以「点了没反应」很难被归因。
//
// B-04 三页合一后，新建只发生在同一个 hub 的「编辑器」tab（那里才有策略名称、
// 因子权重与真实的 POST /api/strategies），因此入口的正确行为是切过去。
// 这里钉住这个**可观察结果**，避免以后再退化成空操作。

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { NDialogProvider, NMessageProvider } from 'naive-ui'
import StrategyLab from './StrategyLab.vue'
import * as strategyApi from '@/api/strategy'

vi.mock('@/api/strategy', () => ({ getStrategies: vi.fn() }))

async function mountLab(
  initial = '/strategy-lab',
): Promise<{ wrapper: ReturnType<typeof mount>; router: Router }> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/strategy-lab', component: { template: '<div />' } }],
  })
  await router.push(initial)
  await router.isReady()

  const Host = defineComponent({
    render: () =>
      h(NDialogProvider, null, {
        default: () => h(NMessageProvider, null, { default: () => h(StrategyLab) }),
      }),
  })
  const wrapper = mount(Host, {
    global: { plugins: [router], stubs: { teleport: true } },
  })
  await flushPromises()
  return { wrapper, router }
}

describe('策略库「新建策略」入口', () => {
  beforeEach(() => {
    vi.mocked(strategyApi.getStrategies).mockReset()
    vi.mocked(strategyApi.getStrategies).mockResolvedValue({ strategies: [] })
  })

  it('点击后落到编辑器 tab（URL 带 tab=builder），不是点了没反应', async () => {
    const { wrapper, router } = await mountLab()
    await wrapper.get('[data-testid="strategy-create"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/strategy-lab?tab=builder')
    wrapper.unmount()
  })

  it('不论当前 query 是什么，点击目标都确定是编辑器 tab', async () => {
    // 入口本身在策略库页；这条防的是「只把已有 query 原样带着走」这类半修。
    const { wrapper, router } = await mountLab('/strategy-lab?tab=copilot')
    await wrapper.get('[data-testid="strategy-create"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/strategy-lab?tab=builder')
    wrapper.unmount()
  })
})
