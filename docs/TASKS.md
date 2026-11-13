---
status: active
last-verified: 2026-11-13
verified-by: 2026-11-13 设计细化批开工：`UI-DESIGN-DOC-CONVERGENCE` 收口（活跃层 v1 调色板清零、token 快照与 variables.css 对齐、interaction.md 删虚构 store；新增 `scripts/check-design-docs.mjs` + CI Guard 步 + 5 例夹具测试；双向破坏验证通过）；此前：设计细化批立单（只立单不施工）：主台账新立 `UI-DESIGN-DOC-CONVERGENCE`（档 5，六字段，设计文档 v1 残留收敛）；子台账新立 A-12~A-15（校准驾驶舱 / 导航 IA 15→14 / 候选卡三要素 / 晨间简报，各 6 断言 + 六字段），A-04 断言 2/8 暂缓解除并入 A-13；两处前提订正（15→9 无权威清单改按 §3.2；PathSparkline 无数据归 G1）与一处放置裁决（S2 改审阅台 tab）见子台账更新记录；此前：2026-11-13 主任裁决落地 `UI-THEME-TOGGLE`（A 移除）与 `UI-INDUSTRY-ENTRY`（B 当期仅 API）；两条条目标 ✅ 已裁决并保留原文记录；视觉基线逐张核对后按需重录；此前：2026-11-13 立单 `UI-E2E-SYNC-ISOLATION`（data-sync e2e 与全局同步队列隔离；只立单不实施，六字段含队列实况与 tushare 代理拒连证据；重开条件 = data 侧提供队列隔离或窄 scope 夹具）；2026-11-13 `UI-PAGE-INVENTORY` 收口（ARCHITECTURE §3.1 拆为「3.1.1 页面全集 20 行 + 3.1.2 增量登记」，新增 `scripts/check-page-inventory.mjs` 接入 CI 守卫步；破坏验证：新建未登记页面 → 1，坏文档链接 → 1，恢复后 0）；2026-11-13 `UI-FACTOR-RESEARCH-LABEL` 收口（侧栏/标签页/页面 H1 三处统一为「因子证据（已退役）」，路由 `/factors` 不变；5 张含侧栏的视觉基线逐张确认差异仅在标签像素后重录，重跑 12 passed；导航相关 6 spec 42 passed；643 例单测绿）；2026-11-13 `UI-CI-COVERAGE` 收口（实测基线 lines 66.50 / statements 65.65 / branches 51.60 / functions 61.35，门 = 下浮 2 点；CI 新增 Coverage gate + 报告 artifact；破坏验证删 `api/client.test.ts` → functions 58.48% 红、退出码 1，逐字节还原后绿）；`UI-PLAYWRIGHT-TRIAGE-2026-11-13` 收口（7 条 Playwright 失败逐条分诊：全部为用例陈旧，产品缺陷 0 条；W5-1~W5-5 已修；真栈全量复跑 218 passed / 0 failed / 2 skipped（16:16 首跑；18:20 改造后复跑受 data-service 队列积压影响 7 条 data-sync 红，见 §一 健康度，非 UI 回归））；此前：2026-11-13 五角审查立单（只立单不施工）——档 2（产品设计）新立 `UI-INDUSTRY-ENTRY` ⏸ / `UI-THEME-TOGGLE` ⏸（均待主任裁决）、`UI-FACTOR-RESEARCH-LABEL` ⬜；档 4（测试）新立 `UI-PLAYWRIGHT-TRIAGE-2026-11-13` ⬜ / `UI-CI-COVERAGE` ⬜；档 5（文档与代码一致性）新立 `UI-PAGE-INVENTORY` ⬜；此前：2026-11-12 跨仓伞 `X-LOW-CLEANUP` 的 ui 腿——新增 `scripts/check-no-openapi.mjs` 守卫（ADR-0001：openapi 只住 core），CI 在前端 job 末尾加 Guard 步；破坏验证：复制一份 `openapi.yaml` ⇒ EXIT=1，删除后 ⇒ EXIT=0；2026-11-12 跨仓伞 `X-CI-RACE-STATICCHECK` 的 ui 腿——前端 CI 在 `Test` 之后补 `Build`（`npm run build`）门，本地真跑退出码 0（vite build 6.96s，产物正常）；本仓无 Go 代码，`-race`/`staticcheck` 由 Go 仓各自承担；2026-11-12 W7 收口批次（A4 授权 + 两处裁决）——`UI-COPILOT-GATE-SURFACE` b 腿 + a 腿全部落地并归档（a 腿按「登录者自己的 JWT」裁决施工，含组件测试与破坏验证；端到端成功态的两条跨仓前置写成归档条目的重开条件）；`UI-NPM-AUDIT-FIX`（audit high 清零，13 条 moderate 的不修理由 + 重开条件已写进归档）/`UI-RUNBOOK-GAP`（新增 runbook，`SERVICE.md` 的 `truth.runbook` 已订正）/`UI-SCREEN-CONSUMER`（count 5xx 降级）/`UI-HEALTHCHECK`（镜像 HEALTHCHECK）四单收口并归档；`UI-LEDGER-SELF-CONSISTENCY` 订正 AGENTS.md / ARCHITECTURE.md 与子台账 B-05/G9 并写明主/子台账分工（已归档）；`UI-FACTOR-CITATION-RETIRED` 按裁决改为退役说明页（保留入口、删除 `api/factor.ts`，已归档）；另三条新发现（选股失败冒充空结果、a08 写死总数、dashboard 假定空历史）同批收口。**台账现状（2026-11-12 时点，已被本轮 2026-11-13 立单覆盖，勿引用）：当日 0 张开放单；UX 子台账开放项见 §一 末表（B-03 / B-05 / V-2 / V-3 / A-04 断言 2·8）。** 2026-11-12 UX 收尾批（ui 仓，不改后端）：`A-09` 纸交易观测台（`9ca2a61`，四块齐备；外部信号流 `97e934d` 接 core 新补的 `GET /api/signals`）、`A-10` 三缺屏（5 commit）、`A-11` 自托管 latin 子集（`01b5baa`，ODR-001，91.4 KiB）、`B-01` seq 升序用例（`416d598`）、`B-02` 审阅台（`efc6cef`，近似版显式标注）、`B-04` 三页合一（`08e95f1`）、`B-06` 三干预（`efc6cef`，接真端点）、`A-04` 断言 5（`319004c`+`a540f65`）；**事实订正**：G1/G2/G3/G4/G6 由「无」改为已落地，A-10 断言 3 由 5→4，B-05 归口由 analytics 改为 core（ADR-038）。此前：2026-11-11 全面审查 W7 台账立单（A5 授权）——新立 5 条六字段单，证据坐标引 ODR-068/069/072/073（`tellurion-docs:docs/archive/odr/`）；同轮撤掉与下文两条 ⬜ 自相矛盾的「本仓当前没有未做项」boilerplate（W1-F6），并给既有 `UI-FACTOR-CITATION-RETIRED` 补审查确认指针（W2-F7，dedup 不新立单）。此前：2026-11-10 晚 AUD-61 收口——4 条视觉基线在原生三服务栈上逐张核对后重生成、整份 `visual-regression.spec.ts` 复跑 **12 passed**；破坏验证（隐藏 `.nav-tiles`）→ 2% 红，逐字节还原后复绿；`e2e/tests` 现存 `test.fixme` = **0**。此前：2026-11-10 AUD-63 收口补充——core `/api/market/index` 改为本地供数后「有读数」支真栈跑通。
---

