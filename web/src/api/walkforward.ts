// walk-forward 与批量回测 —— 后端是 `cmd/analysis/handlers_walkforward.go`
// 与 `handlers_batch.go`。
//
// 端点共 **4 条**（台账原写 5 条是把两个已随 SVC-CORE-RUN-RETIRE 退役的
// walkforward 读端点算进去了）：
//
//   POST /api/walkforward                     纯计算，不落库
//   POST /api/batch                           同步跑完整批，返回报告
//   GET  /api/batch/:batch_id                 取已完成的报告
//   GET  /api/batch/:batch_id/export/:format  仅 json 已实现；csv 回 501
//
// 因此 UI **只画 json 导出**，不画 csv 按钮。

import api from './client'

export interface WalkForwardParams {
  /** 后端字段无 JSON tag ⇒ 键是大驼峰。 */
  TrainDays: number
  TestDays: number
  StepDays: number
  MinTrainDays: number
}

export interface WalkForwardRequest {
  strategy: string
  stock_pool: string[]
  start_date: string
  end_date: string
  initial_capital?: number
  risk_free_rate?: number
  strategy_params?: Record<string, number | string | boolean>
  walk_forward_params: WalkForwardParams
}

export interface BacktestResultLite {
  start_date: string
  end_date: string
  total_return: number
  annual_return: number
  sharpe_ratio: number
  sortino_ratio: number
  max_drawdown: number
  win_rate: number
  total_trades: number
  invalid_reasons?: string[]
}

export interface WalkForwardWindow {
  window_index: number
  train_start: string
  train_end: string
  test_start: string
  test_end: string
  train_result?: BacktestResultLite
  test_result?: BacktestResultLite
  train_sharpe: number
  test_sharpe: number
  test_return: number
  test_max_drawdown: number
  oos_vs_train: number
}

export interface WalkForwardReport {
  strategy_id: string
  universe: string
  windows: WalkForwardWindow[]
  avg_test_sharpe: number
  avg_test_return: number
  avg_test_max_drawdown: number
  avg_degradation: number
  pass_rate: number
  overall_pass: boolean
  std_test_sharpe: number
  std_degradation: number
  overfit_score: number
  prob_no_overfit: number
  stability_score: number
}

/** POST /api/walkforward（同步计算；失败由调用方展示错误态）。 */
export async function runWalkForward(req: WalkForwardRequest): Promise<WalkForwardReport> {
  return api.post<WalkForwardReport>('/api/walkforward', req)
}

// ── 批量回测 ────────────────────────────────────────────────────────

export interface BatchTask {
  id: string
  strategy: string
  stock_pool: string[]
  start_date: string
  end_date: string
  capital: number
  risk_free_rate?: number
  params?: Record<string, unknown>
  tags?: string[]
  metadata?: Record<string, string>
}

export interface BatchConfigRequest {
  concurrency?: number
  run_walk_forward?: boolean
  wf_train_days?: number
  wf_test_days?: number
  wf_step_days?: number
}

export interface BatchRunRequest {
  tasks: BatchTask[]
  config?: BatchConfigRequest
}

export interface BatchScore {
  grade: string
  overfit_score: number
  stability_score: number
  composite_score: number
  rank: number
}

export interface BatchResult {
  task_id: string
  strategy: string
  status: string
  error?: string
  duration_ms: number
  result?: BacktestResultLite
  walk_forward?: WalkForwardReport
  score?: BatchScore
}

export interface BatchSummary {
  total_tasks: number
  success_count: number
  fail_count: number
  avg_sharpe: number
  avg_annual_return: number
  avg_max_drawdown: number
  avg_win_rate: number
  avg_overfit_score: number
  avg_stability_score: number
  grade_distribution: Record<string, number>
  best_task_id: string
  worst_task_id: string
}

export interface BatchReport {
  batch_id: string
  created_at: string
  completed_at: string
  status: string
  total_tasks: number
  completed: number
  failed: number
  duration_ms: number
  results: BatchResult[]
  summary: BatchSummary | null
}

/** POST /api/batch（同步；并发封顶 16、任务封顶 100）。 */
export async function runBatch(req: BatchRunRequest): Promise<BatchReport> {
  return api.post<BatchReport>('/api/batch', req)
}

/** GET /api/batch/:batch_id */
export async function getBatchReport(batchId: string): Promise<BatchReport> {
  return api.get<BatchReport>(`/api/batch/${encodeURIComponent(batchId)}`)
}

/**
 * 导出地址。只提供 json —— csv 分支后端明确回 501
 * （handlers_batch.go:124-129），画出来就是假控件。
 */
export function batchExportUrl(batchId: string): string {
  return `/api/batch/${encodeURIComponent(batchId)}/export/json`
}
