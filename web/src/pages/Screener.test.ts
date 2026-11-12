// Screener.vue 的「失败 ≠ 空结果」判据（W7 新发现 1）。
//
// 缺陷形状：`/api/screen` 被限流回 429 或 5xx 时，旧页面 catch 里只弹一条 3 秒后
// 消失的 toast，结果区同时落到 `n-empty description="未找到符合条件的股票"` ——
// **请求没成功被读成「确实没有命中」**。用户看到的是一个结论，而实际上我们连
// 结论都没拿到。
//
// 这里用真组件 + 假后端钉住三条：失败要出现错误态与重试入口、不得出现空结果
// 文案；空数组才是「未找到」；失败后不许留着上一次的表格把旧数据当新结果。

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { NMessageProvider } from 'naive-ui'
import Screener from './Screener.vue'
import * as marketApi from '@/api/market'
import { ApiError } from '@/api/client'

vi.mock('@/api/market', () => ({
  screenStocks: vi.fn(),
}))

function mountPage() {
  const Host = defineComponent({
    render: () => h(NMessageProvider, null, { default: () => h(Screener) }),
  })
  return mount(Host, { attachTo: document.body })
}

async function run(wrapper: ReturnType<typeof mountPage>) {
  const btn = wrapper.findAll('button').find((b) => b.text().includes('开始选股'))
  expect(btn).toBeTruthy()
  await btn!.trigger('click')
  await flushPromises()
}

describe('Screener 失败态与空结果必须分开', () => {
  beforeEach(() => {
    vi.mocked(marketApi.screenStocks).mockReset()
  })

  it('后端 5xx：出现错误态 + 重试，不出现「未找到符合条件的股票」', async () => {
    vi.mocked(marketApi.screenStocks).mockRejectedValue(
      new ApiError(502, '网关服务不可用'),
    )

    const w = mountPage()
    await run(w)

    const errorBox = w.get('[data-testid="screen-error"]')
    expect(errorBox.text()).toContain('选股请求失败')
    expect(errorBox.text()).toContain('网关服务不可用')
    expect(w.get('[data-testid="screen-retry"]').text()).toContain('重试')
    expect(w.text()).not.toContain('未找到符合条件的股票')
    expect(w.find('[data-testid="screen-empty"]').exists()).toBe(false)
    w.unmount()
  })

  it('网络层失败（status 0）：同样走错误态，不冒充空结果', async () => {
    vi.mocked(marketApi.screenStocks).mockRejectedValue(
      new ApiError(0, '网络连接失败'),
    )

    const w = mountPage()
    await run(w)

    expect(w.get('[data-testid="screen-error"]').text()).toContain('网络连接失败')
    expect(w.find('[data-testid="screen-empty"]').exists()).toBe(false)
    w.unmount()
  })

  it('后端 200 但 0 条：这才说「未找到」，且不出现错误态', async () => {
    vi.mocked(marketApi.screenStocks).mockResolvedValue({ count: 0, results: [] })

    const w = mountPage()
    await run(w)

    expect(w.get('[data-testid="screen-empty"]').text()).toContain('未找到符合条件的股票')
    expect(w.find('[data-testid="screen-error"]').exists()).toBe(false)
    w.unmount()
  })

  it('成功后有结果再失败：旧表格必须清掉，不能把上一次的行当这次的结果', async () => {
    vi.mocked(marketApi.screenStocks).mockResolvedValueOnce({
      count: 1,
      results: [
        {
          ts_code: '000001.SZ', pe: 8, pb: 1, ps: 2, roe: 12, roa: 6,
          debt_to_equity: 1, gross_margin: 30, net_margin: 15, market_cap: 2000,
        },
      ],
    })
    const w = mountPage()
    await run(w)
    expect(w.text()).toContain('找到 1 只股票')

    vi.mocked(marketApi.screenStocks).mockRejectedValueOnce(new ApiError(429, '请求过于频繁，请稍后再试'))
    await run(w)

    expect(w.text()).not.toContain('000001.SZ')
    expect(w.text()).not.toContain('找到 1 只股票')
    expect(w.get('[data-testid="screen-error"]').text()).toContain('过于频繁')
    w.unmount()
  })

  it('重试按钮会用同一套条件重新发请求，成功后错误态消失', async () => {
    vi.mocked(marketApi.screenStocks).mockRejectedValueOnce(new ApiError(502, '网关服务不可用'))
    const w = mountPage()
    await run(w)
    expect(w.find('[data-testid="screen-error"]').exists()).toBe(true)

    vi.mocked(marketApi.screenStocks).mockResolvedValueOnce({ count: 0, results: [] })
    await w.get('[data-testid="screen-retry"]').trigger('click')
    await flushPromises()

    expect(w.find('[data-testid="screen-error"]').exists()).toBe(false)
    expect(w.get('[data-testid="screen-empty"]').text()).toContain('未找到符合条件的股票')
    w.unmount()
  })
})
