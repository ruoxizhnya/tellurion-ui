---
status: active
last-verified: 2026-11-12
verified-by: 2026-11-12 W7 收口批次（A4 授权）——`UI-NPM-AUDIT-FIX`（audit high 清零）/`UI-RUNBOOK-GAP`（新增 runbook）/`UI-SCREEN-CONSUMER`（count 5xx 降级）/`UI-HEALTHCHECK`（镜像 HEALTHCHECK）四单收口并归档，`UI-COPILOT-GATE-SURFACE` b 腿落地（a 腿待角色裁决）、`UI-LEDGER-SELF-CONSISTENCY` 订正 AGENTS.md / ARCHITECTURE.md 与子台账 B-05/G9 并写明主/子台账分工（已归档）；`UI-FACTOR-CITATION-RETIRED` 仍待产品裁决「下线抽屉」或「保留退役提示」。此前：2026-11-11 全面审查 W7 台账立单（A5 授权）——新立 5 条六字段单，证据坐标引 ODR-068/069/072/073（`tellurion-docs:docs/archive/odr/`）；同轮撤掉与下文两条 ⬜ 自相矛盾的「本仓当前没有未做项」boilerplate（W1-F6），并给既有 `UI-FACTOR-CITATION-RETIRED` 补审查确认指针（W2-F7，dedup 不新立单）。此前：2026-11-10 晚 AUD-61 收口——4 条视觉基线在原生三服务栈上逐张核对后重生成、整份 `visual-regression.spec.ts` 复跑 **12 passed**；破坏验证（隐藏 `.nav-tiles`）→ 2% 红，逐字节还原后复绿；`e2e/tests` 现存 `test.fixme` = **0**。此前：2026-11-10 AUD-63 收口补充——core `/api/market/index` 改为本地供数后「有读数」支真栈跑通。
---

# TASKS — tellurion-ui 未完成项

> **归档说明（2026-11-11）**：本文件已瘦身为「只装未做的事」。2026-11-10 及以前已收口（✅）的任务原文、施工记录、验收输出与破坏验证，已逐字移入 [`docs/archive/tasks-archive-2026-11.md`](archive/tasks-archive-2026-11.md)；该文件顶部有「检索索引」表（ID / 标题 / 收口日期 / commit / 证据链接）。检索：`grep -n "<任务ID或commit>" docs/archive/tasks-archive-2026-11.md`。
>
> 状态：`⬜ 待做` / `🔶 进行中` / `⛔ 阻塞（有未解除前置）` / `⏸ 挂起（外部依赖或已裁决暂不实施；**不计入开放项**，重开须另立单并满足该条「重开条件」）` / `✅ 完成（附日期，随即移入归档）`

## 一、未做 / 挂起 / 外部依赖

> 本节 = 既有 1 单（`UI-FACTOR-CITATION-RETIRED`，待产品裁决）+ `UI-COPILOT-GATE-SURFACE` 的 a 腿（b 腿已落，a 腿待角色裁决）。全面审查 W7 新立的 5 单中，`UI-NPM-AUDIT-FIX`、`UI-RUNBOOK-GAP`、`UI-HEALTHCHECK`、`UI-SCREEN-CONSUMER`、`UI-LEDGER-SELF-CONSISTENCY` 已于 2026-11-12 收口并移入归档；此前已收口单的正文与施工记录同样全部在归档文件里。**本节有两单在等裁决（见各条「重开条件」），不是没人做。**
>
> **主/子台账分工（D13，2026-11-12 定）**：本文件装**跨仓 / 运维 / 一致性**类单，是「本仓现在在做什么」的唯一入口；`docs/design/stitch_quantlab_ux_redesign/TASKS.md` 装 **UX 重构功能项**（A/B 组与 G 缺口）。两处**互不收录、也不互相索引开放项**；某条单只出现在一处，出现第二处即视为重复立单。

### UI-FACTOR-CITATION-RETIRED · 因子引用抽屉仍在调用已退役的 `GET /api/factors/:name` [P2] ⬜

- **① 目标**：把 `FactorCitation.vue` 从「读取 factor_cache 行」改成显式的「能力已退役」态，避免 core 返回 410 时被渲染成通用错误。
- **② 上下文**：core 于 2026-11-11（C8 / ADR-037 §5 / ADR-041）把 `GET /api/factors/:factor_name` 显式退役为 `410 Gone` + 机器码 `factor_http_surface_retired`，不再反代 data。本仓 `web/src/api/factor.ts` 仍调用该路径，`FactorCitation.vue` 只把 404 当「无行」、其余都落 `errorMessage`，因此 410 会显示成一条含状态码的错误；`e2e/tests/evidence-probe.spec.ts` 的 `page.route('**/api/factors/**')` mock 也仍按 200/404 写。
- **③ 要求**：① `getFactorCitation` 的调用方识别 410 + `factor_http_surface_retired`，渲染「该能力当前未提供/已退役」而不是通用错误；② 视产品取舍决定是否整体下线该抽屉入口（需产品决定，不在本单自拍）；③ e2e mock 更新为 410，断言退役文案；④ 不恢复任何反代或新端点。
- **④ 约束与非目标**：不改 core 路由、不复制 openapi；不在前端伪造因子数值。
- **⑤ 验收**：`npm run build` / `npm test` 绿；组件测试覆盖 410 退役分支；e2e 不再把 404 当唯一空态。
- **⑥ 边界**：`web/src/api/factor.ts`、`web/src/components/factor/`、`e2e/tests/evidence-probe.spec.ts`。
- **owner**：待定
- **重开条件**：产品决定「因子引用抽屉是下线还是保留只读提示」后即可开工；若 core 按 ADR-041 重开因子读面，则本单作废并改指新契约。
- **审查确认（2026-11-11 W7，dedup 不新立单）**：全面审查 W2-F7 复核 `web/src/api/factor.ts:20` 仍死调已退役 `GET /api/factors/:name`（410 `factor_http_surface_retired`），与本单前提一致；证据见 ODR-069（`tellurion-docs:docs/archive/odr/odr-069-audit-wave2-core-architecture.md`）W2-F7 行。

