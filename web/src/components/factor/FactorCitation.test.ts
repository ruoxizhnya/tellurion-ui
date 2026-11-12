// FactorCitation.test.ts — 能力退役后的说明页（UI-FACTOR-CITATION-RETIRED）
//
// 产品裁决（2026-11-12）：保留 `/factors` 入口，内容换成退役说明。判据三条：
//   1. 说清「按 ADR-037 退役、因子值由 core 按需求值」并给 ADR 落点；
//   2. 不再有查询入口 —— 没有输入框、没有「查询」按钮，也没有任何 `/api/factors` 请求；
//   3. 不展示任何因子数值（退役后前端没有合法来源，显示一个就是伪造）。
//
// 旧的「五元组表格 / 未归档旗标 / 未命中 / 抽屉就地打开」几组断言随能力一起退役，
// 它们守的对象（factor_cache 读面）已不存在；证据三态机本身仍由
// EvidenceProbe.test.ts（11 例）与 evidence-probe.spec.ts 的真栈用例守着。

import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FactorCitation from './FactorCitation.vue'

describe('FactorCitation — 退役说明', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('写明「已按 ADR-037 退役、因子值由 core 按需求值」并给出 ADR 落点', () => {
    const w = mount(FactorCitation)
    const notice = w.get('[data-testid="factor-retired-notice"]')

    expect(notice.text()).toContain('该能力已按 ADR-037 退役')
    expect(notice.text()).toContain('因子值由 core 按需求值')
    expect(w.text()).toContain('ADR-037')
    expect(w.text()).toContain('tellurion-docs:docs/adr/adr-037-factor-value-ownership.md')
  })

  it('给出机器码与状态，读者能对上 core 的 410 回答', () => {
    const w = mount(FactorCitation)

    expect(w.text()).toContain('factor_http_surface_retired')
    expect(w.text()).toContain('410')
    expect(w.text()).toContain('GET /api/factors/:factor_name')
  })

  it('不再提供查询入口：没有输入框，也没有「查询」按钮', () => {
    const w = mount(FactorCitation)

    expect(w.findAll('input')).toHaveLength(0)
    expect(w.findAll('button').some((b) => b.text().includes('查询'))).toBe(false)
  })

  it('挂载即不发任何 /api/factors 请求（退役后仍去撞 410 就是没退役干净）', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'))
    mount(FactorCitation)

    const urls = fetchSpy.mock.calls.map((c) => String(c[0]))
    expect(urls.filter((u) => u.includes('/api/factors'))).toEqual([])
  })

  it('不再展示任何因子数值或 z-score / 百分位字段', () => {
    const w = mount(FactorCitation)

    expect(w.text()).not.toContain('z-score')
    expect(w.text()).not.toContain('百分位')
    expect(w.text()).not.toContain('原始值')
  })

  it('保留可回溯路径的落点：证据页深链与回测质问入口', () => {
    const w = mount(FactorCitation)

    expect(w.text()).toContain('/evidence?content_hash=')
  })
})
