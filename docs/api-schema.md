---
status: active
last-verified: 2026-10-20
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
| `backtest.ts` | `/api/backtest`、`/api/runs` | 提交回测、查进度、取结果 |
| `strategy.ts` | `/api/strategies` | 策略列表 / 版本 / 选择 |
| `factor.ts` | `/api/factor` | 因子定义与因子值 |
| `market.ts` | `/api/market` | 行情与标的 |
| `sync.ts` | `/api/data` | 数据同步任务与状态 |
| `evidence.ts` | `/api/evidence` | 证据与引用（citation） |
| `copilot.ts` | `/api/copilot` | 自然语言生成（异步 job） |
| `explore.ts` | `/api/explore` | 实验探索（含 SSE 流） |
| `execution.ts` | `/api/execution` | 实盘 / paper 状态 |
| `compliance.ts` | `/api/compliance` | 合规检测结果 |
| `alerts.ts` | `/api/alerts` | 告警 |

### 关键的跨仓语义（必须与后端一致）

- **SSE**：`/api/explore/runs/{id}/stream` 的事件名 `progress` / `complete` / `close` / `error`，`progress` 的 payload 与 `GET /runs/{id}` 同形状。
- **异步 job**：`copilot/generate`、`sensitivity`、`montecarlo` 都是"提交返回 id → 轮询 / 事件"，前端不许假设同步返回。

## 2. 错误码与 fail-closed 语义

| 情况 | UI 行为 |
|---|---|
| 401 | 清 token → 跳登录（不无限重试） |
| 403 | 展示"无权限"，不隐藏入口（可解释性优先） |
| 429 | 退避重试 + 提示；**不许把 429 当成失败**（OPS-01 的教训） |
| 5xx | 展示错误码与 trace id；不自动重试写操作 |
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
