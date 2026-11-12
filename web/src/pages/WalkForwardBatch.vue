<template>
  <div class="wf-batch-page" data-testid="walkforward-batch-page">
    <n-page-header
      title="走向与批量"
      subtitle="走向验证 · 批量回测（POST /api/walkforward · /api/batch，4 条）"
    />

    <n-tabs type="line" animated data-testid="wf-batch-tabs">
      <!-- ── Walk-forward ───────────────────────────────────── -->
      <n-tab-pane name="walkforward" tab="走向验证">
        <n-card title="滚动分段回测（纯计算，不落库）" embedded>
          <n-alert type="default" :bordered="false" class="hint">
            REV-20：train / test 两段用**同一策略、同一参数**各跑一段，报告是
            「分时段稳健性概览」，不是参数优化的过拟合度量。
          </n-alert>
          <n-grid :cols="3" :x-gap="12">
            <n-gi>
              <n-form-item label="策略">
                <n-input v-model:value="wf.strategy" placeholder="ma_cross" data-testid="wf-strategy" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="股票池（逗号分隔）">
                <n-input v-model:value="wf.pool" placeholder="600000,000001" data-testid="wf-pool" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="初始资金">
                <n-input-number v-model:value="wf.capital" :min="0" class="full" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="开始日期">
                <n-input v-model:value="wf.start" placeholder="2022-01-01" data-testid="wf-start" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="结束日期">
                <n-input v-model:value="wf.end" placeholder="2025-12-31" data-testid="wf-end" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="无风险利率">
                <n-input-number v-model:value="wf.riskFree" :step="0.001" class="full" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="Train（交易日）">
                <n-input-number v-model:value="wf.trainDays" :min="1" class="full" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="Test（交易日）">
                <n-input-number v-model:value="wf.testDays" :min="1" class="full" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="Step（交易日）">
                <n-input-number v-model:value="wf.stepDays" :min="1" class="full" />
              </n-form-item>
            </n-gi>
          </n-grid>
          <n-space>
            <n-button type="primary" :loading="wfRunning" data-testid="wf-run" @click="handleWalkForward">
              运行
            </n-button>
            <span v-if="wfError" class="error-text" data-testid="wf-error">{{ wfError }}</span>
          </n-space>
          <div v-if="wfReport" class="report" data-testid="wf-report">
            <n-grid :cols="5" :x-gap="12">
              <n-gi><n-statistic label="平均 test Sharpe" :value="wfReport.avg_test_sharpe" :precision="3" /></n-gi>
              <n-gi><n-statistic label="平均 test 收益" :value="wfReport.avg_test_return" :precision="4" /></n-gi>
              <n-gi><n-statistic label="平均最大回撤" :value="wfReport.avg_test_max_drawdown" :precision="4" /></n-gi>
              <n-gi><n-statistic label="通过率" :value="wfReport.pass_rate" :precision="3" /></n-gi>
              <n-gi>
                <n-statistic label="整体">
                  <n-tag :type="wfReport.overall_pass ? 'success' : 'warning'" size="small">
                    {{ wfReport.overall_pass ? 'PASS' : '未通过' }}
                  </n-tag>
                </n-statistic>
              </n-gi>
            </n-grid>
            <n-empty v-if="wfReport.windows.length === 0" description="没有可评估的窗口" />
            <n-data-table
              v-else
              size="small"
              :columns="windowColumns"
              :data="wfReport.windows"
              :row-key="(row: WalkForwardWindow) => String(row.window_index)"
              :pagination="false"
              :scroll-x="900"
            />
          </div>
        </n-card>
      </n-tab-pane>

      <!-- ── 批量回测 ───────────────────────────────────────── -->
      <n-tab-pane name="batch" tab="批量回测">
        <n-card title="同步批量（并发 ≤16、任务 ≤100）" embedded>
          <n-grid :cols="3" :x-gap="12">
            <n-gi>
              <n-form-item label="并发">
                <n-input-number v-model:value="batch.concurrency" :min="1" :max="16" class="full" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="同时跑 walk-forward">
                <n-switch v-model:value="batch.runWF" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="WF train / test / step">
                <n-space>
                  <n-input-number v-model:value="batch.wfTrain" :min="1" style="width: 80px" />
                  <n-input-number v-model:value="batch.wfTest" :min="1" style="width: 80px" />
                  <n-input-number v-model:value="batch.wfStep" :min="1" style="width: 80px" />
                </n-space>
              </n-form-item>
            </n-gi>
          </n-grid>
          <n-form-item label="tasks（JSON 数组；字段见 BatchTask）">
            <n-input
              v-model:value="batch.tasksText"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 16 }"
              data-testid="batch-tasks"
            />
          </n-form-item>
          <n-space>
            <n-button type="primary" :loading="batchRunning" data-testid="batch-run" @click="handleBatch">
              运行
            </n-button>
            <n-button :loading="batchLoading" @click="handleLoadBatch">按 batch_id 读取</n-button>
            <n-input v-model:value="batchId" placeholder="batch_id" style="width: 240px" data-testid="batch-id" />
            <span v-if="batchError" class="error-text" data-testid="batch-error">{{ batchError }}</span>
          </n-space>
          <div v-if="batchReport" class="report" data-testid="batch-report">
            <n-space align="center">
              <n-tag size="small" type="info">{{ batchReport.batch_id }}</n-tag>
              <n-tag size="small">{{ batchReport.status }}</n-tag>
              <n-button size="small" data-testid="batch-export" @click="handleExport">
                下载 json
              </n-button>
            </n-space>
            <n-grid v-if="batchReport.summary" :cols="5" :x-gap="12" class="report-stats">
              <n-gi><n-statistic label="任务" :value="batchReport.summary.total_tasks" /></n-gi>
              <n-gi><n-statistic label="成功" :value="batchReport.summary.success_count" /></n-gi>
              <n-gi><n-statistic label="失败" :value="batchReport.summary.fail_count" /></n-gi>
              <n-gi><n-statistic label="平均 Sharpe" :value="batchReport.summary.avg_sharpe" :precision="3" /></n-gi>
              <n-gi><n-statistic label="最佳任务" :value="batchReport.summary.best_task_id || '—'" /></n-gi>
            </n-grid>
            <n-data-table
              size="small"
              :columns="batchColumns"
              :data="batchReport.results"
              :row-key="(row: BatchResult) => row.task_id"
              :pagination="{ pageSize: 10 }"
              :scroll-x="860"
            />
          </div>
        </n-card>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { h, reactive, ref } from 'vue'
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
  NSpace,
  NStatistic,
  NSwitch,
  NTabPane,
  NTabs,
  NTag,
} from 'naive-ui'
import { getAccessToken } from '@/api/authToken'
import {
  batchExportUrl,
  getBatchReport,
  runBatch,
  runWalkForward,
  type BatchReport,
  type BatchResult,
  type BatchTask,
  type WalkForwardReport,
  type WalkForwardWindow,
} from '@/api/walkforward'