# TASKS — tellurion-ui 未完成项

> **归档说明（2026-11-11）**：本文件已瘦身为「只装未做的事」。2026-11-10 及以前已收口（✅）的任务原文、施工记录、验收输出与破坏验证，已逐字移入 [`docs/archive/tasks-archive-2026-11.md`](archive/tasks-archive-2026-11.md)；该文件顶部有「检索索引」表（ID / 标题 / 收口日期 / commit / 证据链接）。检索：`grep -n "<任务ID或commit>" docs/archive/tasks-archive-2026-11.md`。
>
> 状态：`⬜ 待做` / `🔶 进行中` / `⛔ 阻塞（有未解除前置）` / `⏸ 挂起（外部依赖或已裁决暂不实施；**不计入开放项**，重开须另立单并满足该条「重开条件」）` / `✅ 完成（附日期，随即移入归档）`

## 一、未做 / 挂起 / 外部依赖

> **本仓当前开放项（2026-11-13 口径，以本表为准）**：`UI-E2E-SYNC-ISOLATION` ⬜（2026-11-13 新立，只立单未实施）；`UI-DESIGN-DOC-CONVERGENCE` ✅ 已于 2026-11-13 收口（不再计开放项）。**已裁决并落地（保留原文记录、不计开放项）**：`UI-INDUSTRY-ENTRY` ✅ 选 B 当期仅 API、不做界面；`UI-THEME-TOGGLE` ✅ 选 A 移除控件（深色为唯一验收基线）。2026-11-13 五角审查新立的 4 条（`UI-PLAYWRIGHT-TRIAGE-2026-11-13` / `UI-CI-COVERAGE` / `UI-FACTOR-RESEARCH-LABEL` / `UI-PAGE-INVENTORY`）已于当日全部收口并归档。2026-11-12 W7 批次的六字段单（含 `UI-COPILOT-GATE-SURFACE` b 腿 + a 腿、`UI-FACTOR-CITATION-RETIRED`、三条 e2e / 失败态新发现）均已收口并移入 [`docs/archive/tasks-archive-2026-11.md`](archive/tasks-archive-2026-11.md)，检索入口见该文件的「检索索引」表。`UI-COPILOT-GATE-SURFACE` 的端到端成功态有两条跨仓前置（core 反代 promote、strategy policy 打开 admin/trader），已写成该归档条目的「重开条件」，**不计入本仓开放项**。
>
> **e2e 健康度（2026-11-13 实测，勿再写"8/8 spec 全绿、0 open"）**：31 spec / 220 例。**16:16 首跑 218 passed / 0 failed / 2 skipped（5.9m）**；**18:20 改造后复跑 211 passed / 7 failed / 2 skipped（16.7m），7 条全在 data-sync 四件套**，根因是 data-service **单 worker 串行 + 全局队列**：队列里排着前序用例留下的全市场级 `ohlcv_daily` 作业（worker 日志 `fetched=577548 ... in 14m15s`），后续窄范围用例 30s 内等不到终态而红；**与 UI 代码无关**（该轮只改了标签文案/文档/CI/覆盖率配置）。这是 e2e 的**测试隔离缺陷 + 外部依赖**，**已立单 `UI-E2E-SYNC-ISOLATION`（只立单未实施）**，处置前不要拿"全绿"当判据。**排空观测（收口后轮询，未动栈）**：pending 52 条里 7 条是全市场级 `ohlcv_daily`（423~500 标的 × 5 年，单条实测 14m15s / 577,548 行，当前跑的那条已超 1 小时），按速率排空约 8~10 小时，定点复跑须等队列恢复后另做。2 skipped 为 `auth-login-flow.spec.ts` 的开鉴权形态与引导流程（当前栈为 open-access 且未提供 `E2E_AUTH_USER` / `E2E_AUTH_PASSWORD`，跳过理由在用例内显式写明）。`test.fixme` = 0。审查报告里的 7 条失败已由 `UI-PLAYWRIGHT-TRIAGE-2026-11-13` 逐条分诊并归档（首跑复现为绿，分类结论见归档的补记）。
>
> **主/子台账分工（D13，2026-11-12 定；同日修订「互不索引」条款）**：本文件装**跨仓 / 运维 / 一致性**类单，是「本仓现在在做什么」的唯一入口；`docs/design/stitch_quantlab_ux_redesign/TASKS.md` 装 **UX 重构功能项**（A/B 组与 G 缺口）。两处**互不收录正文**；某条单只在一处写正文，出现第二处即视为重复立单。**但主台账 §一 末尾必须列出子台账开放项的 ID（只列 ID，不搬正文）** —— 否则会出现「主账说 0、子账躺 10 条」的自相矛盾。

