import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import DataQualityPanel from './DataQualityPanel.vue'
import { ApiError } from '@/api/client'

/**
 * PIT / 幸存者两块（A-08 断言 6）的判据：**数据缺席时走显式空态**。
 *
 * 这块最容易被写成的样子是"拿总数编一个看起来像研究质量的数字"（把 5908 叫作
 * 在市股票数、或算一个退市占比出来）。所以除了"该显示什么"，更要紧的是钉住
 * **不该出现什么**：没有编造的百分比，也没有前端去请求一条网关上并不存在的端点。
 *
 * UI-01（2026-10-22）把这两条口径各改了一半，判据随之重写：
 *  - **拆分读数接上屏**（core DATA-02：`by_status`）：在市 / 退市两档与退市占比
 *    现在是后端给的读数（占比是这两个读数相除），不再是"没有只读接口"。
 *    反过来，"没有读数"的那一腿仍然要钉住：读不到就显式空态，**不编**占比。
 *  - **0 与缺失分得开**（同 A-08 / DATA-07）：0 是读数，null 才是没有读数。
 */
const market = vi.hoisted(() => ({ getStockCount: vi.fn() }))
const syncApi = vi.hoisted(() => ({ getDataSourceStatus: vi.fn(), getDataSourceHealth: vi.fn() }))

vi.mock('@/api/market', () => market)
vi.mock('@/api/sync', () => syncApi)

beforeEach(() => {
  vi.clearAllMocks()
})

async function mountPanel() {
  const w = mount(DataQualityPanel)
  await flushPromises()
  return w
}

/** core `GET /api/stocks/count` 的实测形状（DATA-02 / DATA-03）。 */
function stockCount(over: Record<string, unknown> = {}) {
  return {
    count: 5908,
    by_status: { active: 5569, delisted: 339 },
    latest_date: '2026-10-14',
    ...over,
  }
}

