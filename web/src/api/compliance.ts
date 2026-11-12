// P2-4 (ODR-028): Investor-suitability (适当性管理) API client.
//
// The frontend calls these endpoints BEFORE submitting an order to
// /api/execution/orders. The backend is the source of truth for
// per-board thresholds (100k ChiNext, 500k STAR, 1M BSE — see
// pkg/compliance/appropriateness.go), so the UI does NOT duplicate
// the rule logic; it only renders the verdict and the explanation
// reasons.
//
//   POST /api/compliance/check        — verdict for a single symbol
//   GET  /api/compliance/requirements  — current per-board thresholds
//   GET  /api/compliance/boards        — boards that require a check
//
// The handler returns HTTP 200 for "allowed" or "implicit allow"
// (boards outside the suitability scope) and HTTP 422 for explicit
// rejections with a structured CheckResponse body. The client
// surfaces the rejection reasons verbatim — translation to UI
// language happens in the consumer (OrderForm, etc.).
import api from './client'

// RiskLevel mirrors pkg/compliance.RiskLevel. The numbers are 0..5
// (Unset, C1, C2, C3, C4, C5). We re-declare the union here so the
// frontend can do `as const` checks without a runtime import.
export type RiskLevel = 0 | 1 | 2 | 3 | 4 | 5

// SuitabilityProfile mirrors the backend's `compliance.SuitabilityProfile`.
// All fields are optional; missing fields fall back to the handler's
// `defaultProfile` (configured server-side from
// `trading.default_user_profile.*`).
export interface SuitabilityProfile {
  user_id?: string
  asset_daily_avg_cny?: number
  first_trade_at?: string // RFC3339
  risk_level?: RiskLevel
  boards_enabled?: string[]
  risk_test_expired_at?: string // RFC3339
}

// CheckRequest is the body of POST /api/compliance/check. Symbol is
// the only required field — the profile is optional and falls back
// to the server-side default.
export interface CheckRequest {
  symbol: string
  // Optional profile overrides. Production callers (paper trading
  // page, signal review) usually omit these; dev / test callers
  // supply them to exercise specific rejection paths.
  user_id?: string
  asset_daily_avg_cny?: number
  first_trade_at?: string
  risk_level?: RiskLevel
  boards_enabled?: string[]
  risk_test_expired_at?: string
}

// BoardRequirement mirrors pkg/compliance.BoardRequirement. DisplayName
// and Description are server-supplied Chinese text; the frontend
// renders them verbatim in the "为什么我不能下单" disclosure.
export interface BoardRequirement {
  Board: string
  AssetThresholdCNY: number
  ExperienceMonths: number
  RiskLevel: RiskLevel
  DisplayName: string
  Description: string
}

// CheckResponse is the body returned by POST /api/compliance/check.
// The same shape is returned on both HTTP 200 and 422; the only
// difference is the HTTP status code itself.
export interface CheckResponse {
  allowed: boolean
  board: string
  board_name?: string
  reasons: string[]
  user_id: string
  profile_age_months: number
  asset_daily_avg_cny: number
  risk_level: string
  required?: BoardRequirement
  checked_at: string
}

// RequirementsResponse is the body of GET /api/compliance/requirements.
export interface RequirementsResponse {
  requirements: BoardRequirement[]
  generated_at: string
}

// BoardsResponse is the body of GET /api/compliance/boards.
export interface BoardsResponse {
  boards: string[]
  count: number
}

/**
 * Check whether the configured user profile is allowed to trade
 * `symbol`. Returns the structured verdict; HTTP 422 from the server
 * is surfaced as a normal resolved response (the client does NOT
 * throw on 4xx — the consumer branches on `result.allowed`).
 *
 * Throws only on transport / 5xx failures.
 */
export async function checkSuitability(req: CheckRequest): Promise<CheckResponse> {
  return api.post<CheckResponse>('/api/compliance/check', req)
}

/**
 * List all per-board thresholds. Used by the onboarding page to
 * render the "板块开通条件" table without hard-coding the numbers
 * in the SPA bundle.
 */
export async function getRequirements(): Promise<RequirementsResponse> {
  return api.get<RequirementsResponse>('/api/compliance/requirements')
}

/**
 * List the boards that require a suitability precheck. Used to
 * decide whether the order form should run the precheck at all —
 * main-board orders are unconditional, so the form can skip the
 * round-trip and submit directly.
 */
export async function getBoards(): Promise<BoardsResponse> {
  return api.get<BoardsResponse>('/api/compliance/boards')
}

// ============================================================
// P2-5: 异常交易检测（POST /api/compliance/abnormal/run）
//
// 请求体里的 orders/trades 是**滑窗内的原始流水**（服务端不替你
// 查库）；页面用 JSON 文本域录入，不臆造行编辑控件。
// ============================================================

/** 下单流水（pkg/compliance.OrderRecord）。 */
export interface OrderRecord {
  order_id: string
  symbol: string
  direction: string
  quantity: number
  price: number
  filled_qty: number
  avg_fill_price: number
  status: string
  submitted_at: string
  updated_at: string
}

/** 成交流水（pkg/compliance.TradeRecord）。 */
export interface TradeRecord {
  trade_id: string
  order_id: string
  symbol: string
  direction: string
  quantity: number
  price: number
  fee: number
  trade_time: string
}

export interface AbnormalAlertEvidence {
  order_id?: string
  trade_id?: string
  symbol: string
  direction: string
  quantity: number
  price: number
  timestamp: string
  cancelled?: boolean
  note?: string
}