### 子台账开放项（只列 ID，正文见 [`design/stitch_quantlab_ux_redesign/TASKS.md`](design/stitch_quantlab_ux_redesign/TASKS.md)，截至 2026-11-13）

| ID | 状态 | 一句话 |
|---|---|---|
| A-12 | ✅ 完成（2026-11-13） | 校准驾驶舱 = 审阅台第二 tab（G6 消费面，2026-11-13 设计细化批新立） |
| A-13 | ✅ 完成（2026-11-13） | 导航 IA 15→14 按 §3.2（已解除 A-04 断言 2/8 暂缓，2026-11-13 新立） |
| A-14 | ✅ 完成（2026-11-13） | 候选卡三要素：六维微条 + 质疑分级 + EvidenceProbe（PathSparkline 归 G1，2026-11-13 新立） |
| A-15 | 🟢 可开工 | 晨间简报（前置 A-12/A-13/A-14 均已收口，2026-11-13 立单） |
| B-03 | 可开工 | 实验日志与采纳台账（G6 已落地：`/api/pipeline/adoption` + `/calibration`；接 A-12 tab 骨架加第三 tab） |
| B-05 | ⏸ 挂起 | 因子读面归 **core**（ADR-038）；analytics 全仓无因子端点，等 core 提供读面并新立单 |
| V-2 / V-3 | 待做（测试债） | 2 条 responsive 视觉基线仍红（`dashboard-mobile` / `backtest-tablet`）；2026-11-13 复核：与 A-13 导航改动无关（还原 `navItems.ts` 后仍红 767/1003 px，差异在页头），归 AUD-61 执行登记，不在 UX 批次内 |
| ~~A-04 断言 2/8~~ | ✅ 已解除（2026-11-13） | 前置 F11/A-06 均已 ✅，主任 2026-11-13 派工 = 批准解除；实施载体 = A-13（14 项 5 组，非旧提案 9 项），断言 2/8 要求已由 §3.2 一致性守卫与三处同源守卫覆盖 |

