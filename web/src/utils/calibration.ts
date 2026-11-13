import type { CalibrationEntry } from '@/api/pipeline'

/**
 * A-12 校准驾驶舱的纯计算层。
 *
 * 口径纪律（与台账 A-12 一致）：
 * - **分箱只作展示**，不重算后端给的 `hit_rate / calibration_error / brier_score`；
 *   页面上那些读数照抄 `/api/pipeline/calibration`，避免两套数字打架。
 * - `outcome_hit === null` 是「待回填」，**不进命中率分母**，只单独计数。
 * - `is_holdout === true` 的条目**不与主样本混算**，单独分箱单独成列。
 */

/** 样本量低于此值时页面必须显式写「样本不足，仅供参考」（不做统计显著性包装） */
export const CALIBRATION_MIN_SAMPLE = 30

const BIN_COUNT = 10

export interface CalibrationBin {
  /** 例：`0.7–0.8`；声称值 1.0 归入最后一档 */
  label: string
  lower: number
  upper: number
  /** 已回填样本数 —— 命中率的分母 */
  n: number
  hits: number
  /** 已回填样本的实际命中率；`n === 0` 时为 null（不显示 0%） */
  hitRate: number | null
  /** 箱内已回填样本的平均声称置信度；`n === 0` 时为 null */
  claimedRate: number | null
  /** 箱内待回填条数（不计入分母） */
  pending: number
}

function clampClaim(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

/** 声称置信度 → 箱下标；1.0 落在最后一箱 */
export function binIndex(claimedConfidence: number): number {
  return Math.min(BIN_COUNT - 1, Math.floor(clampClaim(claimedConfidence) * BIN_COUNT))
}

/** 主样本 / holdout 分流；两边的分箱与读数都不相通 */
export function splitHoldout(entries: CalibrationEntry[]): {
  main: CalibrationEntry[]
  holdout: CalibrationEntry[]
} {
  const main: CalibrationEntry[] = []
  const holdout: CalibrationEntry[] = []
  for (const entry of entries) {
    if (entry.is_holdout) holdout.push(entry)
    else main.push(entry)
  }
  return { main, holdout }
}

/**
 * 按声称置信度做 10 等分箱，只返回有内容的箱（已回填或待回填 > 0）。
 * 调用方负责先按 holdout 分流。
 */
export function binCalibration(entries: CalibrationEntry[]): CalibrationBin[] {
  const bins: CalibrationBin[] = []
  for (let i = 0; i < BIN_COUNT; i++) {
    bins.push({
      label: `${(i / BIN_COUNT).toFixed(1)}–${((i + 1) / BIN_COUNT).toFixed(1)}`,
      lower: i / BIN_COUNT,
      upper: (i + 1) / BIN_COUNT,
      n: 0,
      hits: 0,
      hitRate: null,
      claimedRate: null,
      pending: 0,
    })
  }

  const claimedSum = new Array<number>(BIN_COUNT).fill(0)

  for (const entry of entries) {
    const index = binIndex(entry.claimed_confidence)
    const bin = bins[index]
    if (entry.outcome_hit === null || entry.outcome_hit === undefined) {
      bin.pending += 1
      continue
    }
    bin.n += 1
    claimedSum[index] += clampClaim(entry.claimed_confidence)
    if (entry.outcome_hit) bin.hits += 1
  }

  bins.forEach((bin, index) => {
    if (bin.n > 0) {
      bin.hitRate = bin.hits / bin.n
      bin.claimedRate = claimedSum[index] / bin.n
    }
  })

  return bins.filter((bin) => bin.n > 0 || bin.pending > 0)
}
