---
status: active
last-verified: 2026-10-20
verified-by: 功能边界固化（三份契约：db / api / dataflow）
---

# DB Schema — tellurion-ui

> **所有权声明**：本仓**不持有任何数据库表**，也不连接数据库。它是纯呈现层：所有数据经 `/api` 取。

**唯一"数据形状"的权威**是 core 的 `openapi.yaml`（被 Go `//go:embed` 嵌进二进制，`GET /api/openapi.yaml` 直出）。
> 上级依据：`tellurion:docs/design/qt-decoupling/data-service-contract-and-ownership.md` §1 —— **DDL 只有一个 owner**，同一个 PG 实例、每服务一个 schema，将来拆库是"按 schema 搬走"而不是重写。
> 本文件是本仓表结构的**唯一真相源**：代码里的建表语句与它不一致时，**改代码**；要改表结构，先改本文件（结构级变更还要立 ADR）。

## 1. 归属表

> **无表**。
>
> 本仓不建表、不迁移、不连接数据库。曾经出现过的诱惑是"前端直连 PG 做个快捷报表" —— 那是**红线**：一旦直连，鉴权、字段语义、版本兼容全部失控，且前端会成为第二个写者。

| 数据 | 真实 owner | 本仓怎么用 |
|---|---|---|
| 回测结果 / 指标 | core / `run` | 经 `/api/backtest` 等端点 |
| 行情 / 因子值 | `tellurion-data` | 经 `/api/market`、`/api/factors` |
| 实验与 Copilot | `tellurion-agent` | 经 `/api/{copilot,explore}` 反代 |
| 鉴权 / 会话 | core | `/api/auth` |

## 2. 只读输入（不属于本仓，禁止写入）

不适用（不直接访问数据层）。

## 3. 红线

1. **不直连 DB**（任何形态：驱动、连接串、绕过 `/api`）。
2. **不复制 `openapi.yaml`**：契约在 core，复制必漂移。
3. **不做服务端逻辑**：`web/` 里没有 BFF 生产路径。
4. **e2e 红就是红**：已知失败用 `test.fixme("AUD-61: 归因")` 显式登记，**不改断言消红**。
5. **设计系统单一基准**：`docs/design/` 是 v2.0 的唯一基准，页面向它对齐。

## 4. 数据治理（前端无表）

- 本仓**不建表、不连库**：所有数据经 core / 服务的 HTTP 面取得。
- 前端**没有本地持久化真相**：`localStorage` 只允许放 UI 偏好（列宽、折叠、上次筛选），**不许放业务数据** —— 否则刷新与多端不一致，且无法审计。
- 需要"离线可用"时走**显式**缓存层（带 `etag` / 版本号 / 过期时间），不做隐式兜底。
- 展示层的口径问题（单位、复权、时区）以 contracts 里的类型为准，**不在前端二次换算**。

## 5. 待定

- 无（本仓不涉及数据库）。
