// compliance.test.ts — A-10 / F17：合规 9 条端点的封装必须逐条对齐
// `cmd/analysis/handlers_compliance.go:94-109` 的真实路由。
//
// 这些用例只钉「路径 + 方法 + 请求体透传」，不重复后端规则逻辑：
// 阈值与判定在 core，前端只负责把用户的输入原样送到对应端点。

import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './client'
import {
  checkDivestment,
  checkSuitability,
  generateDailyReport,
  getBoards,
  getDivestmentHolderTypes,
  getDivestmentMethods,
  getDivestmentRules,
  getRequirements,
  runAbnormalDetection,
} from './compliance'

vi.mock('./client', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('合规读面（5 条 GET）', () => {
  it('GET /api/compliance/requirements', async () => {
    vi.mocked(api.get).mockResolvedValue({ requirements: [], generated_at: '' })
    await getRequirements()
    expect(api.get).toHaveBeenCalledWith('/api/compliance/requirements')
  })

  it('GET /api/compliance/boards', async () => {
    vi.mocked(api.get).mockResolvedValue({ boards: [], count: 0 })
    await getBoards()
    expect(api.get).toHaveBeenCalledWith('/api/compliance/boards')
  })

  it('GET /api/compliance/divestment/holder-types', async () => {
    vi.mocked(api.get).mockResolvedValue({ holder_types: [], count: 0 })
    await getDivestmentHolderTypes()
    expect(api.get).toHaveBeenCalledWith('/api/compliance/divestment/holder-types')
  })

  it('GET /api/compliance/divestment/methods', async () => {
    vi.mocked(api.get).mockResolvedValue({ methods: [], count: 0 })
    await getDivestmentMethods()
    expect(api.get).toHaveBeenCalledWith('/api/compliance/divestment/methods')
  })

  it('GET /api/compliance/divestment/rules', async () => {
    vi.mocked(api.get).mockResolvedValue({ rules: {}, generated_at: '' })
    await getDivestmentRules()
    expect(api.get).toHaveBeenCalledWith('/api/compliance/divestment/rules')
  })
})

describe('合规写面（5 条 POST）', () => {
  it('POST /api/compliance/check 透传 symbol', async () => {
    vi.mocked(api.post).mockResolvedValue({ allowed: true })
    await checkSuitability({ symbol: '300750' })
    expect(api.post).toHaveBeenCalledWith('/api/compliance/check', { symbol: '300750' })
  })

  it('POST /api/compliance/abnormal/run 透传账户与滑窗流水', async () => {
    vi.mocked(api.post).mockResolvedValue({ alerts: [], count: 0, run_at: '' })
    const req = { account_id: 'paper-001', orders: [], trades: [] }
    await runAbnormalDetection(req)
    expect(api.post).toHaveBeenCalledWith('/api/compliance/abnormal/run', req)
  })

  it('POST /api/compliance/report/daily 透传交易日与成交', async () => {
    vi.mocked(api.post).mockResolvedValue({ path: '', report: {} })
    const req = { trading_date: '2026-11-12', trades: [] }
    await generateDailyReport(req)
    expect(api.post).toHaveBeenCalledWith('/api/compliance/report/daily', req)
  })

  it('POST /api/compliance/divestment/check 透传 profile/plan/recent', async () => {
    vi.mocked(api.post).mockResolvedValue({ allowed: false })
    const req = {
      profile: {
        user_id: 'h1',
        symbol: '600000',
        holder_type: 'controlling' as const,
        holdings_pct: 30,
        holdings_share: 1_000_000,
        acquired_at: '2023-01-03T09:30:00Z',
      },
      plan: {
        symbol: '600000',
        quantity: 10_000,
        method: 'auction' as const,
        at: '2026-11-12T09:30:00Z',
      },
    }
    await checkDivestment(req)
    expect(api.post).toHaveBeenCalledWith('/api/compliance/divestment/check', req)
  })
})
