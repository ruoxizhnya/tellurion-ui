---
status: active
last-verified: 2026-11-12
verified-by: 2026-11-12 跨仓伞 `X-CI-RACE-STATICCHECK` 的 ui 腿——前端 CI 在 `Test` 之后补 `Build`（`npm run build`）门，本地真跑退出码 0（vite build 6.96s，产物正常）；本仓无 Go 代码，`-race`/`staticcheck` 由 Go 仓各自承担；2026-11-12 W7 收口批次（A4 授权 + 两处裁决）——`UI-COPILOT-GATE-SURFACE` b 腿 + a 腿全部落地并归档（a 腿按「登录者自己的 JWT」裁决施工，含组件测试与破坏验证；端到端成功态的两条跨仓前置写成归档条目的重开条件）；`UI-NPM-AUDIT-FIX`（audit high 清零，13 条 moderate 的不修理由 + 重开条件已写进归档）/`UI-RUNBOOK-GAP`（新增 runbook，`SERVICE.md` 的 `truth.runbook` 已订正）/`UI-SCREEN-CONSUMER`（count 5xx 降级）/`UI-HEALTHCHECK`（镜像 HEALTHCHECK）四单收口并归档；`UI-LEDGER-SELF-CONSISTENCY` 订正 AGENTS.md / ARCHITECTURE.md 与子台账 B-05/G9 并写明主/子台账分工（已归档）；`UI-FACTOR-CITATION-RETIRED` 按裁决改为退役说明页（保留入口、删除 `api/factor.ts`，已归档）；另三条新发现（选股失败冒充空结果、a08 写死总数、dashboard 假定空历史）同批收口。**台账现状：0 张开放单。** 此前：2026-11-11 全面审查 W7 台账立单（A5 授权）——新立 5 条六字段单，证据坐标引 ODR-068/069/072/073（`tellurion-docs:docs/archive/odr/`）；同轮撤掉与下文两条 ⬜ 自相矛盾的「本仓当前没有未做项」boilerplate（W1-F6），并给既有 `UI-FACTOR-CITATION-RETIRED` 补审查确认指针（W2-F7，dedup 不新立单）。此前：2026-11-10 晚 AUD-61 收口——4 条视觉基线在原生三服务栈上逐张核对后重生成、整份 `visual-regression.spec.ts` 复跑 **12 passed**；破坏验证（隐藏 `.nav-tiles`）→ 2% 红，逐字节还原后复绿；`e2e/tests` 现存 `test.fixme` = **0**。此前：2026-11-10 AUD-63 收口补充——core `/api/market/index` 改为本地供数后「有读数」支真栈跑通。
---

# TASKS — tellurion-ui 未完成项

> **归档说明（2026-11-11）**：本文件已瘦身为「只装未做的事」。2026-11-10 及以前已收口（✅）的任务原文、施工记录、验收输出与破坏验证，已逐字移入 [`docs/archive/tasks-archive-2026-11.md`](archive/tasks-archive-2026-11.md)；该文件顶部有「检索索引」表（ID / 标题 / 收口日期 / commit / 证据链接）。检索：`grep -n "<任务ID或commit>" docs/archive/tasks-archive-2026-11.md`。
>
> 状态：`⬜ 待做` / `🔶 进行中` / `⛔ 阻塞（有未解除前置）` / `⏸ 挂起（外部依赖或已裁决暂不实施；**不计入开放项**，重开须另立单并满足该条「重开条件」）` / `✅ 完成（附日期，随即移入归档）`

## 一、未做 / 挂起 / 外部依赖

> **当前没有未做的单。** 2026-11-12 W7 收口批次后，全部六字段单（含 `UI-COPILOT-GATE-SURFACE` b 腿 + a 腿、`UI-FACTOR-CITATION-RETIRED`、三条 e2e / 失败态新发现）均已收口并移入 [`docs/archive/tasks-archive-2026-11.md`](archive/tasks-archive-2026-11.md)，检索入口见该文件的「检索索引」表。`UI-COPILOT-GATE-SURFACE` 的端到端成功态有两条跨仓前置（core 反代 promote、strategy policy 打开 admin/trader），已写成该归档条目的「重开条件」，**不计入本仓开放项**。
>
> **主/子台账分工（D13，2026-11-12 定）**：本文件装**跨仓 / 运维 / 一致性**类单，是「本仓现在在做什么」的唯一入口；`docs/design/stitch_quantlab_ux_redesign/TASKS.md` 装 **UX 重构功能项**（A/B 组与 G 缺口）。两处**互不收录、也不互相索引开放项**；某条单只出现在一处，出现第二处即视为重复立单。

## 二、跨仓指针（不在本仓，勿双写）

| 事项 | 去哪 |
|---|---|
| 后端契约与接口形状 | `tellurion-contracts:docs/TASKS.md` |
| core 侧消费面 | `tellurion:docs/TASKS.md` |

## 三、已判定不重录（记录在案，不计开放项）

### UI-VISUAL-BASELINE-2026-11-12 · 视觉基线 12 条中 2 条红属非真实漂移，**不重录** ✅

- **① 判定依据（比例）**：`visual-regression.spec.ts` 全量 12 条 = **10 passed / 2 failed**，失败两条的像素差异分别为
  - `desktop`：2593 / 921600 px = **0.281%**
  - `tablet`：6704 / 786432 px = **0.852%**
  均 < 1%，且不是结构性差异。
- **② 红区位置**：差异像素集中在①时钟/时间戳文本、②回测记录条数数字、③页面副标题时间戳、④字体抗锯齿边缘——都是「跑的时刻不同 / 数据条数不同 / 宿主字体渲染」导致，不是布局、颜色、间距或组件形状变化（画布 `#090a0c`、表面阶梯、三档文字、`#2563eb` 填充按钮、4-8px 圆角均无差异）。
- **③ 结论**：判定为**非真实视觉漂移**，**不 `--update-snapshots` 重录**（重录会把时钟/数据条数这类随运行时刻变化的文本固化成"正确答案"，反而掩盖真实回归）。若将来红区出现在布局/颜色/组件形状上，或单条差异 > 1%，按真实回归处理并重录。
- **④ 复跑口径**：同一原生三服务栈（真 PG + data `:8081` + analysis `:8085` + vite `:5173`），`npx playwright test e2e/tests/visual-regression.spec.ts`；判定先看 `test-results/` 的 `diff.png` 红区位置，再看比例，最后才决定是否重录。