// ── walk-forward ───────────────────────────────────────────────────
const wf = reactive({
  strategy: 'ma_cross',
  pool: '600000,000001',
  start: '2022-01-01',
  end: '2025-12-31',
  capital: 1_000_000,
  riskFree: 0.02,
  trainDays: 250,
  testDays: 60,
  stepDays: 60,
})
const wfRunning = ref(false)
const wfError = ref('')
const wfReport = ref<WalkForwardReport | null>(null)

async function handleWalkForward() {
  wfError.value = ''
  const pool = wf.pool
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (!wf.strategy.trim() || pool.length === 0) {
    wfError.value = '策略与股票池必填'
    return
  }
  wfRunning.value = true
  try {
    wfReport.value = await runWalkForward({
      strategy: wf.strategy.trim(),
      stock_pool: pool,
      start_date: wf.start.trim(),
      end_date: wf.end.trim(),
      initial_capital: wf.capital,
      risk_free_rate: wf.riskFree,
      walk_forward_params: {
        TrainDays: wf.trainDays ?? 250,
        TestDays: wf.testDays ?? 60,
        StepDays: wf.stepDays ?? 60,
        // 0 = 由后端取 train/2（handlers_walkforward.go:60-62）。
        MinTrainDays: 0,
      },
    })
  } catch (e) {
    wfReport.value = null
    wfError.value = `运行失败：${errText(e)}`
  } finally {
    wfRunning.value = false
  }
}

