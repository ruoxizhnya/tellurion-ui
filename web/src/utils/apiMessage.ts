import { ApiError, serverBodyText } from '@/api/client'

/**
 * 把「后端自己说的话」捞回界面（A-08 步骤 4）。
 *
 * 起因是浏览器实测：表单填一个非法 cron，告警条显示的是「请求参数有误」，而后端
 * 实际返回的是 `{"code":"bad_request","error":"invalid cron expression: expected
 * exactly 6 fields, found 3: [99 99 99]"}` —— 原话到了浏览器，被 `api/client.ts`
 * 的 `getStatusMessage()` 换成了按状态码查表的通用文案（`ApiError.body` 里仍带着）。
 *
 * 于是有了这个读取顺序：**后端原话 > 前端通用文案 > 兜底串**。
 *
 * ⚠️ 下面这段是 A-08 当时的边界声明，**已被 API-01 推翻**（2026-10-22 批准并落地）：
 * 「不在这里改 client.ts：那会一次改掉全站每一页的错误文案，还有三条既有测试钉着旧口径」——
 * 现在 `client.ts` 自己就是原话优先了（4xx），那三条测试按行为变更改掉；
 * 这个 util 因此不再是「止血」，而是同一口径在**消费侧**的读法（面板拿 `err.body` 时仍要说真话）。
 *
 * `ApiError.status >= 500` 时后端**故意**不给细节（`pkg/httpserver/errors.go:163`
 * 只在 4xx 透传 err.Error()，5xx 返回人话 + code），所以这里不做任何"猜 5xx 原因"的事。
 */
export function apiMessage(err: unknown, fallback = '请求失败'): string {
  if (err instanceof ApiError) {
    const fromBody = serverBodyText(err.body)
    if (fromBody) return fromBody
    if (err.message) return err.message
  }
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'string' && err) return err
  return fallback
}
