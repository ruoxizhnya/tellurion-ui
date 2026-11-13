<template>
  <n-card title="晨间简报" class="morning-briefing" data-testid="morning-briefing">
    <div class="brief-grid">
      <section class="brief-cell" data-testid="brief-pending">
        <div class="cell-title">待审阅</div>
        <div class="cell-value" data-testid="brief-pending-value">{{ pendingValue }}</div>
        <div class="cell-note" data-testid="brief-pending-note">{{ pendingNote }}</div>
        <router-link class="cell-link" :to="{ path: '/review' }">去审阅台 →</router-link>
      </section>

      <section class="brief-cell" data-testid="brief-calibration">
        <div class="cell-title">校准误差</div>
        <div class="cell-value" data-testid="brief-calibration-value">{{ calibrationValue }}</div>
        <div class="cell-note" data-testid="brief-calibration-note">{{ calibrationNote }}</div>
        <router-link class="cell-link" :to="{ path: '/review', query: { tab: 'calibration' } }">
          校准驾驶舱 →
        </router-link>
      </section>

      <section class="brief-cell" data-testid="brief-failure">
        <div class="cell-title">失败警示</div>
        <div class="cell-value" data-testid="brief-failure-value">{{ failureValue }}</div>
        <div class="cell-note" data-testid="brief-failure-note">{{ failureNote }}</div>
      </section>
    </div>

    <section class="brief-recent" data-testid="brief-recent">
      <div class="recent-head">
        最近一轮候选
        <span class="recent-sub">近似排序：高原面积 × 因果强度（不按 Sharpe）</span>
      </div>

      <p v-if="runError" class="recent-empty" data-testid="brief-recent-error">{{ runError }}</p>
      <p v-else-if="!runID" class="recent-empty" data-testid="brief-recent-empty">
        还没有探索记录，先发一轮方向。
      </p>
      <p v-else-if="recent.length === 0" class="recent-empty" data-testid="brief-recent-empty">
        最近一轮还没有尝试。
      </p>
      <div v-else class="recent-list">
        <article
          v-for="item in recent"
          :key="item.attempt.seq"
          class="recent-item"
          :data-testid="`brief-candidate-${item.attempt.seq}`"
        >
          <div class="recent-line">
            <span class="seq">#{{ item.attempt.seq }}</span>
            <span v-if="item.attempt.ok" class="prob" :data-testid="`brief-candidate-prob-${item.attempt.seq}`">
              P {{ fmtProb(item.attempt) }}
            </span>
            <span v-else class="prob muted">P —</span>
            <span class="sharpe">{{ fmtSharpe(item.attempt) }}</span>
            <span class="weakest">最弱：{{ weakestLabel(item.attempt) }}</span>
          </div>
          <p class="hypo">{{ item.attempt.hypothesis }}</p>
          <p
            v-if="!item.attempt.ok"
            class="failed"
            :data-testid="`brief-candidate-error-${item.attempt.seq}`"
          >
            失败原因：{{ item.attempt.error || '未给出原因' }}
          </p>
          <VerdictBars v-else :verdict="item.attempt.verdict ?? null" />
          <router-link
            class="recent-link"
            :to="{ path: '/review', query: { run: runID } }"
            :data-testid="`brief-open-${item.attempt.seq}`"
          >
            去审阅 →
          </router-link>
        </article>
      </div>
    </section>
  </n-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { NCard } from 'naive-ui'
import { getReviewPending, type ReviewPending } from '@/api/review'
import {
  assessedProbability,
  dimensionLabel,
  getExploreStatus,
  weakestDimension,
  type AttemptView,
  type ExploreStatus,
} from '@/api/explore'
import { getCalibration, type Calibration } from '@/api/pipeline'
import { rankAttempts } from '@/utils/review'
import VerdictBars from '@/components/review/VerdictBars.vue'

/**
 * A-15 晨间简报：控制台首屏的三节奏入口。
 *
 * 只读，不造第二份 API：待审阅走 `getReviewPending`、最近一轮走 `getExploreStatus`
 * （run_id 来自 `ql.lastRunId`，与审阅台同一个指针）、校准走 `getCalibration`；
 * 排序直接复用 B-02 的 `rankAttempts`，不在这里另排一遍。
 *
 * 三条措辞纪律：
 * - `pending === null` 是「未知」，不是 0 —— 任一源没答话就不做部分求和；
 * - 校准读面失败写「读面未接通」，不等于「没有数据」；
 * - 失败尝试只显示失败原因，不渲染裁决/概率，也不凭 `running=false` 推断成功。
 */
const LAST_RUN_KEY = 'ql.lastRunId'
const LOW_SAMPLE = 30

const pending = shallowRef<ReviewPending | null>(null)
const pendingError = ref(false)
const calibration = shallowRef<Calibration | null>(null)
const calibrationError = ref(false)
const runID = ref(localStorage.getItem(LAST_RUN_KEY) ?? '')
const run = shallowRef<ExploreStatus | null>(null)
const runError = ref('')

