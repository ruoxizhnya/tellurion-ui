<template>
  <div class="review-desk" data-testid="review-desk">
    <n-page-header title="审阅台" subtitle="按平台宽度与因果强度排序候选，并对每次尝试做采纳裁决（B-02）" />

    <n-alert type="warning" :bordered="true" class="approx-banner" data-testid="approx-banner">
      近似聚合：core 的 G1 摘要读面尚未提供「平台面积 / 因果强度」这类派生量，本页按
      <code>attempts</code> + <code>verdict</code> 在前端现算。排序不是后端权威值，
      同一批尝试换个口径可能换名次。
    </n-alert>

    <n-card size="small" class="controls">
      <n-space align="center" :wrap="true">
        <n-input
          v-model:value="runID"
          placeholder="探索 run_id（默认取最近一次开始探索的运行）"
          style="width: 380px"
          data-testid="review-run-input"
        />
        <n-button :loading="loading" data-testid="review-load" @click="load">加载</n-button>
        <n-tag v-if="status" :type="status.running ? 'info' : 'success'" size="small">
          {{ status.running ? '进行中' : '已结束' }} · {{ attempts.length }} 次尝试
        </n-tag>
      </n-space>
    </n-card>

    <n-alert v-if="error" type="error" class="error" data-testid="review-error">{{ error }}</n-alert>

    <n-empty v-if="!ranked.length && !error" description="还没有可审阅的尝试" class="empty" />

    <div v-else-if="ranked.length" class="ranked-list" data-testid="ranked-list">
      <n-card
        v-for="(row, index) in ranked"
        :key="row.attempt.seq"
        size="small"
        class="ranked-card"
        :data-testid="`ranked-item-${row.attempt.seq}`"
      >
        <template #header>
          <n-space align="center" :size="8">
            <n-tag :type="index === 0 ? 'success' : 'default'" size="small">#{{ index + 1 }}</n-tag>
            <span>第 {{ row.attempt.seq }} 次</span>
            <n-tag :type="row.attempt.ok ? 'success' : 'error'" size="small" :bordered="false">
              {{ row.attempt.ok ? `Sharpe ${row.attempt.sharpe.toFixed(2)}` : '失败' }}
            </n-tag>
            <n-tag v-if="probability(row.attempt) !== null" size="small" :bordered="false">
              P {{ probability(row.attempt)?.toFixed(2) }} · 最弱 {{ weakestLabel(row.attempt) }}
            </n-tag>
          </n-space>
        </template>

        <template #header-extra>
          <n-button
            size="tiny"
            secondary
            type="primary"
            :data-testid="`adopt-button-${row.attempt.seq}`"
            @click="openAdopt(row.attempt)"
          >
            采纳裁决
          </n-button>
        </template>

        <n-space :vertical="true" :size="6">
          <n-text depth="2" style="font-size: 12px">{{ row.attempt.hypothesis }}</n-text>
          <n-text depth="3" style="font-size: 11px">{{ fmtParams(row.attempt.params) }}</n-text>
          <n-space :size="12">
            <n-text depth="3" style="font-size: 11px">平台面积 {{ row.plateau }}</n-text>
            <n-text depth="3" style="font-size: 11px">因果强度 {{ row.causal.toFixed(2) }}</n-text>
            <n-text depth="3" style="font-size: 11px">综合分 {{ row.score.toFixed(2) }}</n-text>
          </n-space>
          <n-space v-if="challengesOf(row.attempt).length" :vertical="true" :size="2">
            <n-text
              v-for="(c, i) in challengesOf(row.attempt)"
              :key="`${c.dimension}-${i}`"
              :type="c.severity === 'blocking' ? 'error' : c.severity === 'warning' ? 'warning' : 'default'"
              style="font-size: 11px"
            >
              [{{ severityLabel(c.severity) }}] {{ dimensionLabel(c.dimension) }}：{{ c.message }}
            </n-text>
          </n-space>
          <InterventionBar
            :run-id="runID"
            :seq="row.attempt.seq"
            :running="status?.running ?? false"
            @changed="load"
          />
        </n-space>
      </n-card>
    </div>

    <!-- 采纳裁决：理由 + 概率快照缺一不可（台账要求可回溯"当时声称多少把握"） -->
    <n-modal v-model:show="adoptOpen" :mask-closable="false">
      <n-card style="width: 520px" title="采纳裁决" :bordered="false" data-testid="adopt-modal">
        <n-space vertical>
          <n-descriptions :column="1" size="small" bordered>
            <n-descriptions-item label="提案">
              {{ adoptTarget?.seq }} · {{ adoptTarget?.hypothesis }}
            </n-descriptions-item>
            <n-descriptions-item label="概率快照">
              <span data-testid="adopt-prob">{{ snapshot }}</span>
            </n-descriptions-item>
            <n-descriptions-item label="结果坐标">
              {{ adoptTarget ? `exp:${adoptTarget.experiment_id}` : '—' }}
            </n-descriptions-item>
          </n-descriptions>
          <n-input
            v-model:value="adoptReason"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-count
            data-testid="adopt-reason"
            placeholder="为什么采纳（必填；这条理由会随裁决进台账）"
          />
          <n-alert v-if="adoptError" type="error" data-testid="adopt-error">{{ adoptError }}</n-alert>
        </n-space>
        <template #footer>
          <n-space justify="end">
            <n-button size="small" @click="adoptOpen = false">取消</n-button>
            <n-button
              size="small"
              type="primary"
              :loading="submitting"
              :disabled="!adoptReason.trim() || snapshot === '—'"
              data-testid="adopt-submit"
              @click="submitAdopt"
            >
              写入台账
            </n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  NAlert,
  NButton,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NEmpty,
  NInput,
  NModal,
  NPageHeader,
  NSpace,
  NTag,
  NText,
  useMessage,
} from 'naive-ui'
import {
  assessedProbability,
  dimensionLabel,
  getExploreStatus,
  orderAttemptsBySeq,
  weakestDimension,
  type AttemptView,
  type Challenge,
  type ExploreStatus,
} from '@/api/explore'
import { recordAdoption } from '@/api/pipeline'
import { ApiError } from '@/api/client'
import InterventionBar from '@/components/review/InterventionBar.vue'
import { rankAttempts } from '@/utils/review'

