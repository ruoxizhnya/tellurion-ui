<template>
  <div class="intervention-bar" data-testid="intervention-bar">
    <span class="bar-label">人的三只手</span>
    <n-tooltip trigger="hover">
      <template #trigger>
        <n-button
          size="tiny"
          secondary
          data-testid="intervene-direction"
          :disabled="!enabled"
          @click="openSteer"
        >
          指方向
        </n-button>
      </template>
      {{ enabled ? 'G2：把约束注入后续尝试（已跑完的不追溯改写）' : reasonText }}
    </n-tooltip>
    <n-tooltip trigger="hover">
      <template #trigger>
        <n-button
          size="tiny"
          secondary
          data-testid="intervene-followup"
          :disabled="!enabled"
          @click="openAsk"
        >
          追问
        </n-button>
      </template>
      {{ enabled ? 'G3：只从这次尝试自身的证据回答' : reasonText }}
    </n-tooltip>
    <n-tooltip trigger="hover">
      <template #trigger>
        <n-button
          size="tiny"
          secondary
          data-testid="intervene-mark"
          :disabled="!enabled"
          @click="openMark"
        >
          标记
        </n-button>
      </template>
      {{ enabled ? 'G4：流水标注（derive / promote），不参与校准' : reasonText }}
    </n-tooltip>

    <!-- G2 指方向 -->
    <n-modal v-model:show="steerOpen" :mask-closable="false">
      <n-card
        style="width: 520px"
        title="指方向"
        :bordered="false"
        data-testid="intervene-dialog"
      >
        <n-space vertical>
          <n-text depth="3" style="font-size: 12px">
            方向只作用于**后续**尝试，已跑完的 #{{ seq }} 不会被追溯改写。
          </n-text>
          <n-input
            v-model:value="direction"
            type="textarea"
            :rows="3"
            maxlength="1000"
            show-count
            data-testid="intervene-input"
            placeholder="例如：把回看窗口限制在 20–60 日，别再试日内参数"
          />
          <n-alert v-if="actionError" type="error" data-testid="intervene-error">
            {{ actionError }}
          </n-alert>
        </n-space>
        <template #footer>
          <n-space justify="end">
            <n-button size="small" @click="steerOpen = false">取消</n-button>
            <n-button
              size="small"
              type="primary"
              :loading="submitting"
              :disabled="!direction.trim()"
              data-testid="intervene-submit"
              @click="submitSteer"
            >
              提交方向
            </n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>

    <!-- G3 追问 -->
    <n-modal v-model:show="askOpen" :mask-closable="false">
      <n-card
        style="width: 560px"
        title="追问这次尝试"
        :bordered="false"
        data-testid="intervene-dialog"
      >
        <n-space vertical>
          <n-input
            v-model:value="question"
            maxlength="500"
            show-count
            data-testid="intervene-input"
            placeholder="例如：为什么这次被判定为过拟合？"
          />
          <n-alert v-if="actionError" type="error" data-testid="intervene-error">
            {{ actionError }}
          </n-alert>
          <n-alert v-if="answer" type="default" data-testid="intervene-answer">
            <n-space vertical>
              <n-text>{{ answer.answer }}</n-text>
              <n-text depth="3" style="font-size: 11px">
                来源：{{ answer.source }}（只拼该次尝试自身的证据，不额外调模型）
              </n-text>
            </n-space>
          </n-alert>
        </n-space>
        <template #footer>
          <n-space justify="end">
            <n-button size="small" @click="askOpen = false">关闭</n-button>
            <n-button
              size="small"
              type="primary"
              :loading="submitting"
              :disabled="!question.trim()"
              data-testid="intervene-submit"
              @click="submitAsk"
            >
              提问
            </n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>

    <!-- G4 标记 -->
    <n-modal v-model:show="markOpen" :mask-closable="false">
      <n-card style="width: 480px" title="标记" :bordered="false" data-testid="intervene-dialog">
        <n-space vertical>
          <n-select
            v-model:value="markKind"
            :options="markOptions"
            data-testid="intervene-kind"
          />
          <n-input
            v-model:value="markNote"
            type="textarea"
            :rows="2"
            maxlength="2000"
            show-count
            data-testid="intervene-note"
            placeholder="备注（可选）"
          />
          <n-alert v-if="actionError" type="error" data-testid="intervene-error">
            {{ actionError }}
          </n-alert>
        </n-space>
        <template #footer>
          <n-space justify="end">
            <n-button size="small" @click="markOpen = false">取消</n-button>
            <n-button
              size="small"
              type="primary"
              :loading="submitting"
              data-testid="intervene-submit"
              @click="submitMark"
            >
              记一笔
            </n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  NAlert,
  NButton,
  NCard,
  NInput,
  NModal,
  NSelect,
  NSpace,
  NText,
  NTooltip,
  useMessage,
} from 'naive-ui'
import { askAttempt, markAttempt, steerRun, type AttemptAnswer, type MarkKind } from '@/api/explore'
import { ApiError } from '@/api/client'