/**
 * 异常告警。注意：后端 `compliance.AbnormalAlert` **没有 JSON tag**，
 * 序列化后是 Go 字段名（大驼峰），因此这里按实际线上形状建模，
 * 不要"顺手"改成 snake_case。
 */
export interface AbnormalAlert {
  Category: string
  AccountID: string
  Symbol: string
  DetectedAt: string
  WindowFrom: string
  WindowTo: string
  Severity: string
  Summary: string
  Evidence?: AbnormalAlertEvidence[]
}

export interface AbnormalRunRequest {
  account_id: string
  orders: OrderRecord[]
  trades: TradeRecord[]
}

export interface AbnormalRunResponse {
  alerts: AbnormalAlert[]
  count: number
  run_at: string
}

/** 运行 6 类异常交易检测。 */
export async function runAbnormalDetection(
  req: AbnormalRunRequest,
): Promise<AbnormalRunResponse> {
  return api.post<AbnormalRunResponse>('/api/compliance/abnormal/run', req)
}

// ============================================================
// P2-6: 大额交易日报（POST /api/compliance/report/daily）
// ============================================================

export interface LargeTradeEntry {
  trade_id: string
  order_id: string
  account_id: string
  symbol: string
  direction: string
  quantity: number
  price: number
  amount_cny: number
  trade_time: string
  flag: string
  note?: string
}

export interface AccountCumulative {
  account_id: string
  total_amount_cny: number
  trade_count: number
  first_trade_at: string
  last_trade_at: string
}

export interface LargeTradeReport {
  schema_version: string
  generated_at: string
  trading_date: string
  single_threshold_cny: number
  cumulative_threshold_cny: number
  total_trades: number
  total_amount_cny: number
  large_trades: LargeTradeEntry[]
  cumulative_by_account: AccountCumulative[]
  excluded_accounts?: string[]
}

export interface DailyReportRequest {
  /** YYYY-MM-DD；省略时服务端用当天。 */
  trading_date?: string
  trades: TradeRecord[]
}

export interface DailyReportResponse {
  path: string
  report: LargeTradeReport
}

/** 生成当日大额交易报告（同时落盘，path 为服务端文件路径）。 */
export async function generateDailyReport(
  req: DailyReportRequest,
): Promise<DailyReportResponse> {
  return api.post<DailyReportResponse>('/api/compliance/report/daily', req)
}

// ============================================================
// P2-7: 减持规则（4 条）
// ============================================================

export type ShareholderType =
  | 'controlling'
  | 'director'
  | 'major_5pct'
  | 'pre_ipo'
  | 'placement'

export type ReductionMethod = 'auction' | 'block' | 'agreement'

export interface LockupPeriod {
  start_at: string
  end_at: string
  reason: string
  source: string
  code: string
  priority: number
}

export interface ShareholderProfile {
  user_id: string
  symbol: string
  holder_type: ShareholderType
  holdings_pct: number
  holdings_share: number
  acquired_at: string
  lockups?: LockupPeriod[]
  is_controller?: boolean
  controller_id?: string
}

export interface ReductionPlan {
  symbol: string
  quantity: number
  method: ReductionMethod
  at: string
}

export interface Reduction {
  symbol: string
  method: ReductionMethod
  quantity: number
  at: string
  price: number
}

export interface DivestmentCheckRequest {
  profile: ShareholderProfile
  plan: ReductionPlan
  recent?: Reduction[]
}

export interface DivestmentCheckResult {
  allowed: boolean
  user_id: string
  symbol: string
  holder_type: ShareholderType
  method: ReductionMethod
  checked_at: string
  requested_qty: number
  approved_qty: number
  window_start: string
  window_end: string
  window_cap_pct: number
  window_used_pct: number
  window_remain_pct: number
  hold_pct_after: number
  reasons: string[]
  lockups: LockupPeriod[]
  warnings: string[]
}

/**
 * 减持前检查。HTTP 422 表示合规拒绝，但响应体仍是
 * `DivestmentCheckResult`（与 checkSuitability 同口径：按 allowed 分支）。
 */
export async function checkDivestment(
  req: DivestmentCheckRequest,
): Promise<DivestmentCheckResult> {
  return api.post<DivestmentCheckResult>('/api/compliance/divestment/check', req)
}

export interface OptionItem<T extends string> {
  id: T
  label: string
}

export interface HolderTypesResponse {
  holder_types: OptionItem<ShareholderType>[]
  count: number
}

export async function getDivestmentHolderTypes(): Promise<HolderTypesResponse> {
  return api.get<HolderTypesResponse>('/api/compliance/divestment/holder-types')
}

export interface MethodsResponse {
  methods: OptionItem<ReductionMethod>[]
  count: number
}

export async function getDivestmentMethods(): Promise<MethodsResponse> {
  return api.get<MethodsResponse>('/api/compliance/divestment/methods')
}

/**
 * 规则快照。`DivestmentRule` 没有 JSON tag ⇒ 值是大驼峰字段名；
 * 外层 map 的键是 5 类主体 id。
 */
export interface DivestmentRule {
  HolderType: ShareholderType
  AuctionWindowDays: number
  AuctionWindowCapPct: number
  BlockWindowDays: number
  BlockWindowCapPct: number
  AgreementMinPct: number
  DirectorAnnualCapPct: number
  PreIPOLockupMonths: number
  PlacementAuctionMonths: number
  PlacementStrategicMonths: number
  PlacementControllerMonths: number
  Source: string
}

export interface DivestmentRulesResponse {
  rules: Record<string, DivestmentRule>
  generated_at: string
}

export async function getDivestmentRules(): Promise<DivestmentRulesResponse> {
  return api.get<DivestmentRulesResponse>('/api/compliance/divestment/rules')
}
