<template>
  <section class="calibration-panel" data-testid="calibration-panel">
    <n-spin :show="loading">
      <n-alert v-if="error" type="error" class="block" data-testid="cal-error">{{ error }}</n-alert>

      <template v-else-if="data">
        <n-card size="small" title="校准（声称把握 vs 实际命中）" class="block">
          <template #header-extra>
            <n-tag v-if="lowSample" type="warning" size="small" data-testid="cal-low-sample">
              样本不足（n={{ data.sample_size }} &lt; {{ CALIBRATION_MIN_SAMPLE }}），仅供参考
            </n-tag>
          </template>

          <div class="stat-row">
            <div class="stat">
              <div class="stat-label">样本量</div>
              <div class="stat-value" data-testid="cal-sample-size">{{ data.sample_size }}</div>
            </div>
            <div class="stat">
              <div class="stat-label">实际命中率</div>
              <div class="stat-value" data-testid="cal-hit-rate">{{ pct(data.hit_rate) }}</div>
            </div>
            <div class="stat">
              <div class="stat-label">平均声称概率</div>
              <div class="stat-value" data-testid="cal-claimed-rate">{{ pct(data.claimed_rate) }}</div>
            </div>
            <div class="stat">
              <div class="stat-label">校准误差</div>
              <div class="stat-value" data-testid="cal-cal-error">{{ points(data.calibration_error) }}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Brier 分数</div>
              <div class="stat-value" data-testid="cal-brier">{{ decimal(data.brier_score) }}</div>
            </div>
          </div>

          <n-text depth="3" class="line" data-testid="cal-pending">
            <template v-if="pending === null">待回填：—</template>
            <template v-else>
              已回填 {{ data.sample_size }} 条计入命中率 · 待回填 {{ pending }} 条不计入
            </template>
          </n-text>
          <n-text depth="3" class="line" data-testid="cal-holdout">
            <template v-if="holdoutSummary">holdout：{{ holdoutSummary }}</template>
            <template v-else>holdout：—</template>
          </n-text>

          <div v-if="!hasBins" class="chart-placeholder" data-testid="cal-no-bins">
            还没有已回填的条目，暂时画不出校准曲线（待回填条目不计入命中率）。
          </div>
          <template v-else>
            <div class="chart-wrap">
              <canvas ref="canvasEl" data-testid="cal-chart" height="260"></canvas>
            </div>

            <table class="bins" data-testid="cal-bins">
              <thead>
                <tr>
                  <th>声称区间</th>
                  <th>已回填 n</th>
                  <th>平均声称</th>
                  <th>实际命中率</th>
                  <th>待回填</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="bin in mainBins" :key="`main-${bin.label}`">
                  <td>{{ bin.label }}</td>
                  <td>{{ bin.n }}</td>
                  <td>{{ bin.claimedRate === null ? '—' : pct(bin.claimedRate) }}</td>
                  <td>{{ bin.hitRate === null ? '—' : pct(bin.hitRate) }}</td>
                  <td>{{ bin.pending }}</td>
                </tr>
                <tr v-for="bin in holdoutBins" :key="`holdout-${bin.label}`" class="holdout-row">
                  <td>{{ bin.label }}（holdout）</td>
                  <td>{{ bin.n }}</td>
                  <td>{{ bin.claimedRate === null ? '—' : pct(bin.claimedRate) }}</td>
                  <td>{{ bin.hitRate === null ? '—' : pct(bin.hitRate) }}</td>
                  <td>{{ bin.pending }}</td>
                </tr>
              </tbody>
            </table>
          </template>
        </n-card>

        <n-card size="small" title="采纳记录" class="block">
          <n-empty
            v-if="entries.length === 0"
            description="还没有采纳记录：在「候选排序」里做一次采纳裁决后，这里会按声称把握与实际命中回填。"
            data-testid="cal-empty"
          />
          <table v-else class="entries" data-testid="cal-entries">
            <thead>
              <tr>
                <th>提案</th>
                <th>声称把握</th>
                <th>结果</th>
                <th>holdout</th>
                <th>记录时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in entries" :key="entry.proposal_id">
                <td class="mono">{{ entry.proposal_id }}</td>
                <td>{{ pct(entry.claimed_confidence) }}</td>
                <td>
                  <n-tag
                    v-if="entry.outcome_hit === null"
                    size="small"
                    :bordered="false"
                    data-testid="cal-result-pending"
                  >
                    待回填
                  </n-tag>
                  <n-tag
                    v-else
                    size="small"
                    :bordered="false"
                    :type="entry.outcome_hit ? 'success' : 'error'"
                  >
                    {{ entry.outcome_hit ? '命中' : '未命中' }}
                  </n-tag>
                </td>
                <td>{{ entry.is_holdout ? '是' : '否' }}</td>
                <td class="mono">{{ entry.created_at }}</td>
              </tr>
            </tbody>
          </table>
        </n-card>
      </template>
    </n-spin>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { NAlert, NCard, NEmpty, NSpin, NTag, NText } from 'naive-ui'
import { Chart, registerables } from 'chart.js'
import { getCalibration, type Calibration, type CalibrationEntry } from '@/api/pipeline'
import { ApiError } from '@/api/client'
import { binCalibration, CALIBRATION_MIN_SAMPLE, splitHoldout } from '@/utils/calibration'
import { chartPalette } from '@/styles/palette'

Chart.register(...registerables)