/**
 * B-06：人的三只手（G2 指方向 / G3 追问 / G4 标记）。
 *
 * agent 侧三个写面已落地，经 core `/api/explore/*` 反代到达 UI；缺的从来不是端点，
 * 而是"run 必须还在运行态里"这个前提 —— 所以按钮可不可用由 `runId`/`seq` 与
 * `running` 共同决定，并且**不可用时也保留同样的 DOM**，只改 disabled 与 tooltip，
 * 免得两套结构各写一遍再漂移。
 */
const props = withDefaults(
  defineProps<{
    /** 注意：必须写 `runId`，kebab 传参 `:run-id` 会被 camelize 成 runId（不是 runID） */
    runId: string
    /** 该次尝试的 seq；指方向时作为来源坐标，追问/标记时作为目标 */
    seq: number | null
    /** 运行态：已结束的 run 接受不了新方向（steer 会 409） */
    running?: boolean
    /** 不可用原因（例如"还没有运行中的探索"） */
    reason?: string
  }>(),
  { running: true, reason: '需要一个正在运行的探索（指方向只作用于后续尝试）' },
)

const emit = defineEmits<{ changed: [] }>()
const message = useMessage()

const enabled = computed(() => !!props.runId && props.seq !== null && props.seq >= 0 && props.running)
const reasonText = computed(() => (props.running ? props.reason : '探索已结束：方向不会有下一次尝试可作用'))

const steerOpen = ref(false)
const askOpen = ref(false)
const markOpen = ref(false)
const submitting = ref(false)
const actionError = ref('')

const direction = ref('')
const question = ref('')
const answer = ref<AttemptAnswer | null>(null)
const markKind = ref<MarkKind>('derive')
const markNote = ref('')

const markOptions = [
  { label: 'derive（派生子 run）', value: 'derive' },
  { label: 'promote（提升权重）', value: 'promote' },
]

function reset() {
  actionError.value = ''
}

function openSteer() {
  reset()
  direction.value = ''
  steerOpen.value = true
}

function openAsk() {
  reset()
  question.value = ''
  answer.value = null
  askOpen.value = true
}

function openMark() {
  reset()
  markKind.value = 'derive'
  markNote.value = ''
  markOpen.value = true
}

function describe(e: unknown): string {
  if (e instanceof ApiError && e.status === 409) {
    return '运行已结束（409）：方向不会有下一次尝试可作用 —— 已跑完的尝试不接受追溯改写。'
  }
  return e instanceof Error ? e.message : String(e)
}

async function submitSteer() {
  submitting.value = true
  reset()
  try {
    await steerRun(props.runId, { direction: direction.value.trim(), attempt_seq: props.seq ?? undefined })
    steerOpen.value = false
    message.success('方向已注入后续尝试')
    emit('changed')
  } catch (e) {
    actionError.value = describe(e)
  } finally {
    submitting.value = false
  }
}

async function submitAsk() {
  submitting.value = true
  reset()
  try {
    answer.value = await askAttempt(props.runId, props.seq ?? 0, question.value.trim())
  } catch (e) {
    actionError.value = describe(e)
  } finally {
    submitting.value = false
  }
}

async function submitMark() {
  submitting.value = true
  reset()
  try {
    await markAttempt(props.runId, props.seq ?? 0, {
      kind: markKind.value,
      note: markNote.value.trim() || undefined,
    })
    markOpen.value = false
    message.success('已记录标记')
    emit('changed')
  } catch (e) {
    actionError.value = describe(e)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.intervention-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.bar-label {
  font-size: 11px;
  color: var(--q-text3);
}
</style>
