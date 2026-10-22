---
status: active
last-verified: 2026-10-22
verified-by: 功能边界固化（三份契约：db / api / dataflow）
---

# API Schema — tellurion-ui

> **契约地位**：本仓**只消费** API，不生产契约。

契约权威：core 的 `openapi.yaml`。本文件记录的是**消费面**：哪个前端模块调用哪一族端点、依赖哪些语义。
> 本文件是**本仓对外接口的唯一真相源**。代码与它不一致时，先判断谁错：契约错 → 改本文 + 立 ADR；实现错 → 改代码。
> 跨仓消费方（core / agent / ui / 其他服务）按本文件编码，**不读本仓实现**。

## 1. 接口面

### 消费面（`web/src/api/` 模块 → 后端端点族）

| 模块 | 端点族 | 用途 |
|---|---|---|
| `client.ts` | — | 统一 fetch：baseURL、超时、错误规范化、token 注入 |
| `auth.ts` / `authToken.ts` | `/api/auth` | 登录 / 刷新 / 当前用户 |
| `backtest.ts` | 现状：`/api/backtest`、`/api/ohlcv`；目标：`/api/runs`（orchestration 契约，尚无消费代码） | 提交回测、查进度、取结果、取 OHLCV 行情 |
| `strategy.ts` | `/api/strategies` | 策略列表 / 版本 / 选择 |
| `factor.ts` | `/api/factors` | 因子定义与因子值 |
| `market.ts` | `/api/market` | 行情与标的 |
| `sync.ts` | `/api/sync`、`/api/datasource` | 数据同步任务（jobs / schedules / workers / scheduler/stats）与数据源状态 |
| `evidence.ts` | `/api/evidence` | 证据与引用（citation） |
| `copilot.ts` | `/api/copilot` | 自然语言生成（异步 job） |
| `explore.ts` | `/api/explore` | 实验探索（轮询状态，无 SSE 消费） |
| `execution.ts` | `/api/execution` | 实盘 / paper 状态 |
| `compliance.ts` | `/api/compliance` | 合规检测结果 |
| `alerts.ts` | `/api/alerts` | 告警 |

### 关键的跨仓语义（必须与后端一致）

- **SSE**：本仓唯一 EventSource 是 `stores/sync.ts` 的 `/api/sync/jobs/{id}/progress` 进度流，事件名 `progress` / `complete`，payload 与 `GET /api/sync/jobs/{id}` 同形状。explore 侧无 SSE 消费（`explore.ts` 走轮询 `GET /api/explore/runs/{id}`）。
- **异步 job**：`copilot/generate`、`sensitivity`、`montecarlo` 都是"提交返回 id → 轮询 / 事件"，前端不许假设同步返回。
- **`/api/stocks/count`（票池读数）**：`count` 含已退市且等于 `by_status` 各档之和；要在市数取 `by_status.active`，**不许**在前端拿 `count` 减退市数反推（同一概念两处真相）。`by_status` 缺席或为空即"没有读数"，走显式空态。`latest_date` 键恒在：库里没行情时是显式 `null`，**null 才是没有读数，0 就是 0**（展示层的读数口径，见 `web/src/utils/format.ts`）。

## 2. 错误码与 fail-closed 语义

| 情况 | UI 行为 |
|---|---|
| 401 | 清 token → 跳登录（不无限重试） |
| 403 | 展示"无权限"，不隐藏入口（可解释性优先） |
| 429 | 退避重试 + 提示；**不许把 429 当成失败**（AUD-61 的教训） |
| 5xx | 展示错误码；不自动重试写操作 |
| 网络断 | 只影响当前请求；SSE 断线后重连拿快照 |

## 3. 幂等性与重试

- 所有 GET 可重试。
- 写操作（提交回测、生成、下单类）必须带客户端生成的幂等键或由后端提供；前端**不许自动重发写请求**（除后端明确声明幂等）。

## 4. 版本与兼容

- 后端字段只增不删（前端可忽略未知字段）。
- 破坏性变更必须 core 先改 openapi + 版本说明，再改前端。
- e2e 是兼容性的兜底：契约变更后 `npx playwright test` 应能发现。

## 5. 不提供什么（边界）

- 不提供 API 契约（在 core）
- 不做数据聚合计算（后端做）
- 不做权限模型（只消费 `/api/auth` 的结果）
- 不做 BFF 生产部署