/**
 * B-02 审阅台。
 *
 * 排序口径见 `utils/review.ts`（近似），页面顶部必须把「近似」写出来。
 * 采纳动作写 `ai.adoption_ledger`：`proposal_id` 是幂等键（重复 → 409），
 * 理由与概率快照都是台账可回溯的承重字段，缺一个就不让提交。
 */
const LAST_RUN_KEY = 'ql.lastRunId'

const message = useMessage()
const runID = ref(localStorage.getItem(LAST_RUN_KEY) ?? '')
const status = ref<ExploreStatus | null>(null)
const loading = ref(false)
const error = ref('')

const attempts = computed<AttemptView[]>(() =>
  orderAttemptsBySeq(status.value?.attempts ?? []),
)
const ranked = computed(() => rankAttempts(attempts.value))

const adoptOpen = ref(false)
const adoptTarget = ref<AttemptView | null>(null)
const adoptReason = ref('')
const adoptError = ref('')
const submitting = ref(false)

const snapshot = computed(() => {
  const p = adoptTarget.value ? assessedProbability(adoptTarget.value.verdict) : null
  return p === null ? '—' : p.toFixed(3)
})

function describe(e: unknown): string {
  if (e instanceof ApiError && e.status === 409) return '该提案已裁决过（409）：决策不可回写。'
  if (e instanceof ApiError && e.status === 503) return '采纳台账未接入（503），本次裁决未记录。'
  return e instanceof Error ? e.message : String(e)
}

async function load() {
  const id = runID.value.trim()
  if (!id) {
    error.value = '先填一个 run_id（开始一次探索后会自动记住）'
    return
  }
  loading.value = true
  error.value = ''
  try {
    status.value = await getExploreStatus(id)
    localStorage.setItem(LAST_RUN_KEY, id)
  } catch (e) {
    status.value = null
    error.value = describe(e)
  } finally {
    loading.value = false
  }
}

function probability(a: AttemptView): number | null {
  return assessedProbability(a.verdict)
}

function weakestLabel(a: AttemptView): string {
  const d = weakestDimension(a.verdict)
  return d ? dimensionLabel(d) : '—'
}

function challengesOf(a: AttemptView): Challenge[] {
  return a.verdict?.challenges ?? []
}

function severityLabel(s: Challenge['severity']): string {
  return s === 'blocking' ? '阻断' : s === 'warning' ? '警告' : '提示'
}

function fmtParams(p: Record<string, unknown>): string {
  return Object.entries(p)
    .map(([k, v]) => `${k}=${v}`)
    .join('  ')
}

function openAdopt(a: AttemptView) {
  adoptTarget.value = a
  adoptReason.value = ''
  adoptError.value = ''
  adoptOpen.value = true
}

async function submitAdopt() {
  const a = adoptTarget.value
  const p = a ? assessedProbability(a.verdict) : null
  if (!a || p === null) {
    adoptError.value = '这次尝试没有裁决概率，无法记录"当时声称多少把握"。'
    return
  }
  submitting.value = true
  adoptError.value = ''
  try {
    await recordAdoption({
      proposal_id: `${runID.value.trim()}:${a.seq}`,
      actor: localStorage.getItem('ql.actor') ?? 'local',
      intervention: adoptReason.value.trim(),
      adopted: true,
      claimed_confidence: p,
      result_ref: `exp:${a.experiment_id}`,
    })
    adoptOpen.value = false
    message.success('裁决已写入台账')
  } catch (e) {
    adoptError.value = describe(e)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (runID.value) void load()
})
</script>

<style scoped>
.review-desk { padding: 24px; max-width: 1100px; margin: 0 auto; }
.approx-banner { margin: 16px 0; }
.controls { margin-bottom: 16px; }
.error { margin-bottom: 16px; }
.empty { margin-top: 32px; }
.ranked-list { display: flex; flex-direction: column; gap: 12px; }
</style>
