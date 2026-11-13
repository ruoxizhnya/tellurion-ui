import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { NAV_GROUPS, NAV_ITEMS } from './navItems'

/**
 * 导航标签同源守卫（TASKS.md A-04 断言 1/3）。
 *
 * 存在的理由：同一个入口此前有**三处**各写一遍 —— 侧栏 label、路由 meta.title（浏览器
 * 标签页）、页面 H1/卡片标题。三处手抄必然漂移（实测漂移过：侧栏"因子证据" vs 页面
 * "因子研究" vs 标签页"因子证据"，§3.2 又写"因子研究"）。本条把"三处一致"从人眼
 * 检查变成机器检查。
 *
 * 破坏验证：把 navItems.ts 任一 label 或 router 任一 title 改一个字 → 本测试必须红。
 *
 * A-04 断言 5 起，侧栏与 ⌘K 命令面板共用 `navItems.ts`，本守卫读的也是这份文件。
 */

const navSrc = readFileSync(resolve(__dirname, 'navItems.ts'), 'utf8')
const routerSrc = readFileSync(resolve(__dirname, '../../router/index.ts'), 'utf8')

/**
 * 解析 `user-flows.md` §3.2 的目标 IA 代码块（A-13 断言 4）。
 *
 * 格式约定（与文档里的树一一对应）：
 * - 顶格 `├── 组名 English` 是分组；
 * - 缩进 `│   ├── 中文标签 English ← /path` 是入口，label 取第一个空白前的词，
 *   path 取 `←` 后的第一个词；
 * - `Quant Lab` 根行与「未入侧栏」表不算导航项。
 *
 * **解析失败必须抛错（= 红）**：静默返回空数组会让「逐项一致」变成永远成立的空断言。
 */
function navTreeFromDoc(): { title: string; items: { label: string; path: string }[] }[] {
  const md = readFileSync(resolve(__dirname, '../../../../docs/design/user-flows.md'), 'utf8')
  const start = md.indexOf('### 3.2')
  if (start < 0) throw new Error('user-flows.md 找不到 §3.2')
  const block = md.slice(start).match(/```[a-z]*\r?\n([\s\S]*?)```/)
  if (!block) throw new Error('§3.2 找不到目标 IA 代码块')

  const groups: { title: string; items: { label: string; path: string }[] }[] = []
  for (const line of block[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim() === 'Quant Lab') continue
    const body = line.replace(/^[│\s]*[├└]──\s*/, '')
    if (body === line) continue // 不是树节点

    if (/^[├└]──/.test(line)) {
      groups.push({ title: body.trim().split(/\s+/)[0], items: [] })
      continue
    }

    const [labelPart, rest] = body.split('←')
    if (!rest || groups.length === 0) throw new Error(`§3.2 条目无法解析：${line}`)
    groups[groups.length - 1].items.push({
      label: labelPart.trim().split(/\s+/)[0],
      path: rest.trim().split(/\s+/)[0],
    })
  }
  return groups
}

/** 侧栏：{ path, label } 列表（按 NAV_GROUPS 声明顺序） */
function navItems(): { path: string; label: string }[] {
  return [...navSrc.matchAll(/path:\s*'([^']+)',\s*label:\s*'([^']+)'/g)].map((m) => ({
    path: m[1],
    label: m[2],
  }))
}