#### 2026-11-13 测试基建（本轮新立）

### UI-E2E-SYNC-ISOLATION · data-sync e2e 与全局同步队列隔离 [P1] ⬜

> 档 4（测试）· 来源：`UI-PLAYWRIGHT-TRIAGE-2026-11-13` 复跑补记（原"队列排空后复跑"分支不可行）· 顺序：队列恢复或 data 侧给出隔离手段后即可开工 · 依赖：data 侧队列隔离开关或窄 scope 夹具

- **① 目标**：data-sync 四件套（`data-sync.spec.ts` / `data-sync-error.spec.ts` / `data-sync-schedule.spec.ts`，含本轮 7 条红）在同步队列有积压时也能稳定通过，不再因全局串行队列而红。
- **② 上下文与背景证据（2026-11-13 实测，只读观测）**：
  - **失败形态**：改造后全量复跑 218→**211 passed / 7 failed / 2 skipped**，7 条全在 data-sync 四件套；错误是**30s 内等不到作业终态**（`pending` 一直不动），不是契约 400。7 条 = `data-sync-error:16/132/204`、`data-sync-schedule:120`、`data-sync:16/146/232`。
  - **队列实况**：`GET /api/sync/jobs` 全量 150 条中 **pending 52**；其中 **7 条是全市场级 `ohlcv_daily`**（`symbols=423~500`、`2021-11-13..2026-11-13`），已完成的同类作业实测 **14m15s / 577,548 行**；正在跑的 `16f09ec55755bc91`（同类型）**自 18:31 起 >1 小时未收尾**；连 `600000.SH` + 3 个月的窄作业也一直 pending。按此速率排空约 **8~10 小时**（这也是"等排空再复跑"不可行的原因）。
  - **数据面运行实况**：tushare 代理 `10.255.255.2:8806` **拒连**，导致 12 条 `fundamentals` 反复失败重试（历史单条失败耗时 **287s**），进一步占住串行 worker。这条对判断"要不要动队列 / 先修代理"有用。
  - **根因**：spec 每次 fan-out 全市场作业 + data-service **单 worker 串行 + 全局队列**；**不是 UI 回归**（该轮 UI 改动只有标签文案、文档、CI 配置与覆盖率阈值，不可能影响同步 worker）。