### UI-COPILOT-GATE-SURFACE · Copilot 把 promote 闸门拦下误报成「沙箱未启用」，且无人类 promote 操作面 [P1] 🔶（b 腿 ✅ 2026-11-12；a 腿待角色裁决）

- **① 目标**：让主任在 Copilot 看到的终态文案**诚实**（闸门拦下 ≠ 沙箱未启用），并有一条**可操作的人工 promote 路径**，使 ADR-023「人是闸门」在产品面落地，而不是呈现为「永远失败」。
- **② 上下文（2026-11-11 全面审查 W6-F2 ★H，证据 ODR-073 `tellurion-docs:docs/archive/odr/odr-073-audit-wave6-service-repos-frontend.md`；裁决 D3=b 先行 + a 立案）**：后端闸门 fail-closed **正确**（agent `copilot.go:666-669` / `stopAtGate:708-709` 终态 `sandbox_rejected`，`api-schema.md:92/:168-172` 诚实成文四成因；`generated`/`backtest_complete` 是契约刻意保留的预留态）。缺口在 UI 与人类侧：① `web/src/pages/Copilot.vue:89-92` 对**一切** `sandbox_rejected` 追加「（沙箱未启用：需配置 copilot.working_dir…）」——对今天占主导的**闸门拦下**路径是假话；② `:71` 进度文案「生成中（LLM → 沙箱编译 → **回测**）」承诺不存在的回测跳（agent 今天不跑回测，`copilot.go:660`）；③ `:78-84` 仍处理 `backtest_complete`（白名单保留是契约要求，但进度文案撒谎）；④ 全 ui 仓 grep `promote|promote_gate|blocked_reason` **零命中**，唯一 promote 端点 = strategy `POST .../versions/{hash}/promote` 只认 `service` + `X-Actor`，主任以管理员身份调也不通。
- **③ 要求（分两腿，b 先行不依赖角色裁决）**：**b 腿（先行）**：① 订正 Copilot.vue 文案——`sandbox_rejected` 按 `build_error` 区分「闸门拦下」（提示「编译已通过，待人工 promote」）与「沙箱/资产/链故障」，不再一律说「沙箱未启用」；② 进度文案去掉「→ 回测」假跳（改为「LLM → 沙箱编译 → 人工闸门」）；③ 本仓 `docs/runbook.md`（与 `UI-RUNBOOK-GAP` 协同）写成文人工 promote 路径：主任拿 service token + `X-Actor` curl strategy promote 端点（可审计）。**a 腿（立案，须先裁角色）**：④ UI promote 按钮经 core 反代到 strategy——**前置 = 裁「人 promote 走什么身份」**（strategy 策略表今天只认 service；admin 代调还是给主任签发 service token 未定），角色裁决前不落按钮。
- **④ 约束与非目标**：不改后端闸门 fail-closed 语义（W4 A-3 ✅ 不动）；不删 `generated`/`backtest_complete` 白名单（契约刻意保留）；不在前端伪造 promote 成功；a 腿角色未裁前不擅自给 strategy 策略表加 admin 档；不复制 openapi。
- **⑤ 验收**：b 腿——组件测试断言「闸门拦下」终态文案不含「沙箱未启用」、含「待人工 promote」；runbook 有成文 curl promote 步骤且真栈跑通一次（A4 授权）；破坏验证 = 把文案改回一律「沙箱未启用」⇒ 用例红，还原复绿。a 腿——角色裁决落定后另验收（按钮经反代 promote 成功 + 审计留痕）。`npm run build`/`test` 绿。
- **⑥ 边界**：本仓 `web/src/pages/Copilot.vue` + `docs/runbook.md`；a 腿的 core 反代归 `tellurion`、strategy 角色策略归 `tellurion-strategy`（须先裁）；后端闸门行为归 agent（不动）。
- **owner**：待定
- **施工记录（2026-11-12，b 腿）**：新增 `web/src/utils/copilot.ts` 作为终态文案的唯一口径（按 `build_error` 分 `promote_gate` / `sandbox_unavailable` / `asset_register` / `chain_trace` / `unknown`，**认不出就不补解释**），`Copilot.vue` 改用它；进度文案改为 `LLM → 静态检查 → 沙箱编译 → 资产登记 → 人工 promote 闸门（这条链不会自动跑回测）`。用例 `web/src/pages/Copilot.test.ts`（4 例，真组件 + 假后端）钉住三条判据。破坏验证：把失败分支改回「一律追加沙箱未启用」⇒ 2 例红（`闸门拦下` / `认不出原因`），逐字节还原后 4 例绿。**a 腿未做**：仍待裁「人 promote 走什么身份」（service token 签发 vs admin 代调），裁决前不给 strategy 加档、不落按钮。

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
