---
status: active
last-verified: 2026-11-10
verified-by: 2026-11-10 晚 AUD-61 收口——4 条视觉基线在原生三服务栈（真 PG 16.15 `127.0.0.1:5433` 库 `tellurion_ui_e2e` + data `:8081` + analysis `:8085` + vite `:5173`）上先取「实际截图」逐张按 DESIGN.md v2.0 核对（画布 `#090a0c` / 表面阶梯 / 三档文字 / `#2563eb` 填充按钮 / 4-8px 圆角 / Inter），再 `--update-snapshots` 重生成、整份 `visual-regression.spec.ts` 复跑 **12 passed**、`show-trace` 无红；破坏验证（临时 `addStyleTag` 隐藏 `.nav-tiles`）→ 该条 10932 px（2%）红，逐字节还原后 **1 passed**；`e2e/tests` 现存 `test.fixme` = **0**，AUD-61 由 🔶 翻 ✅。此前：2026-11-10 晚 AUD-61 ① 批数据腿收口——真 PG（库 `tellurion_e2e`）播 262 根 600519.SH 日线后，`POST /api/backtest` 真引擎 200 `completed`（13 笔交易），`backtest history` 用例删 fixme 后真栈 **1 passed**。此前：2026-11-10 AUD-63 收口补充——core `/api/market/index` 改为本地供数后「有读数」支真栈跑通，AUD-63 由 🔶 翻 ✅。此前：AUD-61 ① 批清 11 条 fixme（14 passed / EXIT=0）。
---

# TASKS — tellurion-ui 未完成项

> **归档说明（2026-11-11）**：本文件已瘦身为「只装未做的事」。2026-11-10 及以前已收口（✅）的任务原文、施工记录、验收输出与破坏验证，已逐字移入 [`docs/archive/tasks-archive-2026-11.md`](archive/tasks-archive-2026-11.md)；该文件顶部有「检索索引」表（ID / 标题 / 收口日期 / commit / 证据链接）。检索：`grep -n "<任务ID或commit>" docs/archive/tasks-archive-2026-11.md`。
>
> 状态：`⬜ 待做` / `🔶 进行中` / `⛔ 阻塞（有未解除前置）` / `⏸ 挂起（外部依赖或已裁决暂不实施；**不计入开放项**，重开须另立单并满足该条「重开条件」）` / `✅ 完成（附日期，随即移入归档）`

## 一、未做 / 挂起 / 外部依赖

**本仓当前无未做 / 挂起 / 外部依赖项**（截至 2026-11-11 台账重整）。已收口单的正文与施工记录全部在归档文件里。

### UI-FACTOR-CITATION-RETIRED · 因子引用抽屉仍在调用已退役的 `GET /api/factors/:name` [P2] ⬜

- **① 目标**：把 `FactorCitation.vue` 从「读取 factor_cache 行」改成显式的「能力已退役」态，避免 core 返回 410 时被渲染成通用错误。
- **② 上下文**：core 于 2026-11-11（C8 / ADR-037 §5 / ADR-041）把 `GET /api/factors/:factor_name` 显式退役为 `410 Gone` + 机器码 `factor_http_surface_retired`，不再反代 data。本仓 `web/src/api/factor.ts` 仍调用该路径，`FactorCitation.vue` 只把 404 当「无行」、其余都落 `errorMessage`，因此 410 会显示成一条含状态码的错误；`e2e/tests/evidence-probe.spec.ts` 的 `page.route('**/api/factors/**')` mock 也仍按 200/404 写。
- **③ 要求**：① `getFactorCitation` 的调用方识别 410 + `factor_http_surface_retired`，渲染「该能力当前未提供/已退役」而不是通用错误；② 视产品取舍决定是否整体下线该抽屉入口（需产品决定，不在本单自拍）；③ e2e mock 更新为 410，断言退役文案；④ 不恢复任何反代或新端点。
- **④ 约束与非目标**：不改 core 路由、不复制 openapi；不在前端伪造因子数值。
- **⑤ 验收**：`npm run build` / `npm test` 绿；组件测试覆盖 410 退役分支；e2e 不再把 404 当唯一空态。
- **⑥ 边界**：`web/src/api/factor.ts`、`web/src/components/factor/`、`e2e/tests/evidence-probe.spec.ts`。
- **owner**：待定
- **重开条件**：产品决定「因子引用抽屉是下线还是保留只读提示」后即可开工；若 core 按 ADR-041 重开因子读面，则本单作废并改指新契约。

### UI-RUNBOOK-GAP · 本仓没有 runbook，托管失败与 `/api` 反代故障只有 README 零散说明 [P1] ⬜

- **① 目标**：给 ui 一份最小 runbook，让「页面打不开 / 静态资源 404 / `/api` 反代失败」有固定入口，并能一句话区分「本仓问题」还是「core 问题」。
- **② 上下文**：`SERVICE.md` 落地时实测——本仓 `docs/` 无 `runbook.md`；起停与本地开发写在 `README.md`，反代配置在 `deploy/nginx-spa.conf`，但没有成文的排查顺序。六个服务仓都有 `docs/runbook.md`，core / agent / ui 三个仓没有。
- **③ 要求**：① 覆盖「静态资源不可加载」「`/api` 404 / 502」「登录态失效」「e2e 基线红」四类现象；② 每节写「现象 → 先看什么 → 怎么判定是本仓还是 core → 处置」；③ 明确本仓无自带探针，不得把 core 的 `/health` / `/readyz` 当本仓探针；④ 完成后把 `SERVICE.md` 的 `truth.runbook` 改为该文件路径。
- **④ 约束与非目标**：不写 SLO / 告警规则 / 值班表；不改 nginx 反代策略；不在 runbook 里复制 `openapi.yaml` 或端点清单。
- **⑤ 验收**：按 runbook 能在「后端正常 / 后端停掉 / 反代配置错误」三种场景里各自定位到唯一责任仓，不出现「两边都像坏了」的结论。
- **⑥ 边界**：前端托管与反代排查归本仓；`/api` 背后的业务故障归 `tellurion`，其排查入口在 core 的 runbook（缺口见 `tellurion:docs/TASKS.md` 的 `CORE-RUNBOOK-GAP`）。
- **owner**：待定
- **重开条件**：出现第二次「页面故障但无法判断是前端还是后端」的排障经历，或接手人变更。

## 二、跨仓指针（不在本仓，勿双写）

| 事项 | 去哪 |
|---|---|
| 后端契约与接口形状 | `tellurion-contracts:docs/TASKS.md` |
| core 侧消费面 | `tellurion:docs/TASKS.md` |
