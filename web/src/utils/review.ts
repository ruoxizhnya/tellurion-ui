import { orderAttemptsBySeq, type AttemptView, type Challenge } from '@/api/explore'

/**
 * 审阅排序的**近似**口径（B-02）。
 *
 * core 的 G1 摘要聚合读面还没给出"平台面积/因果强度"这类派生量，本文件用
 * attempts + verdict 在前端现算，页面必须显式标注「近似」—— 这不是可以沉默的细节：
 * 同一批尝试用不同口径会排出不同名次，用户有权知道排序不是后端权威值。
 *
 * 两条硬规则：
 * 1) **不按 Sharpe 排序**。Sharpe 只说明"这次跑出来多少"，赔率高但四周全是悬崖的
 *    孤峰，换一段样本就没了；平台越宽的同分结果越可能是真的。
 * 2) 缺裁决时因果强度取中性 0.5，既不当作 0（等于替未评估判死刑），也不当作 1。
 */

/** 邻域半径：目标 Sharpe 的 ±10%（按绝对值取，避免负 Sharpe 时区间反向） */
export const PLATEAU_TOLERANCE = 0.1

/**
 * 平台面积 ≈ 与目标 Sharpe 相差不超过 ±10% 的**成功**尝试个数（含自身）。
 * 失败尝试不参与：它没有 Sharpe，把它算进邻域等于把"没跑通"当成"结果接近"。
 */
export function plateauArea(target: AttemptView, all: AttemptView[]): number {
  if (!target.ok || !Number.isFinite(target.sharpe)) return 0
  const radius = Math.abs(PLATEAU_TOLERANCE * (target.sharpe || 1))
  return all.filter((a) => a.ok && Math.abs(a.sharpe - target.sharpe) <= radius).length
}

/** 因果强度：有裁决用因果维概率，没有裁决取中性 0.5（未评估 ≠ 0 分） */
export function causalStrength(a: AttemptView): number {
  const p = a.verdict?.causal?.probability
  return typeof p === 'number' && Number.isFinite(p) ? p : 0.5
}

export interface RankedAttempt {
  attempt: AttemptView
  plateau: number
  causal: number
  score: number
}

/**
 * 综合分 = 平台面积 × 因果强度。同分时按 Sharpe 降序（次序仍只作 tie-break，
 * 不是主排序键），再按 seq 升序，保证同一输入稳定可复现。
 */
export function rankAttempts(attempts: AttemptView[]): RankedAttempt[] {
  const ordered = orderAttemptsBySeq(attempts)
  return ordered
    .map((attempt) => {
      const plateau = plateauArea(attempt, ordered)
      const causal = causalStrength(attempt)
      return { attempt, plateau, causal, score: plateau * causal }
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.attempt.sharpe - a.attempt.sharpe ||
        a.attempt.seq - b.attempt.seq,
    )
}

/**
 * 质疑分级顺序（A-14 断言 2）：阻断在前 —— 它决定了「这条结论现在能不能用」，
 * 埋在提示后面等于让人读到最后才发现结论不成立。
 */
export const SEVERITY_ORDER = ['blocking', 'warning', 'note'] as const

export interface ChallengeGroup {
  severity: Challenge['severity']
  /** 组内保持后端给的原始顺序（不按文字/维度再排） */
  items: Challenge[]
}

/** 按 severity 分组，丢掉空组；组内原序 */
export function groupChallenges(challenges: Challenge[]): ChallengeGroup[] {
  return SEVERITY_ORDER.map((severity) => ({
    severity,
    items: challenges.filter((c) => c.severity === severity),
  })).filter((group) => group.items.length > 0)
}
