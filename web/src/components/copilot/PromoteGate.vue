<template>
  <div class="promote-gate" data-testid="promote-gate">
    <div class="promote-row">
      <span class="promote-target">
        坐标：<code>{{ target.strategyId }}</code> / <code>{{ target.versionHash }}</code>
      </span>
    </div>

    <p class="promote-explain">
      放行 = 你以本人身份对这个版本背书，审计里会记下「谁放的行」。
      这一步不会用系统/机器身份代签，也不由别人代你决定。
    </p>

    <template v-if="!confirming">
      <NButton
        type="primary"
        size="small"
        data-testid="promote-btn"
        :disabled="!canPromote || submitting || done"
        :loading="submitting"
        @click="confirming = true"
      >
        放行这个版本
      </NButton>
    </template>
    <template v-else>
      <NSpace align="center">
        <NButton
          type="primary"
          size="small"
          data-testid="promote-confirm"
          :loading="submitting"
          @click="doPromote"
        >
          确认以 {{ actorName }} 身份放行
        </NButton>
        <NButton size="small" quaternary data-testid="promote-cancel" @click="confirming = false">
          取消
        </NButton>
      </NSpace>
    </template>

    <p v-if="!canPromote" class="promote-denied" data-testid="promote-denied">{{ deniedText }}</p>

    <NAlert
      v-if="result"
      class="promote-result"
      :type="result.ok ? 'success' : 'error'"
      :data-testid="result.ok ? 'promote-success' : 'promote-error'"
    >
      {{ result.text }}
    </NAlert>
  </div>
</template>

<script setup lang="ts">
// promote 人工闸门（UI-COPILOT-GATE-SURFACE a 腿）。
//
// 身份模型（2026-11-12 裁决，写在这里防回退）：人 promote 走**登录者自己的 JWT**，
// 不用 service token、不做 admin 代调。promote 是人对某个版本背书，责任人必须能
// 落回具体用户；service token 会把人的决定洗成系统行为，审计链断掉；admin 代调
// 则把责任从决策人身上挪走。角色门槛沿用后端既有分级（admin / trader），不新增角色。
//
// 本组件**不伪造成功**：后端还没开通这条反代（core 目前没有 /api/strategies/...
// /promote 路由）时，会如实显示 404 与「网关可能还没开通」，而不是把按钮点成绿的。
import { computed, ref } from 'vue'
import { NAlert, NButton, NSpace } from 'naive-ui'
import { ApiError } from '@/api/client'
import { promoteStrategyVersion, type PromoteTarget } from '@/api/strategy'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ target: PromoteTarget }>()

const auth = useAuthStore()

const submitting = ref(false)
const confirming = ref(false)
const done = ref(false)
const result = ref<{ ok: boolean; text: string } | null>(null)

const actorName = computed(() => auth.username || '')
/** 后端既有分级：admin 与 trader 可以放行；其它角色（含 viewer）只读。 */
const canPromote = computed(
  () => !!actorName.value && (auth.role === 'admin' || auth.role === 'trader'),
)

const deniedText = computed(() => {
  if (!actorName.value) return '需要登录：放行用的是你本人的身份，不能由系统代签。'
  return `当前角色 ${auth.role ?? '未知'} 没有放行权限（需要 admin 或 trader）。`
})

function describeError(err: unknown): string {
  if (!(err instanceof ApiError)) {
    return `放行失败：${err instanceof Error ? err.message : String(err)}`
  }
  switch (err.status) {
    case 401:
      return '放行失败（401）：需要登录。放行必须用你本人的凭据，不会被换成系统身份。'
    case 403:
      return `放行失败（403）：当前角色没有放行权限（需要 admin 或 trader）。后端原话：${err.message}`
    case 404:
      return (
        '放行失败（404）：没找到这个策略版本。可能是坐标已过期，' +
        '也可能网关还没开通 promote 反代 —— 两种都不该重试，先按 runbook 核对。'
      )
    case 409:
      return `放行失败（409）：该版本状态不允许放行（要 validated 且 carrier 为 wasm/so）。后端原话：${err.message}`
    default:
      return `放行失败（${err.status}）：${err.message}`
  }
}

async function doPromote() {
  if (!canPromote.value || submitting.value) return
  submitting.value = true
  result.value = null
  try {
    const artifact = await promoteStrategyVersion(props.target, actorName.value)
    done.value = true
    confirming.value = false
    const status = artifact?.status ? `（status=${artifact.status}）` : ''
    result.value = { ok: true, text: `已由 ${actorName.value} 放行${status}，审计已留痕。` }
  } catch (e: unknown) {
    result.value = { ok: false, text: describeError(e) }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.promote-gate {
  margin-top: 10px;
  padding: 12px 14px;
  border: 1px solid var(--q-border);
  border-radius: var(--q-radius-sm);
  background: var(--q-surface);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.promote-target { font-size: 12px; color: var(--q-text3); }
.promote-target code { font-family: var(--q-mono); color: var(--q-text2); }
.promote-explain { margin: 0; font-size: 12px; color: var(--q-text3); line-height: 1.6; }
.promote-denied { margin: 0; font-size: 12px; color: var(--q-warning); }
.promote-result { margin: 0; font-size: 12px; }
</style>
