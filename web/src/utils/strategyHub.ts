// B-04：策略库三页合一后的 tab 解析。
//
// 三个入口（策略库 / 编辑器 / Copilot）合成 `/strategy-lab` 的三个 tab；
// 旧路径 `/strategy-builder` 与 `/copilot` 作为**路由别名**保留，URL 不变，
// 深链与既有 e2e 不会断。这里只做纯字符串判定，便于单测。

export const STRATEGY_TABS = ['lab', 'builder', 'copilot'] as const

export type StrategyTab = (typeof STRATEGY_TABS)[number]

/**
 * 由"当前路径 + query.tab"决定激活哪个 tab。
 * 路径别名优先于 query：停在 `/copilot` 时不应因 query 缺失落回策略库。
 */
export function resolveStrategyTab(path: string, queryTab: unknown): StrategyTab {
  if (path === '/copilot') return 'copilot'
  if (path === '/strategy-builder') return 'builder'
  if (typeof queryTab === 'string' && (STRATEGY_TABS as readonly string[]).includes(queryTab)) {
    return queryTab as StrategyTab
  }
  return 'lab'
}

/** 切 tab 时要写的目标地址（策略库不带 query，保持 URL 干净）。 */
export function strategyTabLocation(tab: StrategyTab): string {
  return tab === 'lab' ? '/strategy-lab' : `/strategy-lab?tab=${tab}`
}