- **③ 要求**：优先走 e2e 侧隔离——四个 data-sync spec 在 `beforeAll` 用**窄 scope**（单标的 + 短窗口）建本套件专属作业，并在 `beforeAll` / `afterAll` **清理或取消本套件遗留 pending**；若 data 侧能提供**队列隔离开关**（独立队列 / 测试专用 worker）或**窄 scope 夹具**（如 `e2e_fixture` job type），改走数据面方案并在本单记录取舍。**禁止**加 `sleep`、放宽断言、把 30s 上限改大来"变绿"。
- **④ 约束与非目标**：不改 UI 产品代码；不重启、不改造共享栈（该栈归另一会话管）；不在本仓改 data-service 代码——代理拒连与 worker 并发度属**跨仓议题，只写回报不落地**；不把 e2e 计入覆盖率。
- **⑤ 验收**：队列存在 ≥1 条全市场作业（排队或在跑）时，定点跑四个 data-sync spec **全绿**且总耗时 ≤ 基线 1.5 倍；`afterAll` 后本套件不再新增 pending；破坏验证：人为把一条全市场作业塞进队列再跑仍绿（窄 scope 方案下）。
- **⑥ 边界**：`tellurion-ui/e2e`（data-sync 相关 spec 与 helpers）+ 台账；data-service 侧配合项（队列隔离、tushare 代理 `10.255.255.2:8806`、worker 并发）另报，不在本单实施。
- **重开条件**：**data 侧能提供队列隔离或窄 scope 夹具**（或代理恢复后队列可排空）即开工；在此之前，任何 data-sync 红一律先查队列深度再判定，不得直接当 UI 缺陷。

#### 2026-11-13 五角审查 · 档 2（产品设计）

### UI-INDUSTRY-ENTRY · 产业链/宏观产品入口（补 UI 或明确仅 API）[P2] ✅ 已裁决（2026-11-13）

> 档 2（产品设计）· 来源：01-product-design P2-1 · 顺序 2-3 · 依赖：主任裁决 A/B；若选 A，排在 `CORE-S1-EXIT-EVIDENCE` 之后

> **裁决（2026-11-13，主任）：选 B —— 当期仅 API，不做界面。** 理由：S1 出口前资源优先核心链路，产业链页不服务"观察窗"当期目标；但口径必须说准——UI 侧不得在任何页面或导航暗示"产业链有界面"。**落地**：`docs/design/user-flows.md` F18 与附录 B 已写明「仅 API，UI 无入口，界面待 S2 出口后再评估」；代码侧原本就零入口（`web/src` 检索 `industry|macro|产业链` 无命中），无需改动。**升级条件**：S2 出口验收后，若产业链图谱仍被列为重点场景，另立六字段单实施本条目原「A 补只读页」方案。

