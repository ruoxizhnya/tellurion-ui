<template>
  <div class="paper-trading-page" data-testid="paper-trading-page">
    <n-page-header
      title="纸交易"
      subtitle="订单 · 持仓 · 账户 · 外部信号（F16：只做纸面 / Mock，不接真实交易通道）"
    >
      <template #extra>
        <n-space>
          <n-tag type="warning" size="small" data-testid="paper-badge">纸交易 / Mock</n-tag>
          <n-button size="small" :loading="loading" data-testid="paper-refresh" @click="loadAll">
            刷新
          </n-button>
        </n-space>
      </template>
    </n-page-header>

    <n-alert
      v-if="loadError"
      type="error"
      closable
      data-testid="paper-error"
      @close="loadError = ''"
    >
      {{ loadError }}
    </n-alert>

    <n-grid :cols="2" :x-gap="16" :y-gap="16" class="grid">
      <n-gi>
        <n-card title="订单" embedded data-testid="paper-orders">
          <n-data-table
            :columns="orderColumns"
            :data="orders"
            :pagination="false"
            :loading="loading"
            size="small"
            :row-key="(r: OrderResult) => r.order_id"
          />
        </n-card>
      </n-gi>

      <n-gi>
        <n-card title="持仓" embedded data-testid="paper-positions">
          <n-data-table
            :columns="positionColumns"
            :data="positions"
            :pagination="false"
            :loading="loading"
            size="small"
            :row-key="(r: Position) => r.symbol"
          />
        </n-card>
      </n-gi>

      <n-gi>
        <n-card title="账户" embedded data-testid="paper-account">
          <n-descriptions v-if="accountEntries.length" :column="1" size="small" bordered>
            <n-descriptions-item
              v-for="[key, value] in accountEntries"
              :key="key"
              :label="key"
            >
              {{ formatValue(value) }}
            </n-descriptions-item>
          </n-descriptions>
          <n-empty v-else description="账户无返回字段" />
          <p class="hint">
            字段名与值原样取自 <code>GET /api/execution/account</code>（openapi 只声明
            <code>type: object</code>），页面不补造担保品/保证金等不存在的键。
          </p>
        </n-card>
      </n-gi>

      <n-gi>
        <n-card title="外部信号流" embedded data-testid="paper-signals">
          <n-alert type="default" :bordered="true">
            <span data-testid="signals-dependency">
              core 只有 <code>POST /api/signals</code> 写门，<strong>没有读面</strong>；
              在 core 提供订阅/历史读端点之前，这里不画任何"实时信号"。
            </span>
          </n-alert>
          <n-space vertical class="signals-body">
            <n-input
              disabled
              data-testid="signals-disabled-input"
              placeholder="信号通道未接入（缺读端点）"
            />
            <n-button disabled data-testid="signals-disabled-subscribe">订阅信号流</n-button>
          </n-space>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 紧急平仓：红 + 二次确认 + 独立确认码（F16）。放在页尾，危险操作不占显眼位。 -->
    <EmergencyFlatten @flattened="loadAll" />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import {
  NAlert,
  NButton,
  NCard,
  NDataTable,
  NDescriptions,
  NDescriptionsItem,
  NEmpty,
  NGi,
  NGrid,
  NInput,
  NPageHeader,
  NSpace,
  NTag,
} from 'naive-ui'
import EmergencyFlatten from '@/components/paper/EmergencyFlatten.vue'
import {
  getAccount,
  getPositions,
  listOrders,
  type AccountSummary,
  type OrderResult,
  type Position,
} from '@/api/execution'

/**
 * A-09 纸交易观测台（F16）。
 *
 * 数据只来自 `/api/execution/*` 的 Mock/纸面通道；页面上没有任何
 * "实盘/低延迟/L2" 一类暗示 —— 那是 F16 明令禁止的文案面。
 * 外部信号流因 core 缺读端点保持 disabled，并在原位写清依赖。
 */
const loading = ref(false)
const loadError = ref('')
const orders = ref<OrderResult[]>([])
const positions = ref<Position[]>([])
const account = ref<AccountSummary>({})

const accountEntries = computed(() => Object.entries(account.value))

function describeError(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

/**
 * 三个读面互不依赖：任一失败都要单独报出来，不能因为订单 403 就把持仓也画成空。
 * 403 = 当前角色不够（orders/positions 的读面按 AUD-02 口径要求 trader/admin）。
 */
async function loadAll() {
  loading.value = true
  loadError.value = ''
  const failures: string[] = []

  const [o, p, a] = await Promise.allSettled([listOrders(), getPositions(), getAccount()])
  if (o.status === 'fulfilled') orders.value = o.value.orders ?? []
  else failures.push(`订单：${describeError(o.reason)}`)
  if (p.status === 'fulfilled') positions.value = p.value.positions ?? []
  else failures.push(`持仓：${describeError(p.reason)}`)
  if (a.status === 'fulfilled') account.value = a.value ?? {}
  else failures.push(`账户：${describeError(a.reason)}`)

  loadError.value = failures.join('；')
  loading.value = false
}

function fmtNum(n: number, digits = 2): string {
  return Number.isFinite(n) ? n.toFixed(digits) : '—'
}

function fmtTime(ts: string): string {
  if (!ts) return '—'
  const d = new Date(ts)
  return Number.isNaN(d.getTime()) ? ts : d.toLocaleString('zh-CN', { hour12: false })
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const orderColumns: DataTableColumns<OrderResult> = [
  { title: '订单号', key: 'order_id', width: 130, ellipsis: { tooltip: true } },
  { title: '标的', key: 'symbol', width: 100 },
  { title: '状态', key: 'status', width: 90 },
  { title: '成交量', key: 'filled_qty', width: 90, render: (r) => fmtNum(r.filled_qty, 0) },
  { title: '均价', key: 'avg_price', width: 90, render: (r) => fmtNum(r.avg_price, 4) },
  { title: '佣金', key: 'commission', width: 90, render: (r) => fmtNum(r.commission) },
  { title: '时间', key: 'timestamp', render: (r) => fmtTime(r.timestamp) },
]

const positionColumns: DataTableColumns<Position> = [
  { title: '标的', key: 'symbol', width: 100 },
  { title: '数量', key: 'quantity', width: 90, render: (r) => fmtNum(r.quantity, 0) },
  { title: '成本', key: 'avg_cost', width: 90, render: (r) => fmtNum(r.avg_cost, 4) },
  { title: '现价', key: 'current_price', width: 90, render: (r) => fmtNum(r.current_price, 4) },
  { title: '市值', key: 'market_value', width: 100, render: (r) => fmtNum(r.market_value) },
  { title: '浮盈亏', key: 'unrealized_pnl', width: 100, render: (r) => fmtNum(r.unrealized_pnl) },
  {
    title: '权重',
    key: 'weight',
    width: 80,
    render: (r) => `${fmtNum(r.weight * 100)}%`,
  },
]

onMounted(loadAll)
</script>

<style scoped>
.grid { margin-top: 16px; }
.signals-body { margin-top: 12px; }
.hint {
  margin: 10px 0 0;
  font-size: 11px;
  color: var(--q-text3);
  line-height: 1.5;
}
</style>
