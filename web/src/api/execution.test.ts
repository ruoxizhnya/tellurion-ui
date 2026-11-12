import { describe, expect, it, vi, beforeEach } from 'vitest'
import api from './client'
import {
  cancelOrder,
  createOrder,
  getAccount,
  getOrder,
  getPositions,
  listOrders,
} from './execution'

vi.mock('./client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), del: vi.fn() },
}))

/** A-09：执行域 6 条读/写面逐条钉住路径与方法（openapi:2020-2158）。 */
describe('execution api', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.post).mockReset()
  })

  it('listOrders → GET /api/execution/orders', async () => {
    vi.mocked(api.get).mockResolvedValue({ orders: [], count: 0 })
    await listOrders()
    expect(api.get).toHaveBeenCalledWith('/api/execution/orders')
  })

  it('getOrder → GET /api/execution/orders/{id}', async () => {
    vi.mocked(api.get).mockResolvedValue({})
    await getOrder('ord 1')
    expect(api.get).toHaveBeenCalledWith('/api/execution/orders/ord%201')
  })

  it('createOrder → POST /api/execution/orders 原样透传请求体', async () => {
    vi.mocked(api.post).mockResolvedValue({})
    const req = { symbol: '600000.SH', side: 'long' as const, quantity: 100 }
    await createOrder(req)
    expect(api.post).toHaveBeenCalledWith('/api/execution/orders', req)
  })

  it('cancelOrder → POST /api/execution/orders/{id}/cancel', async () => {
    vi.mocked(api.post).mockResolvedValue({ order_id: 'o1', status: 'cancelled' })
    await cancelOrder('o1')
    expect(api.post).toHaveBeenCalledWith('/api/execution/orders/o1/cancel')
  })

  it('getPositions → GET /api/execution/positions', async () => {
    vi.mocked(api.get).mockResolvedValue({ positions: [], count: 0 })
    await getPositions()
    expect(api.get).toHaveBeenCalledWith('/api/execution/positions')
  })

  it('getAccount → GET /api/execution/account', async () => {
    vi.mocked(api.get).mockResolvedValue({})
    await getAccount()
    expect(api.get).toHaveBeenCalledWith('/api/execution/account')
  })
})