- **① 目标**：消除"`PRODUCT.md` L2 承诺产业链查询、UI 无任何入口"的产品面缺口。
- **② 上下文**：core 已实现并装配 4 条行业端点（`cmd/analysis/handlers_industry.go:74-77`：tree / edges / vitality / ETF 成分）与 `GET /api/macro/series`（`handlers_macro.go`；`main.go:487/493`），契约已在 `docs/openapi.yaml`；UI `web/src` 检索 `industry|macro|产业链` 零命中，`REPO-MAP.md` 也未登记。性质 = **能力已具备但未暴露**，不是缺后端，也不是"不该做"。
- **③ 要求**：建议 **A 补只读页**：在"选股与市场"下加"产业链"页，读 5 条端点，展示行业树 / 供应链边 / 行业活力 / ETF 成分 / 宏观序列；不新增后端、不做写操作。备选 **B 明确仅 API**：PRODUCT/REPO-MAP 改口径为"后端可用、暂无 UI"，UI 不加入口。
- **④ 约束与非目标**：不新增 core 端点；不把产业链做成投研结论或买卖建议；若资源优先 S1 出口，可先按 B 落文案，S2 再升级 A（升级条件写进本条）。
- **⑤ 验收**：A——页面渲染两组以上真实数据，空/错态明确，断 core ⇒ 明确错误态，组件测试 + 破坏验证；B——PRODUCT/REPO-MAP 不再让读者以为"用户可查"。
- **⑥ 边界**：UI 消费面；core 契约与数据分别归 core/data。
- **重开条件**：**已于 2026-11-13 裁决 B（当期仅 API）**，本条目不再按「待裁决」处理；界面升级须待 S2 出口验收后另立六字段单（见上方裁决块）。

### UI-THEME-TOGGLE · 主题切换死控件处置 [P3] ✅ 已裁决（2026-11-13）

> 档 2（产品设计）· 来源：01-product-design P2-3 · 顺序 2-6 · 依赖：主任裁决 A/B

> **裁决（2026-11-13，主任）：选 A —— 移除控件。** 理由：深色是唯一验收过的视觉基线，原按钮 `toggleTheme()` 只弹「开发中」，是可见死控件；半成品比没有更伤体验，主题切换也不服务"观察窗"核心价值。**落地**：`AppHeader.vue` 删除按钮、`toggleTheme()`、`MoonOutline` 与 `useMessage` 依赖；`docs/design/components.md` / `principles.md` 同步移除「主题切换」表述；视觉基线逐张核对 diff 后仅重录受控件消失影响的条目（见下「落地验证」）。
>
> **落地验证（2026-11-13）**：`npm run typecheck` 退出码 0；`npm test` **52 文件 / 643 例全绿**；页头相关 e2e（`dashboard.spec.ts` / `command-palette.spec.ts` / `rbac-open-access.spec.ts`）**19 passed**；`visual-regression.spec.ts` 12 张逐张看 diff——受影响 4 张（`dashboard` / `backtest` / `stock-screener` / `data-sync`）的差异区域全部落在页头右侧原按钮簇（逐像素核算：3 张差异 bbox 仅 y=17–40，正文 0 差异；`data-sync` 页头外仅 16 px 按钮边缘抗锯齿、低于 Playwright 阈值），**只单独重录这 4 张**；重跑 12 张 = **10 passed / 2 failed**，两条红为 `dashboard-mobile` / `backtest-tablet`（实跑截图为整页空白，属子台账 **V-2** 记录的 blind-wait race 测试债，与本次改动无关，**未重录**）。

- **① 目标**：消除"点击只弹主题切换开发中"的可见死控件。
- **② 上下文**：`AppHeader.vue:148` 的 `toggleTheme()` 仅 `message.info('主题切换功能开发中')`；工程内无主题系统或暗色切换实现。
- **③ 要求**：建议 **A 移除控件**：删按钮与函数，保留当前深色主题；备选 **B 实现**：引入完整主题切换（持久化 + 对比度校验）。建议 A——主题切换不服务"观察窗"核心价值，半成品比没有更伤体验。
- **④ 约束与非目标**：不引入新 UI 框架/主题库；不做只有开关、没有主题的中间态。
- **⑤ 验收**：A——Header 无主题按钮、无 console 报错、视觉基线按需复核；B——主题持久化 + 对比度检查通过。
- **⑥ 边界**：UI Header。
- **重开条件**：**已于 2026-11-13 裁决 A（移除）并落地**；若将来要做主题切换，须按完整主题系统（持久化 + 对比度校验）另立六字段单，不得恢复半成品开关。

