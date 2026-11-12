// walkforward.test.ts — A-10：walk-forward + batch 共 4 条端点。
// 台账原写 5 条；两个 walkforward 读端点已随 SVC-CORE-RUN-RETIRE 退役
// （handlers_walkforward.go:15-18），这里按实测钉住 4 条。

import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './client'
import {
  batchExportUrl,
  getBatchReport,
  runBatch,
  runWalkForward,
  type WalkForwardRequest,
} from './walkforward'

vi.mock('./client', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('walk-forward', () => {
  it('POST /api/walkforward 透传请求体（walk_forward_params 为大驼峰）', async () => {
    vi.mocked(api.post).mockResolvedValue({ windows: [] })
    const req: WalkForwardRequest = {
      strategy: 'ma_cross',
      stock_pool: ['600000'],
      start_date: '2022-01-01',
      end_date: '2025-12-31',
      walk_forward_params: {
        TrainDays: 250,
        TestDays: 60,
        StepDays: 60,
        MinTrainDays: 0,
      },
    }
    await runWalkForward(req)
    expect(api.post).toHaveBeenCalledWith('/api/walkforward', req)
  })
})

describe('batch', () => {
  it('POST /api/batch', async () => {
    vi.mocked(api.post).mockResolvedValue({ batch_id: 'b1' })
    const req = {
      tasks: [
        {
          id: 't1',
          strategy: 'ma_cross',
          stock_pool: ['600000'],
          start_date: '2022-01-01',
          end_date: '2025-12-31',
          capital: 1_000_000,
        },
      ],
      config: { concurrency: 4 },
    }
    await runBatch(req)
    expect(api.post).toHaveBeenCalledWith('/api/batch', req)
  })

  it('GET /api/batch/:batch_id', async () => {
    vi.mocked(api.get).mockResolvedValue({ batch_id: 'b1' })
    await getBatchReport('b1')
    expect(api.get).toHaveBeenCalledWith('/api/batch/b1')
  })

  it('导出地址只指向 json（csv 后端 501）', () => {
    expect(batchExportUrl('b1')).toBe('/api/batch/b1/export/json')
  })
})
