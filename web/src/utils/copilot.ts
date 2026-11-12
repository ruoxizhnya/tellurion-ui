import type { CopilotJobStatus } from '@/types/api'
import type { PromoteTarget } from '@/api/strategy'

/**
 * Copilot 终态的「人话」口径 —— 全站唯一一份。
 *
 * 为什么要有这个文件：`sandbox_rejected` 这一个 status 在 `tellurion-agent`
 * 里至少覆盖四种完全不同的原因（`pkg/copilot/copilot.go`）：
 *
 *   1. 代码编过了、资产也登记了，**卡在 promote 人工闸门**（:666-669，
 *      chain 上 `blocked_reason` 有值）；
 *   2. 沙箱/静态检查器**压根没装配**（:477-478、:513-516）；
 *   3. 资产登记失败（:643-650）；
 *   4. 生成链留痕写不进去（:682-684）。
 *
 * 页面原先对这四种一视同仁地补一句「沙箱未启用：需配置 copilot.working_dir」——
 * 对着第 1 种说这句是错的：那份代码已经编译通过、坐标也签出来了，缺的是**人**
 * 去 strategy 放行，不是运维去配沙箱。用户按错的方向找半天，最后发现是自己
 * 该点的那一下没做。
 *
 * 判据只用后端已经发出来的字段（`status` + `build_error`），不新增请求、不猜：
 * 认不出来就**只说后端说了什么**，不补一句编的解释（同 `utils/runStatus.ts`
 * 对待未知状态的立场）。
 */

/** 能稳定认出来的失败种类。认不出来的走 `unknown`。 */
export type CopilotFailureKind =
  | 'promote_gate'
  | 'sandbox_unavailable'
  | 'asset_register'
  | 'chain_trace'
  | 'unknown'

export interface CopilotRejection {
  kind: CopilotFailureKind
  /** 主文案：状态 + 后端给的原因（原样搬，不改写、不润色） */
  message: string
  /** 下一步该怎么办；认不出原因时**不给**（编一句比不给更坏） */
  hint?: string
}

type JobLike = Pick<CopilotJobStatus, 'status' | 'build_error' | 'backtest_error'>

/**
 * 闸门拦下的判据。
 *
 * 为什么靠这句中文而不是靠 `blocked_reason`：job 的读面
 * （`tellurion-agent:cmd/ai/handlers_copilot.go:99-118`）目前只发
 * `job_id/status/generated_code/build_error/strategy_name/backtest_error/
 * backtest_result` —— `blocked_reason` 只落在 `ai.generation_chain` 表里，
 * 前端拿不到。这句文案是 agent 侧 `stopAtGate` 的唯一出口
 * （`copilot.go:667-669`），与本文件是**同一个判据的两端**：
 * 那边要改措辞，这里必须同步（见 docs/runbook.md §5）。
 */
const GATE_MARKER = '未过 promote 人工闸门'

/** 沙箱/检查器没装配 —— 两种都点名了缺的配置键，运维能照着补。 */
const SANDBOX_MARKERS = ['copilot.working_dir', 'code checker not configured']

const ASSET_REGISTER_MARKER = '资产登记失败'
const CHAIN_TRACE_MARKER = '生成链写不进去'

const HINTS: Record<CopilotFailureKind, string | undefined> = {
  // 被拦不是故障：不重试、不怪沙箱，让人去 strategy 放行。
  promote_gate:
    '代码已编译并登记资产坐标，但没有过 promote 人工闸门，所以不会自动跑回测。' +
    '放行是人的动作（本页不做），步骤见 docs/runbook.md §4.2。',
  sandbox_unavailable:
    '沙箱未启用：需在后端配置 copilot.working_dir 后，AI 生成的代码才会真正编译验证。',
  asset_register: '代码编过了，但登记到策略资产服务失败；先看 ai-service 日志里的登记错误。',
  chain_trace: '生成链留痕写不进去，这一轮按 fail-closed 终止；先修留痕落点再重试。',
  unknown: undefined,
}

function classify(status: string, why: string): CopilotFailureKind {
  if (why.includes(GATE_MARKER)) return 'promote_gate'
  if (SANDBOX_MARKERS.some((m) => why.includes(m))) return 'sandbox_unavailable'
  if (why.includes(ASSET_REGISTER_MARKER)) return 'asset_register'
  if (why.includes(CHAIN_TRACE_MARKER)) return 'chain_trace'
  // status=build_failed 等其它失败一律不解释：后端已经给了原因，页面不再加戏。
  void status
  return 'unknown'
}

/**
 * 把一个失败终态翻译成「状态 + 原因 + 下一步」。
 *
 * 组装式而不是查表式：`message` 永远带着后端原文，避免丢掉可复核的证据。
 */
export function describeCopilotRejection(job: JobLike): CopilotRejection {
  const why = job.build_error || job.backtest_error || ''
  const kind = classify(job.status, why)
  return {
    kind,
    message: `生成未成功（${job.status}）${why ? `：${why}` : ''}`,
    hint: HINTS[kind],
  }
}

/**
 * 受理后的进度文案。
 *
 * 真链路（`tellurion-agent:pkg/copilot/copilot.go` 的 run）：LLM → 静态检查 →
 * 沙箱编译（最多重试 2 次）→ 资产登记 → **停在 promote 人工闸门**，不进回测。
 * 旧文案写的是「LLM → 沙箱编译 → 回测」，把两件没发生的事说了：漏了静态检查与
 * 资产登记，又把「回测」说成这条链的终点 —— 而这条链的终点是闸门。
 */
export function copilotAcceptedText(jobId: string): string {
  return (
    `已受理（job ${jobId.slice(0, 8)}…）：` +
    'LLM → 静态检查 → 沙箱编译 → 资产登记 → 人工 promote 闸门' +
    '（这条链不会自动跑回测）'
  )
}

/**
 * 从闸门拦下的 `build_error` 里取 promote 坐标。
 *
 * agent 在 `stopAtGate` 时把坐标逐字写进这句
 * （`tellurion-agent:pkg/copilot/copilot.go:667-669`）：
 * `编译通过并已登记资产坐标（carrier=wasm strategy_id=st_x version_hash=abc）；…`
 * —— 这是前端唯一能拿到这个版本的路径（job 读面不发资产字段）。
 *
 * 取不到就返回 `null`，**绝不**从别处凑一个 id 出来：坐标错了会把 promote 打到
 * 另一个版本上，那比没有按钮更坏。
 */
export function parsePromoteTarget(buildError?: string | null): PromoteTarget | null {
  const text = buildError || ''
  const stop = '[^\\s）；);,，。]*'
  const sid = text.match(new RegExp(`strategy_id=(${stop})`))
  const hash = text.match(new RegExp(`version_hash=(${stop})`))
  if (!sid?.[1] || !hash?.[1]) return null
  return { strategyId: sid[1], versionHash: hash[1] }
}
