export function fmtPercent(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '-'
  return (n >= 0 ? '+' : '') + (n * 100).toFixed(2) + '%'
}

export function fmtNumber(n: number | null | undefined, decimals = 2): string {
  if (n == null || isNaN(n)) return '-'
  return n.toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function fmtCurrency(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '-'
  if (Math.abs(n) >= 10000) return '¥' + (n / 10000).toFixed(2) + '万'
  return '¥' + n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function formatDate(d: string | null | undefined): string {
  if (!d) return '-'
  try {
    const date = new Date(d)
    if (isNaN(date.getTime())) return d.slice(0, 10)
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch {
    return d.slice(0, 10)
  }
}

export function formatTime(d: string): string {
  if (!d) return '-'
  return new Date(d).toLocaleTimeString('zh-CN')
}

/**
 * 「这一格有没有读数」的判据（UI-01）。
 *
 * 旧实现用 `if (!v) return '-'`，而 `0` 是 falsy ⇒ 「成交量 0 股」被显示成 `-`，
 * 也就是把一个**真读数**说成「没读到」。这与 A-08 / DATA-07 立的口径直接冲突：
 * **null 才是没有读数，0 就是 0**。
 *
 * 缺失的四种形态：null / undefined / 空串（trim 后）/ 解析不成数的串。
 * 数字 0（以及 '0'）是读数，走正常格式化。
 */
function isMissingReading(v: number | string | null | undefined): boolean {
  if (v == null) return true
  if (typeof v === 'string' && v.trim() === '') return true
  return Number.isNaN(Number(v))
}

export function fmtVolume(v: number | string | null | undefined): string {
  if (isMissingReading(v)) return '-'
  const num = Number(v)
  if (num >= 1e8) return (num / 1e8).toFixed(1) + '亿'
  return (num / 1e4).toFixed(0) + '万'
}

export function fmtAmount(a: number | string | null | undefined): string {
  if (isMissingReading(a)) return '-'
  return (Number(a) / 1e8).toFixed(1)
}

export function fmtMetric(v: number | string | null | undefined): string {
  if (v == null || isNaN(Number(v))) return String(v ?? '-')
  return Math.abs(Number(v)) > 1 ? Number(v).toFixed(4) : (Number(v) * 100).toFixed(2) + '%'
}

export interface DateValuePoint {
  date: string
  value: number
}

export function sampleData(raw: DateValuePoint[], maxPoints = 500): DateValuePoint[] {
  if (raw.length <= maxPoints) return raw
  const step = Math.ceil(raw.length / maxPoints)
  const sampled: DateValuePoint[] = []
  for (let i = 0; i < raw.length; i += step) {
    sampled.push(raw[i])
  }
  const last = raw[raw.length - 1]
  if (!sampled.length || sampled[sampled.length - 1].date !== last.date) {
    sampled.push(last)
  }
  return sampled
}