/** 路由：{ path, title } 列表（只取有 meta.title 的项） */
function routes(): { path: string; title: string }[] {
  const out: { path: string; title: string }[] = []
  const re = /path:\s*'([^']+)'[\s\S]*?meta:\s*\{\s*title:\s*'([^']+)'/g
  for (const m of routerSrc.matchAll(re)) out.push({ path: m[1], title: m[2] })
  return out
}

/** 路由里的子路径是相对的（'backtest'），补上前缀后才能与侧栏绝对路径比对 */
function absolute(p: string): string {
  return p === '' ? '/' : p.startsWith('/') ? p : `/${p}`
}

describe('导航标签与路由标题同源', () => {
  const items = navItems()
  const routeMap = new Map(routes().map((r) => [absolute(r.path), r.title]))

  it('侧栏至少渲染出一套标签（解析失败要立刻暴露，而不是静默变绿）', () => {
    // A-13：下限由 ≥9 提到 ≥14（绝对值，不从现状推导）
    expect(items.length, 'navItems.ts 解析失败会静默变绿').toBeGreaterThanOrEqual(14)
    expect(routeMap.size).toBeGreaterThanOrEqual(9)
  })

  /**
   * A-13 断言 1：14 项 5 组是**绝对值**，不从现状推导 —— 写死数字才能在
   * 「有人顺手加回一项」时立刻红。
   */
  it('A-13：导航收敛为 14 项 5 组，分组计数 [1,2,7,1,3]', () => {
    expect(NAV_ITEMS).toHaveLength(14)
    expect(NAV_GROUPS.map((g) => g.items.length)).toEqual([1, 2, 7, 1, 3])
    expect(NAV_GROUPS.map((g) => g.title)).toEqual(['总览', '研究主线', '仪器房', '监控', '系统'])
    // 证据质问降级为深链：路由与页面保留，但不再是导航项
    expect(NAV_ITEMS.map((i) => i.path)).not.toContain('/evidence')
    expect(NAV_ITEMS.map((i) => i.path)).toContain('/paper-trading')
  })

  /**
   * A-13 断言 4：§3.2 的树 ↔ `navItems.ts` 组/序/label/path 逐项一致。
   * 破坏验证：往 §3.2 注入一条不存在的入口 ⇒ 红；还原 ⇒ 绿。
   */
  it('§3.2 目标 IA 与 navItems.ts 逐项一致', () => {
    const tree = navTreeFromDoc()
    const actual = NAV_GROUPS.map((g) => ({
      title: g.title,
      items: g.items.map((i) => ({ label: i.label, path: i.path })),
    }))
    expect(tree).toEqual(actual)
  })

  it('侧栏每个入口在路由表里都存在（导航不得指向不存在的路由）', () => {
    const missing = items.filter((i) => !routeMap.has(i.path)).map((i) => `${i.label} → ${i.path}`)
    expect(missing, `侧栏入口无对应路由：${missing.join(', ')}`).toEqual([])
  })

  it('侧栏 label 与路由 meta.title 逐字相同（三处手抄的其中两处）', () => {
    const drift = items
      .filter((i) => routeMap.has(i.path))
      .filter((i) => routeMap.get(i.path) !== i.label)
      .map((i) => `${i.path}: 侧栏 "${i.label}" ≠ 标签页 "${routeMap.get(i.path)}"`)
    expect(drift, drift.join('\n')).toEqual([])
  })

  it('五个漂移别名全站为 0（A-04 断言 3）', () => {
    // 别名清单来自 ANNOTATIONS §13-1：backtest 屏把整套标签重写了一遍
    const aliases = ['回测分析', '探索观测', '因子工厂', '全市场选股', '数据通道']
    const hits: string[] = []
    for (const alias of aliases) {
      for (const [name, src] of [
        ['navItems.ts', navSrc],
        ['router/index.ts', routerSrc],
      ] as const) {
        // 只禁**作为标签**出现：注释里列举历史别名是正当的（正是本文件在做的事）
        for (const m of src.matchAll(/(?:label|title):\s*'([^']*)'/g)) {
          if (m[1].trim() === alias) hits.push(`${alias} ← ${name}`)
        }
      }
    }
    expect(hits, hits.join(', ')).toEqual([])
  })

  /**
   * 第三处标签：页面自己的 H1 / 卡片标题。
   *
   * 表是显式写的（不是从路由反推组件 —— 那种解析对写法敏感，一个 async import 换行就漏）。
   * 新增导航项却忘了登记 → 下面那条"每项都在表里"会红，提醒同步登记。
   *
   * ⚠️ `/backtest` 的页面标题不在 page 文件里，而在 `BacktestForm.vue` 的卡片上 ——
   * 该页没有页面级 H1。这是实测本守卫时抓到的（第一次跑就红在这一项）。
   */
  const titleFile: Record<string, string> = {
    '/': 'pages/Dashboard.vue',
    '/explore': 'pages/Explore.vue',
    // B-02：审阅台
    '/review': 'pages/ReviewDesk.vue',
    // A-13：`/evidence` 已从导航移除（A-06 降级为内嵌侧滑），路由与
    // `pages/Evidence.vue` **保留**作深链兜底，因此本表不再登记它。
    '/backtest': 'components/backtest/BacktestForm.vue',
    '/backtest/compare': 'pages/BacktestCompare.vue',
    '/walkforward': 'pages/WalkForwardBatch.vue',
    // B-04：策略库 / 编辑器 / Copilot 三页合一，页面级标题在 StrategyHub.vue；
    // 旧路径 `/strategy-builder`、`/copilot` 只是别名，不再是独立导航项。
    '/strategy-lab': 'pages/StrategyHub.vue',
    '/paper-trading': 'pages/PaperTrading.vue',
    '/factors': 'pages/FactorCitation.vue',
    '/screener': 'pages/Screener.vue',
    '/data-sync': 'pages/DataSync.vue',
    '/alerts': 'pages/Alerts.vue',
    '/compliance': 'pages/Compliance.vue',
    '/system-admin': 'pages/SystemAdmin.vue',
  }

  it('每个导航项都在页面标题文件表里登记（新增入口忘登记即红）', () => {
    const unregistered = items.filter((i) => !titleFile[i.path]).map((i) => `${i.label} → ${i.path}`)
    expect(unregistered, unregistered.join(', ')).toEqual([])
  })

  it('页面标题与侧栏标签逐字相同（第三处不得再各写一遍）', () => {
    const drift = items
      .filter((i) => titleFile[i.path])
      .filter((i) => !readFileSync(resolve(__dirname, '../../', titleFile[i.path]), 'utf8').includes(i.label))
      .map((i) => `${titleFile[i.path]} 内找不到标题 "${i.label}"`)
    expect(drift, drift.join('\n')).toEqual([])
  })

  /**
   * 第四处：首页磁贴（NavTiles）也是导航入口，此前自己又写了一遍标签
   * （'因子选股' / '策略实验室' / 'AI Copilot' —— 侧栏同一目标叫 选股与市场 / 策略库 / 策略 Copilot）。
   * 磁贴的 to 可能带 query（如 /dashboard?tab=batch），那类不在导航集合里，跳过。
   */
  it('首页磁贴标题与侧栏标签同源（同一目标不得两套叫法）', () => {
    const tilesSrc = readFileSync(resolve(__dirname, '../dashboard/NavTiles.vue'), 'utf8')
    const labelByPath = new Map(items.map((i) => [i.path, i.label]))
    const drift: string[] = []
    for (const m of tilesSrc.matchAll(/to:\s*'([^']+)'[^}]*?title:\s*'([^']+)'/g)) {
      const path = m[1].split('?')[0]
      const title = m[2]
      const navLabel = labelByPath.get(path)
      if (navLabel && navLabel !== title) drift.push(`${path}: 磁贴 "${title}" ≠ 侧栏 "${navLabel}"`)
    }
    expect(drift, drift.join('\n')).toEqual([])
  })
})
