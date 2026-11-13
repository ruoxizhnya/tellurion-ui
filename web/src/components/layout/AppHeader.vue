<template>
  <header class="app-header">
    <div class="header-left">
      <n-button quaternary @click="toggleSidebar" size="small">
        <template #icon><MenuOutline :size="20" /></template>
      </n-button>
      <span class="logo"><TrendingUpOutline :size="18" /> Quant Lab</span>
    </div>
    <div class="header-right">
      <n-space align="center" :size="16">
        <n-tag :type="apiOnline ? 'success' : 'error'" size="small" round :bordered="false">
          {{ apiOnline ? 'API: 在线' : 'API: 离线' }}
        </n-tag>
        <n-tag type="default" size="small" round :bordered="false">
          <template #icon><TimeOutline :size="13" /></template>
          {{ currentTime }}
        </n-tag>
        <!--
          A-04 断言 5：「待审阅 N」读 core 聚合读面 `GET /api/review/pending`（G1 已落地）。
          契约里 `pending` 只在**全部**已配置源都答话时是数字，任一源不可用就是 null ——
          所以这里保留「—」这一态，绝不把未知画成 0。
          位置必须在时间 tag 之后：dashboard.spec 用 .n-tag 的 nth(1) 锚定时间。
        -->
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-tag
              size="small"
              round
              :bordered="false"
              data-testid="header-review-badge"
              aria-disabled="true"
              class="review-badge"
            >
              {{ pendingText }}
            </n-tag>
          </template>
          {{ pendingTip }}
        </n-tooltip>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button
              quaternary
              size="tiny"
              data-testid="header-command-trigger"
              @click="emit('open-command')"
            >
              <template #icon><SearchOutline :size="16" /></template>
              ⌘K
            </n-button>
          </template>
          命令面板（Ctrl / ⌘ + K）
        </n-tooltip>
        <!--
          身份区只在**已登录**时存在。

          条件必须是 isAuthenticated 而不是 authEnabled：open-access（没配
          JWT_SECRET）的部署下这里必须一个节点都不多渲染 —— 那是本地默认形态，
          也是 playwright 视觉回归与其余 UI 用例跑的那个形态。
        -->
        <template v-if="auth.isAuthenticated">
          <n-tag size="small" round :bordered="false" type="info" data-testid="header-user">
            {{ auth.username }} · {{ roleLabel }}
          </n-tag>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button quaternary circle size="small" data-testid="header-logout" @click="handleLogout">
                <template #icon><LogOutOutline :size="17" /></template>
              </n-button>
            </template>
            退出登录
          </n-tooltip>
        </template>
      </n-space>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NTag, NTooltip, NSpace } from 'naive-ui'
import {
  LogOutOutline, MenuOutline,
  SearchOutline, TrendingUpOutline, TimeOutline,
} from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'
import { getReviewPending, type ReviewPending } from '@/api/review'

const emit = defineEmits(['toggle-sidebar', 'open-command'])
const auth = useAuthStore()
const router = useRouter()
const apiOnline = ref(true)
const currentTime = ref('')
let timer: ReturnType<typeof setInterval>

const ROLE_LABELS: Record<string, string> = {
  viewer: '只读',
  trader: '交易员',
  admin: '管理员',
}
const roleLabel = computed(() => (auth.role ? ROLE_LABELS[auth.role] || auth.role : ''))

// G1 待审阅数：`pending === null` 是**契约里的「不知道」**（有源不可用或没有源），
// 必须显示「—」；0 只有后端明确说 0 时才显示。
const reviewPending = ref<ReviewPending | null>(null)
const reviewPendingError = ref('')

const pendingText = computed(() =>
  reviewPending.value?.pending == null ? '待审阅 —' : `待审阅 ${reviewPending.value.pending}`,
)

const pendingTip = computed(() => {
  const p = reviewPending.value
  if (!p) {
    return reviewPendingError.value ? `取数失败：${reviewPendingError.value}` : '正在读取待审阅数'
  }
  if (p.pending != null) {
    return `共 ${p.pending} 条待审阅${p.as_of ? `（截至 ${p.as_of}）` : ''}`
  }
  const down = p.sources.filter((s) => s.status !== 'available').map((s) => s.name)
  if (!down.length) return '没有已配置的审阅源，读数未知（不写成 0）'
  return `未知：${down.join('、')} 源不可用 —— 不把部分求和冒充总数`
})

function loadReviewPending() {
  getReviewPending().then(
    (v) => {
      reviewPending.value = v
      reviewPendingError.value = ''
    },
    (e: unknown) => {
      reviewPending.value = null
      reviewPendingError.value = e instanceof Error ? e.message : String(e)
    },
  )
}

function toggleSidebar() { emit('toggle-sidebar') }

function handleLogout() {
  // 纯本地动作：后端没有会话表可撤销（见 stores/auth.logout 的注释）。
  auth.logout()
  void router.replace({ name: 'login' })
}

function updateClock() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
  loadReviewPending()
})

onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.app-header {
  height: var(--q-header-height);
  background: var(--q-surface);
  border-bottom: 1px solid var(--q-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}

.header-left { display: flex; align-items: center; gap: 12px; }

.logo {
  font-size: 16px;
  font-weight: 700;
  color: var(--q-text);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 图标色走 CSS 而非 color 呈现属性 —— SVG 属性不解析 var()，塞进去只会静默回落 */
.logo svg {
  color: var(--q-primary);
}

.header-right { display: flex; align-items: center; }

/* 角标不可点：视觉上压低，避免被当成可跳转入口 */
.review-badge { color: var(--q-text3); cursor: default; }
</style>
