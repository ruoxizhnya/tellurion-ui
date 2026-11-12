<template>
  <div class="compliance-page" data-testid="compliance-page">
    <n-page-header
      title="合规"
      subtitle="适当性 · 异常交易 · 大额交易日报 · 减持规则（F17）"
    >
      <template #extra>
        <n-space>
          <n-tag type="info" size="small">/api/compliance/* 9 条</n-tag>
          <n-button size="small" :loading="refreshing" @click="loadStatic">
            刷新规则
          </n-button>
        </n-space>
      </template>
    </n-page-header>

    <n-alert v-if="loadError" type="error" closable @close="loadError = ''" data-testid="compliance-load-error">
      {{ loadError }}
    </n-alert>

    <n-tabs type="line" animated data-testid="compliance-tabs">
      <!-- ── 适当性 ─────────────────────────────────────────── -->
      <n-tab-pane name="suitability" tab="适当性">
        <n-grid :cols="2" :x-gap="16" :y-gap="16">
          <n-gi>
            <n-card title="单标的是否可下单" embedded>
              <n-space align="end">
                <n-form-item label="股票代码" class="grow">
                  <n-input
                    v-model:value="checkSymbol"
                    placeholder="600000 / 300750 / 688981"
                    data-testid="compliance-symbol"
                    @keyup.enter="handleCheck"
                  />
                </n-form-item>
                <n-button
                  type="primary"
                  :loading="checking"
                  data-testid="compliance-check"
                  @click="handleCheck"
                >
                  检查
                </n-button>
              </n-space>
              <n-empty v-if="!checkResult" description="输入代码后检查" class="empty" />
              <div v-else class="verdict" data-testid="compliance-verdict">
                <n-tag :type="checkResult.allowed ? 'success' : 'error'" size="large">
                  {{ checkResult.allowed ? '允许' : '拒绝' }}
                </n-tag>
                <span class="verdict-board">{{ checkResult.board_name || checkResult.board }}</span>
                <ul v-if="(checkResult.reasons ?? []).length" class="reason-list">
                  <li v-for="(r, i) in checkResult.reasons ?? []" :key="i">{{ r }}</li>
                </ul>
                <div class="muted">
                  风险等级 {{ checkResult.risk_level }} · 日均资产
                  {{ formatMoney(checkResult.asset_daily_avg_cny) }} · 开户
                  {{ checkResult.profile_age_months }} 月
                </div>
              </div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card title="板块开通条件" embedded>
              <n-empty v-if="requirements.length === 0" description="暂无规则" />
              <n-data-table
                v-else
                size="small"
                :columns="requirementColumns"
                :data="requirements"
                :row-key="(row: BoardRequirement) => row.Board"
                :pagination="false"
              />
              <div class="muted boards">
                需检查板块：{{ boards.join(' / ') || '—' }}
              </div>
            </n-card>
          </n-gi>
        </n-grid>
      </n-tab-pane>

      <!-- ── 异常交易 ───────────────────────────────────────── -->
      <n-tab-pane name="abnormal" tab="异常交易">
        <n-card title="6 类异常行为检测" embedded>
          <n-alert type="default" :bordered="false" class="hint">
            请求体是滑窗内的原始流水（服务端不查库）。用 JSON 录入，不画行编辑控件。
          </n-alert>
          <n-form-item label="账户 ID">
            <n-input v-model:value="abnormalAccount" placeholder="paper-001" data-testid="abnormal-account" />
          </n-form-item>
          <n-grid :cols="2" :x-gap="12">
            <n-gi>
              <n-form-item label="orders（JSON 数组）">
                <n-input
                  v-model:value="abnormalOrdersText"
                  type="textarea"
                  :autosize="{ minRows: 5, maxRows: 12 }"
                  placeholder="[]"
                  data-testid="abnormal-orders"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="trades（JSON 数组）">
                <n-input
                  v-model:value="abnormalTradesText"
                  type="textarea"
                  :autosize="{ minRows: 5, maxRows: 12 }"
                  placeholder="[]"
                  data-testid="abnormal-trades"
                />
              </n-form-item>
            </n-gi>
          </n-grid>
          <n-space>
            <n-button type="primary" :loading="abnormalRunning" data-testid="abnormal-run" @click="handleAbnormal">
              运行检测
            </n-button>
            <span v-if="abnormalError" class="error-text" data-testid="abnormal-error">{{ abnormalError }}</span>
          </n-space>
          <n-empty v-if="!abnormalResult" description="尚未运行" class="empty" />
          <div v-else>
            <div class="muted">命中 {{ abnormalResult.count }} 条 · {{ formatTime(abnormalResult.run_at) }}</div>
            <n-empty v-if="abnormalResult.count === 0" description="未检出异常" />
            <n-data-table
              v-else
              size="small"
              :columns="alertColumns"
              :data="abnormalResult.alerts"
              :pagination="{ pageSize: 10 }"
            />
          </div>
        </n-card>
      </n-tab-pane>

      <!-- ── 大额交易日报 ───────────────────────────────────── -->
      <n-tab-pane name="daily" tab="大额交易日报">
        <n-card title="生成 large-trades 报告" embedded>
          <n-form-item label="交易日（YYYY-MM-DD，留空 = 服务端当天）">
            <n-input v-model:value="reportDate" placeholder="2026-11-12" data-testid="report-date" />
          </n-form-item>
          <n-form-item label="trades（JSON 数组）">
            <n-input
              v-model:value="reportTradesText"
              type="textarea"
              :autosize="{ minRows: 5, maxRows: 12 }"
              placeholder="[]"
              data-testid="report-trades"
            />
          </n-form-item>
          <n-space>
            <n-button type="primary" :loading="reporting" data-testid="report-run" @click="handleReport">
              生成报告
            </n-button>
            <span v-if="reportError" class="error-text" data-testid="report-error">{{ reportError }}</span>
          </n-space>
          <div v-if="reportResult" class="report-result" data-testid="report-result">
            <div>
              落盘路径：<code>{{ reportResult.path }}</code>
            </div>
            <n-grid :cols="4" :x-gap="12" class="report-stats">
              <n-gi><n-statistic label="成交笔数" :value="reportResult.report.total_trades" /></n-gi>
              <n-gi><n-statistic label="成交金额" :value="reportResult.report.total_amount_cny" :precision="2" /></n-gi>
              <n-gi><n-statistic label="大额笔数" :value="reportResult.report.large_trades.length" /></n-gi>
              <n-gi><n-statistic label="累计超限账户" :value="reportResult.report.cumulative_by_account.length" /></n-gi>
            </n-grid>
            <n-empty v-if="reportResult.report.large_trades.length === 0" description="无大额成交" />
            <n-data-table
              v-else
              size="small"
              :columns="largeTradeColumns"
              :data="reportResult.report.large_trades"
              :pagination="{ pageSize: 10 }"
            />
          </div>
        </n-card>
      </n-tab-pane>

      <!-- ── 减持规则 ───────────────────────────────────────── -->
      <n-tab-pane name="divestment" tab="减持规则">
        <n-grid :cols="2" :x-gap="16" :y-gap="16">
          <n-gi>
            <n-card title="减持前检查" embedded>
              <n-grid :cols="2" :x-gap="12">
                <n-gi>
                  <n-form-item label="股东账户">
                    <n-input v-model:value="dvProfile.user_id" placeholder="holder-001" data-testid="dv-user" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="股票代码">
                    <n-input v-model:value="dvProfile.symbol" placeholder="600000" data-testid="dv-symbol" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="主体类型">
                    <n-select
                      v-model:value="dvProfile.holder_type"
                      :options="holderTypeOptions"
                      data-testid="dv-holder-type"
                    />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="持股比例（%）">
                    <n-input-number v-model:value="dvProfile.holdings_pct" :min="0" :max="100" class="full" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="持股数量（股）">
                    <n-input-number v-model:value="dvProfile.holdings_share" :min="0" class="full" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="首笔买入（ISO）">
                    <n-input v-model:value="dvProfile.acquired_at" placeholder="2024-01-02T09:30:00Z" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="拟减持数量（股）">
                    <n-input-number v-model:value="dvQuantity" :min="0" class="full" data-testid="dv-quantity" />
                  </n-form-item>
                </n-gi>
                <n-gi>
                  <n-form-item label="减持方式">
                    <n-select
                      v-model:value="dvMethod"
                      :options="methodOptions"
                      data-testid="dv-method"
                    />
                  </n-form-item>
                </n-gi>
              </n-grid>
              <n-form-item label="recent（JSON 数组，可空）">
                <n-input
                  v-model:value="dvRecentText"
                  type="textarea"
                  :autosize="{ minRows: 3, maxRows: 8 }"
                  placeholder="[]"
                  data-testid="dv-recent"
                />
              </n-form-item>
              <n-space>
                <n-button type="primary" :loading="dvChecking" data-testid="dv-check" @click="handleDivestment">
                  检查
                </n-button>
                <span v-if="dvError" class="error-text" data-testid="dv-error">{{ dvError }}</span>
              </n-space>
              <div v-if="dvResult" class="verdict" data-testid="dv-result">
                <n-tag :type="dvResult.allowed ? 'success' : 'error'" size="large">
                  {{ dvResult.allowed ? '通过' : '拒绝' }}
                </n-tag>
                <div class="muted">
                  拟减 {{ dvResult.requested_qty }} · 批准 {{ dvResult.approved_qty }} · 窗口剩余
                  {{ dvResult.window_remain_pct.toFixed(3) }}% · 减后持股
                  {{ dvResult.hold_pct_after.toFixed(3) }}%
                </div>
                <ul v-if="(dvResult.reasons ?? []).length" class="reason-list">
                  <li v-for="(r, i) in dvResult.reasons ?? []" :key="i">{{ r }}</li>
                </ul>
                <ul v-if="(dvResult.warnings ?? []).length" class="reason-list warn">
                  <li v-for="(w, i) in dvResult.warnings ?? []" :key="i">{{ w }}</li>
                </ul>
              </div>
            </n-card>
          </n-gi>
          <n-gi>
            <n-card title="当前规则快照" embedded>
              <n-empty v-if="ruleRows.length === 0" description="暂无规则" />
              <n-data-table
                v-else
                size="small"
                :columns="ruleColumns"
                :data="ruleRows"
                :row-key="(row: RuleRow) => row.key"
                :pagination="false"
                :scroll-x="900"
              />
            </n-card>
          </n-gi>
        </n-grid>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import {
  NAlert,
  NButton,
  NCard,
  NDataTable,
  NEmpty,
  NFormItem,
  NGi,
  NGrid,
  NInput,
  NInputNumber,
  NPageHeader,
  NSelect,
  NSpace,
  NStatistic,
  NTabPane,
  NTabs,
  NTag,
  useMessage,
} from 'naive-ui'
import { ApiError } from '@/api/client'
import {
  checkDivestment,
  checkSuitability,
  generateDailyReport,
  getBoards,
  getDivestmentHolderTypes,
  getDivestmentMethods,
  getDivestmentRules,
  getRequirements,
  runAbnormalDetection,
  type AbnormalAlert,
  type AbnormalRunResponse,
  type BoardRequirement,
  type CheckResponse,
  type DailyReportResponse,
  type DivestmentCheckResult,
  type DivestmentRule,
  type LargeTradeEntry,
  type ReductionMethod,
  type ShareholderType,
} from '@/api/compliance'

const message = useMessage()

// ── 静态规则（requirements / boards / holder-types / methods / rules）──
const requirements = ref<BoardRequirement[]>([])
const boards = ref<string[]>([])
const holderTypes = ref<{ id: ShareholderType; label: string }[]>([])
const methods = ref<{ id: ReductionMethod; label: string }[]>([])
const rules = ref<Record<string, DivestmentRule>>({})
const refreshing = ref(false)
const loadError = ref('')

const holderTypeOptions = computed(() =>
  holderTypes.value.map((t) => ({ label: t.label, value: t.id })),
)
const methodOptions = computed(() =>
  methods.value.map((m) => ({ label: m.label, value: m.id })),
)

async function loadStatic() {
  refreshing.value = true
  loadError.value = ''
  try {
    const [req, bd, ht, md, rl] = await Promise.all([
      getRequirements(),
      getBoards(),
      getDivestmentHolderTypes(),
      getDivestmentMethods(),
      getDivestmentRules(),
    ])
    requirements.value = req.requirements ?? []
    boards.value = bd.boards ?? []
    holderTypes.value = ht.holder_types ?? []
    methods.value = md.methods ?? []
    rules.value = rl.rules ?? {}
    if (!dvProfile.holder_type && holderTypes.value.length) {
      dvProfile.holder_type = holderTypes.value[0].id
    }
    if (!dvMethod.value && methods.value.length) dvMethod.value = methods.value[0].id
  } catch (e) {
    loadError.value = `加载合规规则失败：${errText(e)}`
  } finally {
    refreshing.value = false
  }
}

// ── 适当性 ─────────────────────────────────────────────────────────
const checkSymbol = ref('')
const checking = ref(false)
const checkResult = ref<CheckResponse | null>(null)

async function handleCheck() {
  const symbol = checkSymbol.value.trim()
  if (!symbol) {
    message.warning('请输入股票代码')
    return
  }
  checking.value = true
  try {
    // 422 拒绝也带同一响应体，但 client 对非 2xx 会 throw；从 ApiError.body
    // 取回结构化结果，避免把"拒绝"渲染成"请求失败"。
    checkResult.value = await checkSuitability({ symbol })
  } catch (e) {
    if (e instanceof ApiError && e.status === 422 && e.body) {
      checkResult.value = e.body as unknown as CheckResponse
    } else {
      checkResult.value = null
      message.error(`适当性检查失败：${errText(e)}`)
    }
  } finally {
    checking.value = false
  }
}

const requirementColumns: DataTableColumns<BoardRequirement> = [
  { title: '板块', key: 'DisplayName', width: 110 },
  {
    title: '资产门槛',
    key: 'AssetThresholdCNY',
    width: 120,
    render: (row) => formatMoney(row.AssetThresholdCNY),
  },
  { title: '经验（月）', key: 'ExperienceMonths', width: 100 },
  { title: '风险等级', key: 'RiskLevel', width: 90 },
  { title: '说明', key: 'Description', ellipsis: { tooltip: true } },
]

// ── 异常交易 ───────────────────────────────────────────────────────
const abnormalAccount = ref('')
const abnormalOrdersText = ref('[]')
const abnormalTradesText = ref('[]')
const abnormalRunning = ref(false)
const abnormalError = ref('')
const abnormalResult = ref<AbnormalRunResponse | null>(null)

async function handleAbnormal() {
  abnormalError.value = ''
  let orders: unknown
  let trades: unknown
  try {
    orders = JSON.parse(abnormalOrdersText.value || '[]')
    trades = JSON.parse(abnormalTradesText.value || '[]')
  } catch (e) {
    abnormalError.value = `JSON 解析失败：${errText(e)}`
    return
  }
  if (!Array.isArray(orders) || !Array.isArray(trades)) {
    abnormalError.value = 'orders / trades 必须是 JSON 数组'
    return
  }
  abnormalRunning.value = true
  try {
    abnormalResult.value = await runAbnormalDetection({
      account_id: abnormalAccount.value.trim(),
      orders: orders as never,
      trades: trades as never,
    })
  } catch (e) {
    abnormalResult.value = null
    abnormalError.value = `检测失败：${errText(e)}`
  } finally {
    abnormalRunning.value = false
  }
}

const alertColumns: DataTableColumns<AbnormalAlert> = [
  { title: '类型', key: 'Category', width: 100 },
  {
    title: '等级',
    key: 'Severity',
    width: 90,
    render: (row) =>
      h(
        NTag,
        { size: 'small', type: row.Severity === 'critical' ? 'error' : 'warning' },
        { default: () => row.Severity },
      ),
  },
  { title: '账户', key: 'AccountID', width: 120 },
  { title: '标的', key: 'Symbol', width: 100 },
  { title: '摘要', key: 'Summary', ellipsis: { tooltip: true } },
  {
    title: '窗口',
    key: 'WindowFrom',
    width: 190,
    render: (row) => `${formatTime(row.WindowFrom)} → ${formatTime(row.WindowTo)}`,
  },
]

// ── 大额交易日报 ───────────────────────────────────────────────────
const reportDate = ref('')
const reportTradesText = ref('[]')
const reporting = ref(false)
const reportError = ref('')
const reportResult = ref<DailyReportResponse | null>(null)

async function handleReport() {
  reportError.value = ''
  let trades: unknown
  try {
    trades = JSON.parse(reportTradesText.value || '[]')
  } catch (e) {
    reportError.value = `JSON 解析失败：${errText(e)}`
    return
  }
  if (!Array.isArray(trades)) {
    reportError.value = 'trades 必须是 JSON 数组'
    return
  }
  reporting.value = true
  try {
    reportResult.value = await generateDailyReport({
      trading_date: reportDate.value.trim() || undefined,
      trades: trades as never,
    })
  } catch (e) {
    reportResult.value = null
    reportError.value = `生成失败：${errText(e)}`
  } finally {
    reporting.value = false
  }
}

const largeTradeColumns: DataTableColumns<LargeTradeEntry> = [
  { title: '成交号', key: 'trade_id', width: 130 },
  { title: '账户', key: 'account_id', width: 110 },
  { title: '标的', key: 'symbol', width: 90 },
  { title: '方向', key: 'direction', width: 70 },
  { title: '数量', key: 'quantity', width: 90 },
  {
    title: '金额',
    key: 'amount_cny',
    width: 120,
    render: (row) => formatMoney(row.amount_cny),
  },
  { title: '标记', key: 'flag', width: 90 },
  {
    title: '成交时间',
    key: 'trade_time',
    width: 170,
    render: (row) => formatTime(row.trade_time),
  },
]

// ── 减持 ───────────────────────────────────────────────────────────
const dvProfile = reactive({
  user_id: '',
  symbol: '',
  holder_type: 'controlling' as ShareholderType,
  holdings_pct: 5,
  holdings_share: 10_000_000,
  acquired_at: '2023-01-03T09:30:00Z',
})
const dvQuantity = ref(1_000_000)
const dvMethod = ref<ReductionMethod>('auction')
const dvRecentText = ref('[]')
const dvChecking = ref(false)
const dvError = ref('')
const dvResult = ref<DivestmentCheckResult | null>(null)

async function handleDivestment() {
  dvError.value = ''
  let recent: unknown
  try {
    recent = JSON.parse(dvRecentText.value || '[]')
  } catch (e) {
    dvError.value = `JSON 解析失败：${errText(e)}`
    return
  }
  if (!Array.isArray(recent)) {
    dvError.value = 'recent 必须是 JSON 数组'
    return
  }
  dvChecking.value = true
  try {
    dvResult.value = await checkDivestment({
      profile: { ...dvProfile },
      plan: {
        symbol: dvProfile.symbol,
        quantity: dvQuantity.value ?? 0,
        method: dvMethod.value,
        at: new Date().toISOString(),
      },
      recent: recent as never,
    })
  } catch (e) {
    if (e instanceof ApiError && e.status === 422 && e.body) {
      dvResult.value = e.body as unknown as DivestmentCheckResult
    } else {
      dvResult.value = null
      dvError.value = `检查失败：${errText(e)}`
    }
  } finally {
    dvChecking.value = false
  }
}

interface RuleRow extends DivestmentRule {
  key: string
  label: string
}

const ruleRows = computed<RuleRow[]>(() =>
  Object.entries(rules.value).map(([key, rule]) => ({
    ...rule,
    key,
    label: holderTypes.value.find((t) => t.id === key)?.label || key,
  })),
)

const ruleColumns: DataTableColumns<RuleRow> = [
  { title: '主体', key: 'label', width: 150 },
  { title: '竞价窗口（日）', key: 'AuctionWindowDays', width: 120 },
  { title: '竞价上限（%）', key: 'AuctionWindowCapPct', width: 120 },
  { title: '大宗窗口（日）', key: 'BlockWindowDays', width: 120 },
  { title: '大宗上限（%）', key: 'BlockWindowCapPct', width: 120 },
  { title: '协议下限（%）', key: 'AgreementMinPct', width: 120 },
  { title: '法规', key: 'Source', ellipsis: { tooltip: true } },
]

// ── 工具 ───────────────────────────────────────────────────────────
function errText(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

function formatMoney(v: number | undefined | null): string {
  if (v === undefined || v === null) return '—'
  return `¥${v.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`
}

function formatTime(ts: string): string {
  if (!ts) return '—'
  const d = new Date(ts)
  return isNaN(d.getTime()) ? ts : d.toLocaleString('zh-CN', { hour12: false })
}

onMounted(loadStatic)
</script>

<style scoped>
.compliance-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.grow {
  flex: 1;
}

.full {
  width: 100%;
}

.empty {
  margin: 24px 0;
}

.verdict {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.verdict-board {
  font-weight: 600;
}

.reason-list {
  margin: 0;
  padding-left: 18px;
  color: var(--q-danger-text);
}

.reason-list.warn {
  color: var(--q-warning);
}

.muted {
  font-size: 12px;
  color: var(--q-text3);
}

.boards {
  margin-top: 12px;
}

.hint {
  margin-bottom: 12px;
}

.error-text {
  color: var(--q-danger-text);
  font-size: 12px;
}

.report-result {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-stats {
  margin-top: 4px;
}
</style>