#### 2026-11-13 五角审查 · 档 5（文档与代码一致性）

> 本档唯一一条 `UI-PAGE-INVENTORY` 已收口并移入归档；档 2 的 `UI-INDUSTRY-ENTRY` / `UI-THEME-TOGGLE` 已于 2026-11-13 裁决并落地（见上）。

#### 2026-11-13 设计细化批（本轮新立）

### UI-DESIGN-DOC-CONVERGENCE · 活跃设计文档收敛到 v2 真相源 [P2] ✅ 已收口（2026-11-13）

> 档 5（文档与代码一致性）· 来源：2026-11-13 UI/UX 改进报告 S1（设计系统漂移审计）· 顺序：可立即开工，与子台账 A-12~A-15 无依赖 · 依赖：无

- **① 目标**：`docs/design/` 活跃层文档不再含 v1 调色板残留与虚构代码示例，token 块与 `variables.css` 逐字一致，导航链接与现行标签一致 —— 设计文档作为「唯一真相源」可信（AGENTS.md §6：docs/design/ 是唯一基准）。
- **② 上下文与背景证据（2026-11-13 当场 grep 实测，逐条带行号）**：
  - **v1 token 块**：`docs/design/index.md:47–54` 仍写 v1 八值（`#0d1117/#161b22/#1c2333/#e6edf3/#8b949e/#58a6ff/#3fb950/#f85149`）；现行真相 `web/src/styles/variables.css:12–39` = `#090a0c/#111620/#171e2c/#e1e2eb/#c3c6d7/#b4c5ff/#10b981/#ef4444`（v2「Obsidian Precision Quant」，DESIGN.md 为基准）。
  - **v1 hex 散落**（活跃层，共 15 处）：`components.md:140,143,144,212`（含已合并的 `/copilot` 磁贴行）；`principles.md:16,31,32,88`；`pages/backtest-engine.md:170,258,259,261`；`pages/strategy-lab.md:128,130,132`。
  - **虚构代码示例**：`interaction.md:15–24` 的 `useAppStore`（含 `currentTheme: ref<'dark'|'light'>`）—— `web/src/stores/` 实测只有 auth/backtest/sync 三个 store，**app store 不存在**；主题切换已按 `UI-THEME-TOGGLE` 裁决 A 移除（2026-11-13），该示例双重失效。
  - **失效导航链接**：`index.md:30` 链向 `pages/copilot.md`（文件存在，但「策略 Copilot」是漂移别名 —— 现行入口是「策略库」`/strategy-lab`，copilot 只是路由别名）；`index.md:31`「数据同步 DataSync」是漂移别名（现行标签「数据管理」）。
  - **豁免边界**：`stitch_quantlab_ux_redesign/**` 是历史设计档案 + 台账，其旧 hex 是**刻意保留的扫页证据**（A-01/A-02 断言基线、DESIGN.md:98 候选值记录），**不在本单收敛范围**，守卫必须排除该目录。
- **③ 要求**：
  1. `index.md:47–54` token 块改为指向 `variables.css` 的指针 + 现行八值逐字抄录（或明写「真相源 = variables.css，此处仅为快照」并附核对日期）；
  2. 15 处 v1 hex 按语义替换为 v2 对应值（成功/失败/主色/背景/文字），**不机械全局替换** —— `principles.md:16` 的「正收益绿/负收益红」语义保留，只换值；
  3. `interaction.md` 删除虚构 `useAppStore` 示例，改为指向真实 store 清单（auth/backtest/sync）与「主题切换已移除（UI-THEME-TOGGLE 裁决 A）」的事实句；
  4. `index.md:30–31` 链接标签改为现行导航词（策略库 / 数据管理），`pages/copilot.md` 文件保留但顶部加「已并入策略库」注记；
  5. 新增守卫脚本 `scripts/check-design-docs.mjs`（接入 CI Guard 步，同 `check-no-openapi.mjs` 模式）：活跃层 grep v1 八值 = 0、token 块与 variables.css 一致、`interaction.md` 不出现 `useAppStore`；**排除 `stitch_quantlab_ux_redesign/**`**。
