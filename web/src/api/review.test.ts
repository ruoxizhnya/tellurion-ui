import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './client'
import { getReviewPending } from './review'

vi.mock('./client', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), del: vi.fn() },
}))

/** G1：`GET /api/review/pending`（core openapi:3331）。 */
describe('review api', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
  })

  it('getReviewPending → GET /api/review/pending', async () => {
    vi.mocked(api.get).mockResolvedValue({ pending: 3, sources: [] })
    await getReviewPending()
    expect(api.get).toHaveBeenCalledWith('/api/review/pending')
  })

  it('pending=null 原样透传（「不知道」不能归一成 0）', async () => {
    vi.mocked(api.get).mockResolvedValue({ pending: null, sources: [] })
    await expect(getReviewPending()).resolves.toMatchObject({ pending: null })
  })
})
