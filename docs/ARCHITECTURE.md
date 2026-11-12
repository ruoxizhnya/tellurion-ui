---
status: active
last-verified: 2026-11-12
verified-by: 2026-11-12 A-10 三页登记（合规 F17 / 系统管理 F18 / 走向与批量）：§3.1 页面清单落地，端点条数与形态按 core handlers 实测；此前：2026-11-12 台账自洽订正（`UI-LEDGER-SELF-CONSISTENCY`）：去掉上一版里「本仓台账没有未做的事」这句过期断言（本仓仍有开放项，见 `docs/TASKS.md` §一）。此前：代码-文档对齐审计（2026-11-11）：AUD-61（e2e 与结构脱节）与 AUD-63（票池读数）均已收口，`test.fixme` 归零。此前：功能边界固化（三份契约：db / api / dataflow，2026-10-20）
---

# 架构 — tellurion-ui

## 1. 定位

前端（Vue 3 + Vite + Naive UI）+ playwright 端到端套件。

边界极简：**只做呈现**。所有数据经 `/api`，所有契约来自 core 的 `openapi.yaml`，设计基准是 `docs/design/`（v2.0）。

## 2. 分层

```
浏览器
  pages/（路由页面） → components/（组件） → stores/（状态） → api/（请求）
        ↓  /api/*
nginx（deploy/nginx-spa.conf）—— 静态资源 + 反代
        ↓
analysis-service（:8085）→ data（:8081）/ ai（:8086）/ core 引擎
```

## 3. 组件职责

| 目录 | 职责 | 不做 |
|---|---|---|
| `web/src/pages/` | 页面与路由 | 不放业务计算 |
| `web/src/components/` | 组件（按域分目录） | 不发请求（走 stores/api） |
| `web/src/stores/` | 状态与缓存 | 不做鉴权判断（用 auth） |
| `web/src/api/` | 端点封装 | 不做 UI 逻辑 |
| `e2e/` | 端到端用例 | 不做单元测试（vitest 在 web/） |
| `deploy/` | nginx 配置 | 不含业务 |

### 3.1 页面清单（A-10 新增三页登记于此）

> core 侧 `tellurion:docs/ARCHITECTURE.md` 已声明「前端已拆仓」，页面登记
> 只在本仓维护，不在 core 重复登记（避免两处漂移）。

| 路由 | 页面 | 端点 | 备注 |
|---|---|---|---|
| `/compliance` | `pages/Compliance.vue` | `/api/compliance/*` 9 条 | 适当性 / 异常交易 / 大额日报 / 减持规则；`AbnormalAlert`、`DivestmentRule` 无 JSON tag，按大驼峰建模 |
| `/system-admin` | `pages/SystemAdmin.vue` | `/api/auth/admin/{users,audit}`、`/api/auth/{status,bootstrap}`、`/api/plugins*` 9 条 | admin 端点 403 原样展示错误态；`User`/`AuditLog` 无 JSON tag，页面只读白名单字段，不渲染 `PasswordHash` |
| `/walkforward` | `pages/WalkForwardBatch.vue` | `/api/walkforward`、`/api/batch`、`/api/batch/{id}`、`/api/batch/{id}/export/json` | 共 4 条（台账原写 5 条是含两个已退役读端点）；csv 导出后端 501，页面不画 |

## 4. 三份契约（功能的边界就在这三份文件里）

| 维度 | 文件 | 回答什么问题 |
|---|---|---|
| 数据形状 | [`db-schema.md`](db-schema.md) | 本仓拥有哪些表？谁能写？ |
| 接口形状 | [`api-schema.md`](api-schema.md) | 对外暴露什么？错误码与幂等怎么做？ |
| 流向与顺序 | [`dataflow.md`](dataflow.md) | 数据怎么流？哪里 fail-closed？ |

## 5. 依赖方向

```
（无 Go 依赖）
tellurion-ui ──(HTTP/SSE)──► analysis-service ──► data / ai / core
     └── 契约来源：core 的 openapi.yaml（只读，不复制）
```

## 6. 关键决策

- [`adr/0001-openapi-单一真相且不直连-db.md`](adr/0001-openapi-单一真相且不直连-db.md)

## 7. 非目标（明确不做）

- 不做数据聚合 / 计算
- 不做**权限判定**（`authz` 在后端）：前端只维护登录态、按后端返回的权限做**展示级**隐藏——**隐藏不等于保护**，任何以"前端不显示"为理由的授权都是在骗自己
- 不做 BFF 生产部署
- 不复制 API 契约

## 8. 分期与状态

| 阶段 | 内容 | 状态 |
|---|---|---|
| — | 设计系统 v2.0 重构 | 进行中（子项 2/5/8 待拍板，见 `docs/design/stitch_quantlab_ux_redesign/TASKS.md`） |
| AUD-61 | e2e 与结构脱节 | ✅ 2026-11-10（`test.fixme` = 0，视觉基线 12 passed） |
| AUD-63 | 票池读数口径 | ✅ 2026-11-10 |
| — | 契约变更时同步前端类型 | 持续 |
