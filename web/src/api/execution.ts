// 执行（execution）域的 API —— 后端是 `cmd/analysis/handlers_execution.go`。
//
// 这个文件是 AUD-19（2026-09-22）从 `api/paper-trading.ts` 里搬出来的：
// 原先它和一批 `/api/paper/*` 调用挤在同一个文件里，但那批端点**从未挂载**
// （整条线已删除）。
//
// A-09（2026-11-12）补齐执行域读/写面（openapi:2020-2158）：
//   POST/GET /api/execution/orders、GET /orders/{id}、POST /orders/{id}/cancel、
//   GET /positions、GET /account，外加原本就在的 POST /emergency-flatten。
// 注意：`POST /api/execution/orders` 与 cancel 要求角色 trader/admin（viewer 403）。
// 外部信号流：core 2026-11-12 补了 `GET /api/signals` 读面（openapi:3193+），
// 页面的第四块因此从 disabled 转为真实订阅列表。

import api from './client'

// ── 订单 / 持仓 / 账户（A-09） ──────────────────────────────────

/** 后端未加 json tag，字段名即 openapi 的下划线形式 */
export interface OrderResult {
  order_id: string
  symbol: string
  status: string
  filled_qty: number
  avg_price: number
  commission: number
  timestamp: string
}

export interface OrderListResponse {
  orders: OrderResult[]
  count: number
}

export interface Position {
  symbol: string
  quantity: number
  avg_cost: number
  current_price: number
  market_value: number
  unrealized_pnl: number
  realized_pnl: number
  weight: number
  entry_date: string
  buy_date: string
  quantity_today: number
  quantity_yesterday: number
}

export interface PositionListResponse {
  positions: Position[]
  count: number
}

export interface CreateOrderRequest {
  symbol: string
  side: 'long' | 'short' | 'close'
  type?: 'market' | 'limit' | 'stop' | 'trailing'
  quantity: number
  price?: number
}

/** 账户摘要：openapi 只声明 `type: object`，不虚构字段，按后端返回的键值渲染 */
export type AccountSummary = Record<string, unknown>

export function listOrders(): Promise<OrderListResponse> {
  return api.get<OrderListResponse>('/api/execution/orders')
}

export function getOrder(id: string): Promise<OrderResult> {
  return api.get<OrderResult>(`/api/execution/orders/${encodeURIComponent(id)}`)
}

export function createOrder(req: CreateOrderRequest): Promise<OrderResult> {
  return api.post<OrderResult>('/api/execution/orders', req)
}

export function cancelOrder(id: string): Promise<{ order_id: string; status: string }> {
  return api.post<{ order_id: string; status: string }>(
    `/api/execution/orders/${encodeURIComponent(id)}/cancel`,
  )
}

export function getPositions(): Promise<PositionListResponse> {
  return api.get<PositionListResponse>('/api/execution/positions')
}

export function getAccount(): Promise<AccountSummary> {
  return api.get<AccountSummary>('/api/execution/account')
}

// ── 外部信号流（A-09 第四块，GET /api/signals） ─────────────────────
//
// 契约归 core openapi:3193+：倒序（newest first）、`as_of <= up_to`（默认今天，
// 与消费侧同一防前视边界）、`limit` 默认 100 / 上限 500。空流是 200 + []，
// 读面未接是 503 —— 两者不能混成一个空数组。

export type SignalDirection = 'long' | 'short' | 'close'

/** 「信号」是模型给出的可执行主张；`factors` 只是诊断快照（不参与 content_hash） */
export interface ExternalSignal {
  model_id: string
  symbol: string
  direction: SignalDirection
  strength: number
  as_of: string
  factors?: Record<string, number>
}

export interface SignalFeedResponse {
  signals: ExternalSignal[]
  count: number
  limit: number
}

export interface ListSignalsParams {
  model_id?: string
  symbol?: string
  limit?: number
  /** YYYY-MM-DD；省略 = 今天（UTC） */
  up_to?: string
}

export function listSignals(params: ListSignalsParams = {}): Promise<SignalFeedResponse> {
  const q = new URLSearchParams()
  if (params.model_id) q.set('model_id', params.model_id)
  if (params.symbol) q.set('symbol', params.symbol)
  if (params.limit != null) q.set('limit', String(params.limit))
  if (params.up_to) q.set('up_to', params.up_to)
  const qs = q.toString()
  return api.get<SignalFeedResponse>(`/api/signals${qs ? `?${qs}` : ''}`)
}

// ── Emergency Flatten (P2-3, ODR-026) ──────────────────────────────
// Kill-switch endpoint. The server-side `trading.emergency_token`
// must be configured (otherwise the server returns 503). The same
// token is required in both the Authorization Bearer header AND
// the body `confirmation_token` field — defence in depth.

export interface EmergencyFlattenOrder {
  symbol: string
  order_id: string
  quantity: number
  fill_price: number
  net_proceeds: number
  bypassed_t1: boolean
  submitted_at: string
}

export interface EmergencyFlattenSkip {
  symbol: string
  quantity: number
  reason: string
}

export interface EmergencyFlattenResult {
  sold: EmergencyFlattenOrder[]
  skipped: EmergencyFlattenSkip[]
  sold_total: number
  started_at: string
  completed_at: string
  reason: string
  latency_ms: number
}

export interface EmergencyFlattenRequest {
  reason: string
  confirmation_token: string
}

export async function emergencyFlatten(
  token: string,
  reason: string,
): Promise<EmergencyFlattenResult> {
  return api.post<EmergencyFlattenResult>(
    '/api/execution/emergency-flatten',
    { reason, confirmation_token: token },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
}
