<template>
  <NCard title="研究质量读数（PIT / 幸存者偏差）" size="small" data-testid="quality-panel">
    <NAlert v-if="error" type="error" class="quality-error" closable data-testid="quality-error">
      {{ error }}
    </NAlert>

    <div class="quality-block" data-testid="survivorship-block">
      <NText strong class="quality-title">幸存者偏差</NText>
      <div class="quality-row" data-testid="surv-total">
        <span class="quality-label">票池记录（含已退市）</span>
        <span class="quality-value">{{ poolCount === null ? '未读取' : poolCount }}</span>
      </div>
      <div class="quality-row" data-testid="surv-active">
        <span class="quality-label">在市（active）</span>
        <span class="quality-value">{{ activeCount === null ? '未读取' : activeCount }}</span>
      </div>
      <div class="quality-row" data-testid="surv-delisted">
        <span class="quality-label">退市（delisted）</span>
        <span class="quality-value">{{ delistedCount === null ? '未读取' : delistedCount }}</span>
      </div>
      <div class="quality-row" data-testid="surv-delisted-share">
        <span class="quality-label">退市占比</span>
        <span class="quality-value">{{ delistedShareText }}</span>
      </div>
      <div class="quality-gap" data-testid="surv-gap">
        <NTag type="warning" size="small">仍缺读数通道</NTag>
        <span>
          在市 / 退市两档与退市占比来自 stocks/count 的 by_status（core DATA-02，2026-10-14 落地），
          逐值等于 GROUP BY status；本页只显示后端给的读数，不拿总数减退市数在客户端反推在市数。
          仍缺的是逐只的退市日期：它在数据服务的列表接口里，网关不转发，
          所以这块只有状态两档，没有日期。
        </span>
      </div>
    </div>

    <NDivider />

    <div class="quality-block" data-testid="pit-block">
      <NText strong class="quality-title">PIT 三时刻与行情最新日</NText>
      <div class="quality-row" data-testid="pit-financial-end">
        <span class="quality-label">财务期末（report_date）</span>
        <NTag type="default" size="small">无通道</NTag>
      </div>
      <div class="quality-row" data-testid="pit-ann-date">
        <span class="quality-label">公告披露（ann_date）</span>
        <NTag type="default" size="small">无通道</NTag>
      </div>
      <div class="quality-row" data-testid="pit-tradeable">
        <span class="quality-label">因子可交易起始</span>
        <NTag type="default" size="small">无通道</NTag>
      </div>
      <div class="quality-row" data-testid="pit-latest-date">
        <span class="quality-label">行情最新日（latest_date）</span>
        <span class="quality-value">{{ latestDate === null ? '未读取' : latestDate }}</span>
      </div>
      <div class="quality-gap" data-testid="pit-gap">
        <NTag type="warning" size="small">缺口有两层</NTag>
        <span>
          这三个时刻今天仍没有通道。一是数据：逐字段财务表已建但没有摄取链路，表内 0 行（core 已知项 EQD-P1-2）。
          二是通道：给出这三个时刻的历史接口只在数据服务上，网关不转发（实测 404）——
          这是 core 工单 DATA-03 裁决后的形状：明写不对 SPA 开放，护栏已钉住，不是遗漏。
          「行情最新日」是另一回事：它有读数，走的是 DATA-03 落地的 latest_date。
        </span>
      </div>
    </div>
  </NCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { NAlert, NCard, NDivider, NTag, NText } from 'naive-ui'
import { getStockCount } from '@/api/market'
import { apiMessage } from '@/utils/apiMessage'

/**
 * PIT 与幸存者两块（A-08 断言 6）：**只显示真读到的东西**，读不到就显式空态。
 *
 * UI-01（2026-10-22）把已存在的读数接上屏（`GET /api/stocks/count`，形状见 core SPEC §1）：
 *  - `by_status`：在市 / 退市两档（DATA-02，2026-10-14 落地；逐值等于
 *    `SELECT status, COUNT(*) … GROUP BY status`，status 为 NULL 或空串的行折成 unknown 一档）。
 *    本页**只读**这两档，不拿 `count` 减退市数在客户端反推在市数 —— 那等于两处真相。
 *  - `latest_date`：行情最新日（DATA-03，2026-10-16 落地；键恒在，库里没行情时是显式 null）。
 *
 * 仍然缺的，页面要指名，不能装作有：
 *  - 逐只的退市日期（delist_date）：在数据服务的列表接口里，网关不转发 ⇒ 只有状态两档，没有日期。
 *  - PIT 三时刻（report_date / ann_date / 因子可交易起始）：历史接口明写不对 SPA 开放
 *    （DATA-03 裁决，护栏在 core 的 `cmd/analysis/deps_test.go`），且逐字段财务表 0 行
 *    （EQD-P1-2）⇒ 三行都是「无通道」。
 *
 * 口径与 A-08 / DATA-07 一致：**null 才是没有读数，0 就是 0**。缺的那一格走显式空态，
 * 不拿 '-' 冒充数据，也不在前端造数。
 */

const poolCount = ref<number | null>(null)
const activeCount = ref<number | null>(null)
const delistedCount = ref<number | null>(null)
const delistedSharePct = ref<number | null>(null)
const latestDate = ref<string | null>(null)
const error = ref('')

/**
 * 取一个后端读数：拿不到就是 null（显式空态），**不是 0**。
 *
 * 0 是读数（票池里真有 0 条退市记录，就是 0），把它折成 null 等于抹掉一个事实；
 * 反过来把缺失折成 0，就是本单要治的毛病。
 */
function reading(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

/**
 * 退市占比 = 退市数 / 票池总数。
 *
 * 分子分母都是后端给的读数（by_status.delisted 与 count），前端只做一次除法；
 * 不拿 count 减退市数去反推在市数（那是在客户端重建后端语义，两处真相）。
 * 分母为 0 或任一读数缺席 ⇒ 没有占比这回事，走显式空态。
 */
function delistedShare(total: number | null, delisted: number | null): number | null {
  if (total === null || delisted === null || total <= 0) return null
  return (delisted / total) * 100
}

const delistedShareText = computed(() =>
  delistedSharePct.value === null ? '未读取' : `${delistedSharePct.value.toFixed(1)}%`,
)

async function load() {
  error.value = ''
  poolCount.value = null
  activeCount.value = null
  delistedCount.value = null
  delistedSharePct.value = null
  latestDate.value = null
  try {
    const resp = await getStockCount()
    poolCount.value = reading(resp.count)
    activeCount.value = reading(resp.by_status?.active)
    delistedCount.value = reading(resp.by_status?.delisted)
    delistedSharePct.value = delistedShare(poolCount.value, delistedCount.value)
    latestDate.value = typeof resp.latest_date === 'string' && resp.latest_date ? resp.latest_date : null
  } catch (err) {
    error.value = apiMessage(err, '票池读数获取失败')
  }
}

onMounted(load)
</script>

<style scoped>
.quality-error {
  margin-bottom: 12px;
}

.quality-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quality-title {
  font-size: 13px;
}

.quality-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.quality-label {
  color: var(--q-text2);
  min-width: 180px;
}

.quality-value {
  font-variant-numeric: tabular-nums;
  color: var(--q-text);
}

.quality-gap {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-top: 6px;
  font-size: 12px;
  color: var(--q-text2);
  max-width: 720px;
}
</style>