const windowColumns: DataTableColumns<WalkForwardWindow> = [
  { title: '#', key: 'window_index', width: 50 },
  {
    title: 'train',
    key: 'train_start',
    width: 180,
    render: (row) => `${row.train_start} → ${row.train_end}`,
  },
  {
    title: 'test',
    key: 'test_start',
    width: 180,
    render: (row) => `${row.test_start} → ${row.test_end}`,
  },
  { title: 'train Sharpe', key: 'train_sharpe', width: 110, render: (row) => fmt(row.train_sharpe) },
  { title: 'test Sharpe', key: 'test_sharpe', width: 110, render: (row) => fmt(row.test_sharpe) },
  { title: 'test 收益', key: 'test_return', width: 100, render: (row) => fmt(row.test_return) },
  { title: 'test 回撤', key: 'test_max_drawdown', width: 100, render: (row) => fmt(row.test_max_drawdown) },
  { title: 'OOS/train', key: 'oos_vs_train', width: 100, render: (row) => fmt(row.oos_vs_train) },
]

// ── batch ──────────────────────────────────────────────────────────
const batch = reactive({
  concurrency: 4,
  runWF: false,
  wfTrain: 252,
  wfTest: 63,
  wfStep: 63,
  tasksText: JSON.stringify(
    [
      {
        id: 't1',
        strategy: 'ma_cross',
        stock_pool: ['600000', '000001'],
        start_date: '2022-01-01',
        end_date: '2025-12-31',
        capital: 1_000_000,
      },
    ],
    null,
    2,
  ),
})
const batchRunning = ref(false)
const batchLoading = ref(false)
const batchError = ref('')
const batchReport = ref<BatchReport | null>(null)
const batchId = ref('')

async function handleBatch() {
  batchError.value = ''
  let tasks: BatchTask[]
  try {
    tasks = JSON.parse(batch.tasksText)
  } catch (e) {
    batchError.value = `tasks JSON 解析失败：${errText(e)}`
    return
  }
  if (!Array.isArray(tasks) || tasks.length === 0) {
    batchError.value = 'tasks 必须是非空数组'
    return
  }
  if (tasks.length > 100) {
    batchError.value = 'tasks 超过 100 个（后端上限）'
    return
  }
  batchRunning.value = true
  try {
    batchReport.value = await runBatch({
      tasks,
      config: {
        concurrency: batch.concurrency,
        run_walk_forward: batch.runWF,
        wf_train_days: batch.wfTrain,
        wf_test_days: batch.wfTest,
        wf_step_days: batch.wfStep,
      },
    })
    batchId.value = batchReport.value.batch_id
  } catch (e) {
    batchReport.value = null
    batchError.value = `运行失败：${errText(e)}`
  } finally {
    batchRunning.value = false
  }
}

async function handleLoadBatch() {
  if (!batchId.value.trim()) {
    batchError.value = '请填写 batch_id'
    return
  }
  batchLoading.value = true
  batchError.value = ''
  try {
    batchReport.value = await getBatchReport(batchId.value.trim())
  } catch (e) {
    batchReport.value = null
    batchError.value = `读取失败：${errText(e)}`
  } finally {
    batchLoading.value = false
  }
}

/**
 * 走 export 端点的 json 分支。不能直接用 `<a href>`：鉴权开启时
 * 浏览器导航不带 Authorization 头，会 401。这里带 token 取回 Blob。
 */
async function handleExport() {
  if (!batchReport.value) return
  try {
    const token = getAccessToken()
    const res = await fetch(batchExportUrl(batchReport.value.batch_id), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `batch_${batchReport.value.batch_id}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    batchError.value = `导出失败：${errText(e)}`
  }
}

const batchColumns: DataTableColumns<BatchResult> = [
  { title: '任务', key: 'task_id', width: 100 },
  { title: '策略', key: 'strategy', width: 120 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) =>
      h(
        NTag,
        { size: 'small', type: row.status === 'success' ? 'success' : 'error' },
        { default: () => row.status },
      ),
  },
  { title: '耗时(ms)', key: 'duration_ms', width: 100 },
  {
    title: 'Sharpe',
    key: 'sharpe',
    width: 90,
    render: (row) => fmt(row.result?.sharpe_ratio),
  },
  {
    title: '年化',
    key: 'annual',
    width: 90,
    render: (row) => fmt(row.result?.annual_return),
  },
  { title: '评级', key: 'grade', width: 80, render: (row) => row.score?.grade ?? '—' },
  { title: '错误', key: 'error', ellipsis: { tooltip: true }, render: (row) => row.error || '—' },
]

function fmt(v: number | undefined | null): string {
  return v === undefined || v === null ? '—' : v.toFixed(4)
}

function errText(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}
</script>

<style scoped>
.wf-batch-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.hint {
  margin-bottom: 12px;
}

.full {
  width: 100%;
}

.report {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-stats {
  margin-top: 4px;
}

.error-text {
  color: var(--q-danger-text);
  font-size: 12px;
}
</style>
