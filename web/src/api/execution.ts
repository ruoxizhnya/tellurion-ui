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
// `GET /api/signals` **只有写门、没有读面**，所以页面的「外部信号流」只能是 disabled。

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