- **④ 约束与非目标**：不改 `web/src` 任何代码（本单纯文档 + 守卫）；不动 `stitch_quantlab_ux_redesign/**`（历史证据）；不改 DESIGN.md（它是 v2 基准，本单是让其他文档对齐它）；不新增跨仓相对链接（跨仓引用写 `repo:path`）；守卫不得用「放宽 grep」变绿。
- **⑤ 验收**：`node scripts/check-design-docs.mjs` 退出码 0；破坏验证双向 —— 注入一个 `#58a6ff` 到 `principles.md` → 退出码 1，还原 → 0；把 token 块改回 v1 值 → 退出码 1，还原 → 0；`npm run lint` / `typecheck` 不受影响（纯 .md + .mjs）；守卫脚本自身有夹具测试（同 `check-page-inventory.mjs` 先例）。
- **⑥ 边界**：`tellurion-ui/docs/design/`（活跃层）+ `scripts/check-design-docs.mjs` + CI Guard 步；子台账 A-12~A-15 是 UX 功能项，不在本单；DESIGN.md 与 variables.css 只读不改。

**落地（2026-11-13）**
- **改了什么**：
  - `docs/design/index.md`：token 块改为「真相源 = `variables.css`」指针 + 2026-11-13 快照（现行八值 + `--q-radius: 8px`）；目录链接 `策略 Copilot → 策略库 StrategyHub`（B-04 三页合一）、`数据同步 DataSync → 数据管理 DataSync`。
  - 15 处 v1 hex 按语义替换：`components.md:140,143,144,212`、`principles.md:16,31,32,88`、`pages/backtest-engine.md:170,258,259,261`、`pages/strategy-lab.md:128,130,132` → `#b4c5ff / #10b981 / #ef4444 / #090a0c / #e1e2eb`（`principles.md:16` 的「正收益绿 / 负收益红」语义保留，只换值）；`components.md` 的 `/copilot` 行补「已并入策略库，路由别名」。
  - `interaction.md` 1.1 删除虚构 `useAppStore`，改为真实 store 表（auth / backtest / sync）+「主题切换已移除（UI-THEME-TOGGLE 裁决 A）」事实句。
  - `pages/copilot.md` 顶部加「已并入策略库」注记（文件保留）。
  - 新增 `scripts/check-design-docs.mjs`（零依赖，Node ESM；可接 `root` 参数供夹具测试）：活跃层 v1 八值 = 0（带行号）、`index.md` token 快照与 `variables.css` 逐值一致且核心八值不得缺行、`interaction.md` 不含 `useAppStore`；递归时跳过 `stitch_quantlab_ux_redesign/**`。CI `frontend` job 末尾新增 `Guard（设计文档收敛）` 步。
  - 夹具测试 `web/src/design-docs-guard.test.ts`（5 例：干净仓绿 / 注入 v1 hex 红 / token 漂移红 / 删核心行红 / useAppStore 红，全部用真实脚本跑临时假仓）。
- **破坏验证（真做真还原）**：`node scripts/check-design-docs.mjs` → EXIT=0；向 `principles.md` 注入 `#58a6ff` ⇒ EXIT=1（报 `principles.md:90`），逐字还原 ⇒ EXIT=0；把 `index.md` 的 `--q-bg` 改回 `#0d1117` ⇒ EXIT=1（同时报调色板残留与 token 不一致两条），还原 ⇒ EXIT=0。
- **验证**：`npx vitest run src/design-docs-guard.test.ts` → 5 passed（EXIT=0）；纯 `.md` + `.mjs` 改动，`lint` / `typecheck` 不涉及新增构建产物。

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
