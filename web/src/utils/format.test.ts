import { describe, it, expect } from 'vitest'
import { fmtPercent, fmtNumber, fmtCurrency, formatDate, fmtVolume, fmtAmount, fmtMetric } from '@/utils/format'

describe('fmtPercent', () => {
  it('formats positive percentage with plus sign', () => {
    expect(fmtPercent(0.15)).toBe('+15.00%')
  })

  it('formats negative percentage without plus sign', () => {
    expect(fmtPercent(-0.08)).toBe('-8.00%')
  })

  it('formats zero percentage', () => {
    expect(fmtPercent(0)).toBe('+0.00%')
  })

  it('returns dash for null', () => {
    expect(fmtPercent(null)).toBe('-')
  })

  it('returns dash for undefined', () => {
    expect(fmtPercent(undefined)).toBe('-')
  })

  it('returns dash for NaN', () => {
    expect(fmtPercent(NaN)).toBe('-')
  })

  it('formats small percentage correctly', () => {
    expect(fmtPercent(0.0001)).toBe('+0.01%')
  })

  it('formats large percentage correctly', () => {
    expect(fmtPercent(1.5)).toBe('+150.00%')
  })
})

describe('fmtNumber', () => {
  it('formats number with default 2 decimals', () => {
    expect(fmtNumber(1234.567)).toBe('1,234.57')
  })

  it('formats number with custom decimals', () => {
    expect(fmtNumber(1234.567, 0)).toBe('1,235')
  })

  it('returns dash for null', () => {
    expect(fmtNumber(null)).toBe('-')
  })

  it('returns dash for undefined', () => {
    expect(fmtNumber(undefined)).toBe('-')
  })

  it('formats zero', () => {
    expect(fmtNumber(0)).toBe('0.00')
  })

  it('formats negative number', () => {
    expect(fmtNumber(-500.5)).toBe('-500.50')
  })
})

describe('fmtCurrency', () => {
  it('formats large number as wan', () => {
    expect(fmtCurrency(150000)).toBe('¥15.00万')
  })

  it('formats small number as integer', () => {
    expect(fmtCurrency(9999)).toBe('¥9,999')
  })

  it('returns dash for null', () => {
    expect(fmtCurrency(null)).toBe('-')
  })

  it('formats exactly 10000 as wan', () => {
    expect(fmtCurrency(10000)).toBe('¥1.00万')
  })
})

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2024-01-15T00:00:00Z')
    expect(result).toBeTruthy()
    expect(result).not.toBe('-')
  })

  it('returns dash for empty string', () => {
    expect(formatDate('')).toBe('-')
  })
})

describe('fmtVolume', () => {
  it('formats large volume as yi', () => {
    expect(fmtVolume(200000000)).toBe('2.0亿')
  })

  it('formats medium volume as wan', () => {
    expect(fmtVolume(50000)).toBe('5万')
  })

  /**
   * 行为变更（UI-01，2026-10-22）—— 这条断言是**故意翻过来**的，不是静默改期望。
   *
   * 旧实现 `if (!v) return '-'` 把 0 当成缺失（旧用例把 `fmtVolume(0) → '-'`
   * 钉成了期望），于是「成交量 0 股」被显示成「没读到」—— 一个真读数被说成缺失。
   * A-08 / DATA-07 立的口径是**null 才是没有读数，0 就是 0**，所以：
   *  - 0 走正常格式化（万位刻度），不是占位；
   *  - 「缺失」的口径从 falsy 换成 null / undefined / NaN / 空串。
   */
  it('0 是读数不是缺失：正常格式化，不返回占位', () => {
    expect(fmtVolume(0)).toBe('0万')
    expect(fmtVolume('0')).toBe('0万')
  })

  it('只有真读不到时才返回占位（null / undefined / NaN / 空串 / 非数字串）', () => {
    expect(fmtVolume(null)).toBe('-')
    expect(fmtVolume(undefined)).toBe('-')
    expect(fmtVolume(NaN)).toBe('-')
    expect(fmtVolume('')).toBe('-')
    expect(fmtVolume('   ')).toBe('-')
    expect(fmtVolume('不是数字')).toBe('-')
  })
})

describe('fmtAmount', () => {
  it('按亿展示（界面自己补「亿」字）', () => {
    expect(fmtAmount(375461676.1428)).toBe('3.8')
    expect(fmtAmount(200000000)).toBe('2.0')
  })

  /**
   * 与 fmtVolume 同一条口径（UI-01）：旧实现 `if (!a) return '-'` 把 0 显示成缺失，
   * 「成交额 0 元」在屏上与「没读到成交额」长得一模一样。
   */
  it('0 是读数不是缺失：显示 0.0 而不是占位', () => {
    expect(fmtAmount(0)).toBe('0.0')
    expect(fmtAmount('0')).toBe('0.0')
  })

  it('只有真读不到时才返回占位（null / undefined / NaN / 空串）', () => {
    expect(fmtAmount(null)).toBe('-')
    expect(fmtAmount(undefined)).toBe('-')
    expect(fmtAmount(NaN)).toBe('-')
    expect(fmtAmount('')).toBe('-')
  })
})

describe('fmtMetric', () => {
  it('formats absolute value > 1 as fixed decimal', () => {
    expect(fmtMetric(12.3456)).toBe('12.3456')
  })

  it('formats absolute value <= 1 as percentage', () => {
    expect(fmtMetric(0.15)).toBe('15.00%')
  })

  it('returns dash for null', () => {
    expect(fmtMetric(null)).toBe('-')
  })

  it('returns dash for undefined', () => {
    expect(fmtMetric(undefined)).toBe('-')
  })

  it('handles negative values', () => {
    expect(fmtMetric(-0.05)).toBe('-5.00%')
  })
})