describe('幸存者偏差块', () => {
  it('只显示真读到的总数，且标签明写含已退市', async () => {
    market.getStockCount.mockResolvedValue(stockCount())
    const w = await mountPanel()
    expect(w.find('[data-testid="surv-total"]').text()).toContain('票池记录（含已退市）')
    expect(w.find('[data-testid="surv-total"]').text()).toContain('5908')
    expect(w.text()).not.toContain('在市股票数')
  })

  it('在市 / 退市两档与退市占比接上屏：都是后端给的读数', async () => {
    market.getStockCount.mockResolvedValue(stockCount())
    const w = await mountPanel()

    expect(w.find('[data-testid="surv-active"]').text()).toContain('5569')
    expect(w.find('[data-testid="surv-delisted"]').text()).toContain('339')
    // 占比 = 339 / 5908 = 5.74% ⇒ 屏上 5.7%
    expect(w.find('[data-testid="surv-delisted-share"]').text()).toContain('5.7%')
  })

  it('占比跟着后端读数走，不是写死的数', async () => {
    // 判据不是"屏上有一个百分比"，而是"这个百分比由这两个读数算出来"：
    // 换一组读数，占比必须跟着变（写死的数会在这里露馅）。
    market.getStockCount.mockResolvedValue(
      stockCount({ count: 100, by_status: { active: 90, delisted: 10 } }),
    )
    const w = await mountPanel()

    expect(w.find('[data-testid="surv-active"]').text()).toContain('90')
    expect(w.find('[data-testid="surv-delisted"]').text()).toContain('10')
    expect(w.find('[data-testid="surv-delisted-share"]').text()).toContain('10.0%')
  })

  it('拆分读数缺席时走显式空态：没有占比，也不拿总数反推在市数', async () => {
    // by_status 缺席（票池为空时后端序列化成 {}，旧版本更是连键都没有）：
    // 显式空态是唯一正确的表现 —— 拿总数减退市数去反推是在客户端重建后端语义。
    market.getStockCount.mockResolvedValue(stockCount({ by_status: {} }))
    const w = await mountPanel()

    expect(w.find('[data-testid="surv-active"]').text()).toContain('未读取')
    expect(w.find('[data-testid="surv-delisted"]').text()).toContain('未读取')
    expect(w.find('[data-testid="surv-delisted-share"]').text()).toContain('未读取')
    // 没有退市数就没有占比这回事：屏上一个百分比都不许出现
    expect(w.find('[data-testid="survivorship-block"]').text()).not.toMatch(/\d+(\.\d+)?\s*%/)
  })

  it('票池为空时两档是 0（读数），占比没有分母走未读取', async () => {
    // 0 是读数不是缺失：这里两档都是 0，所以显示 0；占比没有分母，是"没有这回事"。
    market.getStockCount.mockResolvedValue(
      stockCount({ count: 0, by_status: { active: 0, delisted: 0 }, latest_date: null }),
    )
    const w = await mountPanel()

    expect(w.find('[data-testid="surv-total"]').text()).toContain('0')
    expect(w.find('[data-testid="surv-active"]').text()).toContain('0')
    expect(w.find('[data-testid="surv-delisted"]').text()).toContain('0')
    expect(w.find('[data-testid="surv-delisted-share"]').text()).toContain('未读取')
  })

  it('缺口要指名：仍缺的是逐只退市日期这条通道（DATA-02 已给拆分）', async () => {
    market.getStockCount.mockResolvedValue(stockCount())
    const w = await mountPanel()
    const gap = w.find('[data-testid="surv-gap"]').text()
    expect(gap).toContain('缺读数通道')
    expect(gap).toContain('DATA-02')
    expect(gap).toContain('退市日期')
  })

  it('总数读不到时显示未读取，不用 0 顶替', async () => {
    market.getStockCount.mockRejectedValue(new ApiError(500, '服务暂时不可用，请稍后重试'))
    const w = await mountPanel()
    expect(w.find('[data-testid="surv-total"]').text()).toContain('未读取')
    expect(w.find('[data-testid="quality-error"]').text()).toBe('服务暂时不可用，请稍后重试')
  })

  it('读数读不到时拆分两格也是未读取，不拿 0 顶替', async () => {
    market.getStockCount.mockRejectedValue(new ApiError(500, '服务暂时不可用，请稍后重试'))
    const w = await mountPanel()
    expect(w.find('[data-testid="surv-active"]').text()).toContain('未读取')
    expect(w.find('[data-testid="surv-delisted"]').text()).toContain('未读取')
    expect(w.find('[data-testid="surv-delisted-share"]').text()).toContain('未读取')
  })

  it('用户可见文案里不夹 markdown（A-05/A-06 复发过的老坑，这次也在同一条上栽了）', async () => {
    market.getStockCount.mockResolvedValue(stockCount())
    const w = await mountPanel()
    const text = w.text()
    expect(text).not.toContain('**')
    expect(text).not.toMatch(/(^|\s)#[^ ]/)
    expect(text).not.toContain('__')
  })

  it('后端有原话时显示原话，不被通用文案盖掉', async () => {
    market.getStockCount.mockRejectedValue(
      new ApiError(400, '请求参数有误', { code: 'bad_request', error: 'stocks table not migrated' }),
    )
    const w = await mountPanel()
    expect(w.find('[data-testid="quality-error"]').text()).toBe('stocks table not migrated')
  })
})

describe('PIT 三时刻块', () => {
  it('三个时刻各自成行，全部标为无通道（今天没有一条能真跑）', async () => {
    market.getStockCount.mockResolvedValue(stockCount())
    const w = await mountPanel()
    expect(w.find('[data-testid="pit-financial-end"]').text()).toContain('财务期末（report_date）')
    expect(w.find('[data-testid="pit-ann-date"]').text()).toContain('公告披露（ann_date）')
    expect(w.find('[data-testid="pit-tradeable"]').text()).toContain('因子可交易起始')
    for (const testid of ['pit-financial-end', 'pit-ann-date', 'pit-tradeable']) {
      expect(w.find(`[data-testid="${testid}"]`).text()).toContain('无通道')
    }
  })

  it('行情最新日接上屏（DATA-03 的 latest_date 是真读数）', async () => {
    market.getStockCount.mockResolvedValue(stockCount())
    const w = await mountPanel()
    expect(w.find('[data-testid="pit-latest-date"]').text()).toContain('行情最新日')
    expect(w.find('[data-testid="pit-latest-date"]').text()).toContain('2026-10-14')
  })

  it('库里没有行情时 latest_date 是 null：显式空态，不显示 0 也不显示别的日期', async () => {
    market.getStockCount.mockResolvedValue(stockCount({ latest_date: null }))
    const w = await mountPanel()
    expect(w.find('[data-testid="pit-latest-date"]').text()).toContain('未读取')
  })

  it('缺口分两层写清：数据没摄取（EQD-P1-2）与通道没转发（DATA-03），并各留实测形状', async () => {
    market.getStockCount.mockResolvedValue(stockCount({ count: 1 }))
    const w = await mountPanel()
    const gap = w.find('[data-testid="pit-gap"]').text()
    expect(gap).toContain('EQD-P1-2')
    expect(gap).toContain('DATA-03')
    expect(gap).toContain('0 行')
  })

  it('不请求网关上并不存在的历史端点（前端不新增后端没有的假设）', async () => {
    market.getStockCount.mockResolvedValue(stockCount())
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await mountPanel()
    await flushPromises()
    const urls = fetchMock.mock.calls.map((c) => String(c[0]))
    expect(urls.some((u) => u.includes('fundamentals'))).toBe(false)
    expect(urls.every((u) => u.includes('stocks/count'))).toBe(true)
    vi.unstubAllGlobals()
  })
})