const pendingValue = computed(() =>
  pending.value?.pending !== null && pending.value?.pending !== undefined
    ? String(pending.value.pending)
    : '—',
)

const pendingNote = computed(() => {
  if (pendingError.value) return '读面未接通（不按 0 计）'
  const p = pending.value
  if (!p) return '读取中…'
  if (p.pending !== null) return `截至 ${p.as_of ?? '—'}`
  if (p.sources.length === 0) return '无配置源，待审阅数未知'
  const down = p.sources.filter((s) => s.status !== 'available').map((s) => s.name)
  return `不可用源：${down.join('、') || '部分源未答话'}（不做部分求和）`
})

const calibrationValue = computed(() =>
  // 空台账时后端把派生量回成 0（没有分母），照渲染就是「0.0 个百分点」的假测量。
  calibrationError.value || !calibration.value || calibration.value.sample_size === 0
    ? '—'
    : `${(calibration.value.calibration_error * 100).toFixed(1)} 个百分点`,
)

const calibrationNote = computed(() => {
  if (calibrationError.value) return '读面未接通（不按 0 计）'
  const c = calibration.value
  if (!c) return '读取中…'
  const base = `n=${c.sample_size}`
  return c.sample_size < LOW_SAMPLE ? `${base} · 样本不足，仅供参考` : base
})

const failedAttempts = computed(() => (run.value?.attempts ?? []).filter((a) => !a.ok))

const failureValue = computed(() => {
  if (runError.value || !runID.value || !run.value) return '—'
  if (run.value.stopped) return '本轮被叫停'
  return failedAttempts.value.length ? `${failedAttempts.value.length} 次尝试失败` : '无失败尝试'
})

const failureNote = computed(() => {
  if (runError.value) return '最近 run 读面未接通'
  if (!runID.value) return '还没有探索记录'
  if (!run.value) return '读取中…'
  if (run.value.stopped) return `叫停于 ${run.value.stopped}`
  if (failedAttempts.value.length) return `示例：${failedAttempts.value[0].error || '未给出原因'}`
  return `共 ${run.value.attempts.length} 次尝试`
})

const recent = computed(() => rankAttempts(run.value?.attempts ?? []).slice(0, 3))

function fmtProb(a: AttemptView): string {
  const p = assessedProbability(a.verdict)
  return p === null ? '—' : p.toFixed(2)
}

function fmtSharpe(a: AttemptView): string {
  return a.ok && Number.isFinite(a.sharpe) ? `Sharpe ${a.sharpe.toFixed(2)}` : 'Sharpe —'
}

function weakestLabel(a: AttemptView): string {
  const d = weakestDimension(a.verdict)
  return d ? dimensionLabel(d) : '—'
}

onMounted(async () => {
  try {
    pending.value = await getReviewPending()
  } catch {
    pendingError.value = true
  }
  try {
    calibration.value = await getCalibration()
  } catch {
    calibrationError.value = true
  }
  if (!runID.value) return
  try {
    run.value = await getExploreStatus(runID.value)
  } catch (e) {
    runError.value = e instanceof Error ? e.message : String(e)
  }
})
</script>

<style scoped>
.brief-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 900px) {
  .brief-grid {
    grid-template-columns: 1fr;
  }
}

.brief-cell {
  border: 1px solid var(--q-border-light);
  border-radius: var(--q-radius);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cell-title {
  font-size: 11px;
  color: var(--q-text3);
}

.cell-value {
  font-family: var(--q-mono);
  font-size: 22px;
  color: var(--q-series-1);
}

.cell-note {
  font-size: 11px;
  color: var(--q-text2);
}

.cell-link {
  font-size: 11px;
  color: var(--q-text3);
  text-decoration: none;
}

.cell-link:hover {
  color: var(--q-series-1);
}

.brief-recent {
  margin-top: 14px;
  border-top: 1px solid var(--q-border-light);
  padding-top: 10px;
}

.recent-head {
  font-size: 12px;
  color: var(--q-text2);
  margin-bottom: 8px;
}

.recent-sub {
  margin-left: 8px;
  color: var(--q-text3);
}

.recent-empty {
  margin: 0;
  font-size: 12px;
  color: var(--q-text3);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recent-item {
  border: 1px solid var(--q-border-light);
  border-radius: var(--q-radius);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.recent-line {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 11px;
}

.seq {
  font-family: var(--q-mono);
  color: var(--q-text3);
}

.prob {
  font-family: var(--q-mono);
  color: var(--q-series-1);
}

.prob.muted {
  color: var(--q-text3);
}

.sharpe,
.weakest {
  color: var(--q-text3);
}

.hypo {
  margin: 0;
  font-size: 12px;
  color: var(--q-text2);
}

.failed {
  margin: 0;
  font-size: 11px;
  color: var(--q-danger);
}

.recent-link {
  font-size: 11px;
  color: var(--q-text3);
  text-decoration: none;
}

.recent-link:hover {
  color: var(--q-series-1);
}
</style>
