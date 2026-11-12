import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { NMessageProvider } from 'naive-ui'
import PaperTrading from './PaperTrading.vue'
import * as execApi from '@/api/execution'
import { ApiError } from '@/api/client'

vi.mock('@/api/execution', () => ({
  listOrders: vi.fn(),
  getPositions: vi.fn(),
  getAccount: vi.fn(),
  getOrder: vi.fn(),
  createOrder: vi.fn(),
  cancelOrder: vi.fn(),
  emergencyFlatten: vi.fn(),
}))

function mountPage() {
  const Host = defineComponent({
    render: () => h(NMessageProvider, null, { default: () => h(PaperTrading) }),
  })
  return mount(Host, { attachTo: document.body })
}

const order = {
  order_id: 'o-1',
  symbol: '600000.SH',
  status: 'filled',
  filled_qty: 100,
  avg_price: 10.5,
  commission: 5,
  timestamp: '2026-11-12T09:30:00Z',
}

const position = {
  symbol: '600000.SH',
  quantity: 100,
  avg_cost: 10,
  current_price: 10.5,
  market_value: 1050,
  unrealized_pnl: 50,
  realized_pnl: 0,
  weight: 0.5,
  entry_date: '2026-11-10T09:30:00Z',
  buy_date: '2026-11-10T09:30:00Z',
  quantity_today: 0,
  quantity_yesterday: 100,
}

function okAll() {
  vi.mocked(execApi.listOrders).mockResolvedValue({ orders: [order], count: 1 })
  vi.mocked(execApi.getPositions).mockResolvedValue({ positions: [position], count: 1 })
  vi.mocked(execApi.getAccount).mockResolvedValue({ cash: 125000.5, total_value: 200000 })
}

describe('A-09 纸交易观测台', () => {
  beforeEach(() => {
    vi.mocked(execApi.listOrders).mockReset()
    vi.mocked(execApi.getPositions).mockReset()
    vi.mocked(execApi.getAccount).mockReset()
  })

  it('四块齐备，订单/持仓/账户渲染后端返回值，并明确标注 Mock', async () => {
    okAll()
    const w = mountPage()
    await flushPromises()

    expect(w.find('[data-testid="paper-orders"]').exists()).toBe(true)
    expect(w.find('[data-testid="paper-positions"]').exists()).toBe(true)
    expect(w.find('[data-testid="paper-account"]').exists()).toBe(true)
    expect(w.find('[data-testid="paper-signals"]').exists()).toBe(true)

    expect(w.find('[data-testid="paper-badge"]').text()).toContain('Mock')
    expect(w.text()).toContain('600000.SH')
    // 账户按后端原值渲染（不按 schema 猜字段、也不重排格式）
    expect(w.text()).toContain('125000.5')
  })

  it('信号流必须是 disabled（core 只有写门、没有读面）', async () => {
    okAll()
    const w = mountPage()
    await flushPromises()

    const dep = w.find('[data-testid="signals-dependency"]').text()
    expect(dep).toContain('POST /api/signals')
    expect(dep).toContain('没有读面')

    expect(w.find('[data-testid="signals-disabled-subscribe"]').attributes('disabled')).toBeDefined()
    expect(
      w.find('[data-testid="signals-disabled-input"]').find('input').attributes('disabled'),
    ).toBeDefined()
  })

  it('单个读面失败：错误态出现，且**不**把成功的持仓清空', async () => {
    vi.mocked(execApi.listOrders).mockRejectedValue(new ApiError(403, '角色不足'))
    vi.mocked(execApi.getPositions).mockResolvedValue({ positions: [position], count: 1 })
    vi.mocked(execApi.getAccount).mockResolvedValue({ cash: 1 })

    const w = mountPage()
    await flushPromises()

    expect(w.find('[data-testid="paper-error"]').text()).toContain('订单')
    expect(w.find('[data-testid="paper-error"]').text()).toContain('角色不足')
    // 持仓仍在，不因为订单失败就一起画空
    expect(w.find('[data-testid="paper-positions"]').text()).toContain('600000.SH')
  })

  it('F16 文案纪律：页面不出现任何暗示真实交易通道的词', async () => {
    okAll()
    const w = mountPage()
    await flushPromises()

    expect(w.text()).not.toMatch(/实盘|FIX|Colocation|DMA|TWAP|VWAP|亚毫秒|100 FPS/)
    // 不写死后端不存在的机构布景字段
    expect(w.text()).not.toContain('保证金占用率')
  })
})
