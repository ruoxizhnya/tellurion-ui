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

## 二、跨仓指针（不在本仓，勿双写）

| 事项 | 去哪 |
|---|---|
| 后端契约与接口形状 | `tellurion-contracts:docs/TASKS.md` |
| core 侧消费面 | `tellurion:docs/TASKS.md` |
