import api from './client'

/**
 * G1「待审阅 N」聚合读面（core `GET /api/review/pending`，openapi:3331）。
 *
 * 契约里最关键的一条：`pending` 只有在**所有**已配置源都答话时才是数字；
 * 任一源不可用就是 `null`（绝不做部分求和），没有配置源时也是 `null`。
 * 所以 UI 必须保留「—」这一态，不能把未知画成 0。
 */
export interface ReviewPendingSource {
  name: string
  status: 'available' | 'unavailable'
  pending: number | null
  error?: string
}

export interface ReviewPending {
  pending: number | null
  as_of?: string
  sources: ReviewPendingSource[]
}

export function getReviewPending(): Promise<ReviewPending> {
  return api.get<ReviewPending>('/api/review/pending')
}