/**
 * A-12 校准驾驶舱。
 *
 * 第三档（审阅台）的第二 tab：回答「我们声称的把握兑现了吗」。
 * - 汇总读数**照抄** `/api/pipeline/calibration`，前端只做展示与分箱；
 * - 待回填（`outcome_hit === null`）不进命中率分母，单独计数；
 * - holdout 单独分箱、单独成列，不与主样本混算；
 * - 样本 < 30 必须显式说「样本不足」，不用百分比包装小样本。
 */
const data = ref<Calibration | null>(null)
const loading = ref(false)
const error = ref('')

const canvasEl = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const entries = computed<CalibrationEntry[]>(() => data.value?.entries ?? [])
const split = computed(() => splitHoldout(entries.value))
const mainBins = computed(() => binCalibration(split.value.main))
const holdoutBins = computed(() => binCalibration(split.value.holdout))
const hasBins = computed(() => mainBins.value.length > 0 || holdoutBins.value.length > 0)
const lowSample = computed(() => (data.value?.sample_size ?? 0) < CALIBRATION_MIN_SAMPLE)

function pct(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return `${(value * 100).toFixed(1)}%`
}

function points(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return `${(value * 100).toFixed(1)} 个百分点`
}

function decimal(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return value.toFixed(3)
}

const pending = computed(() => {
  if (!data.value) return null
  const value = data.value.pending
  return value === null || value === undefined || !Number.isFinite(value) ? null : value
})

const holdoutSummary = computed(() => {
  const holdout = data.value?.holdout
  if (!holdout || !holdout.sample_size) return ''
  return `${holdout.sample_size} 条 · 命中率 ${pct(holdout.hit_rate)}`
})

function describe(e: unknown): string {
  if (e instanceof ApiError && e.status === 503) return '校准数据未接入（503），当前没有可看的采纳记录。'
  return e instanceof Error ? e.message : String(e)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    data.value = await getCalibration()
  } catch (e) {
    data.value = null
    error.value = describe(e)
  } finally {
    loading.value = false
  }
}

function destroyChart() {
  chart?.destroy()
  chart = null
}

function canvasContext(): CanvasRenderingContext2D | null {
  try {
    return canvasEl.value?.getContext?.('2d') ?? null
  } catch {
    return null
  }
}

function renderChart() {
  destroyChart()
  // happy-dom / 无 canvas 环境拿不到 2d 上下文：跳过绘图，读数与表格照常显示。
  const ctx = canvasContext()
  if (!ctx) return

  const point = (
    bins: typeof mainBins.value,
  ): { x: number; y: number; n?: number; label?: string }[] =>
    bins
      .filter((bin) => bin.n > 0 && bin.hitRate !== null && bin.claimedRate !== null)
      .map((bin) => ({ x: bin.claimedRate as number, y: bin.hitRate as number, n: bin.n, label: bin.label }))

  chart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: '主样本',
          data: point(mainBins.value),
          borderColor: chartPalette.seriesPrimary,
          backgroundColor: chartPalette.seriesPrimary,
          showLine: true,
          tension: 0,
          pointRadius: 4,
        },
        {
          label: 'holdout',
          data: point(holdoutBins.value),
          borderColor: chartPalette.seriesCycle[1],
          backgroundColor: chartPalette.seriesCycle[1],
          showLine: true,
          tension: 0,
          pointRadius: 4,
          pointStyle: 'rectRot',
        },
        {
          label: '完美校准',
          type: 'line',
          data: [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
          ],
          borderColor: chartPalette.grid,
          backgroundColor: 'transparent',
          borderDash: [4, 4],
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: chartPalette.legend, boxWidth: 12, boxHeight: 12 } },
        tooltip: {
          callbacks: {
            label: (item) => {
              const raw = item.raw as { x: number; y: number; n?: number; label?: string }
              if (raw.n === undefined) return '完美校准'
              return `${raw.label}：声称 ${(raw.x * 100).toFixed(1)}% · 命中 ${(raw.y * 100).toFixed(1)}%（n=${raw.n}）`
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: '平均声称置信度', color: chartPalette.axisTitle },
          min: 0,
          max: 1,
          grid: { color: chartPalette.grid },
          ticks: { color: chartPalette.tick },
        },
        y: {
          title: { display: true, text: '实际命中率', color: chartPalette.axisTitle },
          min: 0,
          max: 1,
          grid: { color: chartPalette.grid },
          ticks: { color: chartPalette.tick },
        },
      },
    },
  })
}

watch([mainBins, holdoutBins], async () => {
  await nextTick()
  renderChart()
})

onMounted(() => {
  void load().then(() => nextTick().then(renderChart))
})

onBeforeUnmount(destroyChart)
</script>

<style scoped>
.calibration-panel { display: block; }
.block { margin-bottom: 12px; }
.stat-row { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 8px; }
.stat-label { font-size: 11px; color: var(--q-text3); }
.stat-value { font-size: 20px; font-weight: 600; font-variant-numeric: tabular-nums; }
.line { display: block; font-size: 12px; margin-top: 4px; }
.chart-wrap { height: 260px; margin: 12px 0; }
.chart-placeholder { font-size: 12px; color: var(--q-text3); padding: 16px 0; }
.bins, .entries { width: 100%; border-collapse: collapse; font-size: 12px; }
.bins th, .entries th {
  text-align: left;
  color: var(--q-text3);
  font-weight: 500;
  border-bottom: 1px solid var(--q-border-light);
  padding: 6px 8px;
}
.bins td, .entries td { padding: 6px 8px; border-bottom: 1px solid var(--q-border-light); }
.holdout-row td { font-style: italic; }
.mono { font-family: var(--q-mono); }
</style>
