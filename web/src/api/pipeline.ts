import api from './client'

// ai-service 的采纳台账（G6 已落地）经 core `/api/pipeline/*` 反代到达 UI。
// 契约见 tellurion-agent:docs/api-schema.md §1.3。

/**
 * 一次人工干预/采纳裁决。`proposal_id` 是幂等键：重复写入 → `409`，决策不可回写。
 * `claimed_confidence` 是**提案方自报**的命中概率，必填且在 `[0,1]`；
 * 缺了就会 400 —— 后端拒绝把"没说多少把握"记成默认值。
 */
export interface AdoptionRequest {
  proposal_id: string
  actor: string
  intervention?: string
  adopted: boolean
  claimed_confidence: number
  is_holdout?: boolean
  outcome_hit?: boolean
  result_ref?: string
}

export interface AdoptionRecord extends Omit<AdoptionRequest, 'outcome_hit'> {
  id: number
  /** 台账回显：`null` = 尚未回填（pending），与请求里"没传"不是同一个意思 */
  outcome_hit: boolean | null
}

export function recordAdoption(req: AdoptionRequest): Promise<AdoptionRecord> {
  return api.post<AdoptionRecord>('/api/pipeline/adoption', req)
}

export interface CalibrationEntry {
  proposal_id: string
  actor: string
  intervention: string
  adopted: boolean
  claimed_confidence: number
  is_holdout: boolean
  outcome_hit: boolean | null
  result_ref: string
  created_at: string
  resolved_at: string | null
}

export interface Calibration {
  sample_size: number
  hit_rate: number
  claimed_rate: number
  calibration_error: number
  brier_score: number
  pending: number
  holdout: { sample_size: number; hit_rate: number }
  entries: CalibrationEntry[]
}

export function getCalibration(): Promise<Calibration> {
  return api.get<Calibration>('/api/pipeline/calibration')
}
