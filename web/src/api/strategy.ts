import api from './client'
import type { Strategy } from '@/types/api'

export function getStrategies(): Promise<{ strategies: Strategy[] }> {
  return api.get('/api/strategies')
}

// StrategyBuilder (P3): persist a visually-assembled multi-factor strategy.
// The factors array mirrors what the canvas produces — each entry pins a
// factor definition to a weight (0-100) and a direction. stock_count and
// rebalance_freq drive the selection + rebalance logic on the backend.
export interface StrategyFactorEntry {
  id: string
  weight: number
  direction: 'long' | 'short'
}

export interface SaveStrategyRequest {
  name: string
  factors: StrategyFactorEntry[]
  stock_count: number
  rebalance_freq: 'daily' | 'weekly' | 'monthly'
}

export interface SaveStrategyResponse {
  id: string
  name: string
}

export function saveStrategy(req: SaveStrategyRequest): Promise<SaveStrategyResponse> {
  return api.post<SaveStrategyResponse>('/api/strategies', req)
}

/** promote 的坐标：策略 id + 版本 hash（都来自资产登记，不是前端猜的）。 */
export interface PromoteTarget {
  strategyId: string
  versionHash: string
}

/** 策略服务 `artifactView` 的可见字段；未知字段原样留给调用方判断。 */
export interface PromotedArtifact {
  strategy_id?: string
  version_hash?: string
  status?: string
  carrier?: string
  [key: string]: unknown
}

/**
 * 人工放行（promote）一个策略版本。
 *
 * **身份 = 当前登录者自己的 JWT + `X-Actor` = 该用户的用户名**（2026-11-12 裁决）。
 * 理由写在这里，因为这里是唯一能改回去的地方：
 *   - promote 是**人对某个版本背书**，责任人必须能落回具体用户；
 *   - service token 是机器身份，用它 promote 等于把人的决定洗成系统行为，审计链断掉；
 *   - admin 代调则把责任从决策人身上挪走。
 *
 * 因此这里**不**接受 service token、不写死任何 `X-Service-*` 头，`actor` 由调用方
 * 从 auth store 取（未登录时调用方不给点按钮）。Authorization 由 client 自动注入，
 * 与全站其它请求同一条路 —— 鉴权收紧后这里不需要改代码。
 *
 * 后端拒绝口径（tellurion-strategy `internal/httpapi`）：`400 actor_required`（缺
 * X-Actor）、`401`（无/坏凭据）、`403`（角色不足）、`404 artifact_not_found`、
 * `409`（状态不是 validated）、`400 unsupported_carrier`。
 */
export function promoteStrategyVersion(
  target: PromoteTarget,
  actor: string,
): Promise<PromotedArtifact> {
  const path =
    `/api/strategies/${encodeURIComponent(target.strategyId)}` +
    `/versions/${encodeURIComponent(target.versionHash)}/promote`
  return api.post<PromotedArtifact>(path, undefined, { headers: { 'X-Actor': actor } })
}
