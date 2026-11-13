import { markRaw } from 'vue'
import type { Component } from 'vue'
import {
  AnalyticsOutline,
  BeakerOutline,
  ClipboardOutline,
  CloudDownloadOutline,
  FlaskOutline,
  GitCompareOutline,
  HomeOutline,
  NotificationsOutline,
  SearchOutline,
  SettingsOutline,
  ShieldCheckmarkOutline,
  StatsChartOutline,
  SwapHorizontalOutline,
} from '@vicons/ionicons5'

export interface NavItem {
  path: string
  label: string
  icon: Component
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

/**
 * 导航唯一真相源（A-04 断言 5：命令面板与侧栏必须读同一份表）。
 *
 * 标签只允许引 `user-flows.md` §3.2 的词。此前同一页在四处有四种叫法
 * （选股器 / 全市场选股 / 选股与市场、数据同步 / 数据通道 / 数据管道 …），
 * 设计稿每屏各写一遍，全站没有一套导航。
 *
 * A-13（2026-11-13）按 §3.2 目标 IA 收敛为 **14 项 5 段**：
 * - 「证据质问」不再有独立入口（A-06 已降级为数字旁的内嵌侧滑），`/evidence`
 *   路由与页面保留作深链兜底，但侧栏与 ⌘K 不再登记；
 * - 「纸交易」从仪器房移入「系统」——它是执行与账户域，不是研究仪器。
 * `nav-labels.test.ts` 会把本表与 §3.2 的代码块逐项比对，改这里必须同步改文档。
 *
 * B-04 已把 策略库 / 编辑器 / Copilot 合成 `/strategy-lab` 一个入口，
 * 旧路径保留为路由别名（URL 不变），不在侧栏重复登记。
 */
export const NAV_GROUPS: NavGroup[] = [
  { title: '总览', items: [{ path: '/', label: '控制台', icon: markRaw(HomeOutline) }] },
  {
    title: '研究主线',
    items: [
      { path: '/explore', label: '探索观察', icon: markRaw(FlaskOutline) },
      { path: '/review', label: '审阅台', icon: markRaw(ClipboardOutline) },
    ],
  },
  {
    title: '仪器房',
    items: [
      { path: '/backtest', label: '回测引擎', icon: markRaw(AnalyticsOutline) },
      { path: '/backtest/compare', label: '多策略对比', icon: markRaw(GitCompareOutline) },
      { path: '/walkforward', label: '走向与批量', icon: markRaw(StatsChartOutline) },
      { path: '/strategy-lab', label: '策略库', icon: markRaw(BeakerOutline) },
      // UI-FACTOR-RESEARCH-LABEL：`/factors` 已按 ADR-037 退役为说明页（因子值由 core
      // 按需求值，无查询入口）。入口按 2026-11-12 产品裁决保留为可见落点，但标签必须
      // 与内容一致——旧标签「因子研究」会让人以为这里还有因子计算/查询能力。
      // 路由路径不动（外链与历史深链继续有效）。
      { path: '/factors', label: '因子证据（已退役）', icon: markRaw(StatsChartOutline) },
      { path: '/screener', label: '选股与市场', icon: markRaw(SearchOutline) },
      { path: '/data-sync', label: '数据管理', icon: markRaw(CloudDownloadOutline) },
    ],
  },
  {
    title: '监控',
    items: [{ path: '/alerts', label: '风险告警', icon: markRaw(NotificationsOutline) }],
  },
  {
    title: '系统',
    items: [
      { path: '/paper-trading', label: '纸交易', icon: markRaw(SwapHorizontalOutline) },
      { path: '/compliance', label: '合规', icon: markRaw(ShieldCheckmarkOutline) },
      { path: '/system-admin', label: '系统管理', icon: markRaw(SettingsOutline) },
    ],
  },
]

/** 扁平化后的导航项：命令面板按它搜索 */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items)

/** 命令面板的过滤口径：空关键词返回全量；否则按标签或路径子串、大小写不敏感 */
export function filterNavItems(keyword: string, items: NavItem[] = NAV_ITEMS): NavItem[] {
  const k = keyword.trim().toLowerCase()
  if (!k) return items
  return items.filter(
    (i) => i.label.toLowerCase().includes(k) || i.path.toLowerCase().includes(k),
  )
}

/**
 * AUD-63：sidebar 每项的 e2e 锚点（命名规则见 ui:docs/TASKS.md AUD-63）。
 * 根路径 `'/'` 映射为 `home`；其余去掉前导 `/`、内部 `/` 换成 `-`，
 * 例：`/backtest/compare` → `nav-item-backtest-compare`。属性值里不留斜杠。
 */
export function navTestId(path: string): string {
  if (path === '/') return 'nav-item-home'
  return `nav-item-${path.slice(1).replace(/\//g, '-')}`
}

/** 命令面板每项的锚点：`/backtest/compare` → `command-item-backtest-compare` */
export function commandItemTestId(path: string): string {
  if (path === '/') return 'command-item-home'
  return `command-item-${path.slice(1).replace(/\//g, '-')}`
}
