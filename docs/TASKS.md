---
status: active
last-verified: 2026-11-11
verified-by: 2026-11-11 全面审查 W7 台账立单（A5 授权）——新立 5 条六字段单（`UI-NPM-AUDIT-FIX` P0 / `UI-COPILOT-GATE-SURFACE` P1 / `UI-SCREEN-CONSUMER` P1 / `UI-HEALTHCHECK` P3 / `UI-LEDGER-SELF-CONSISTENCY` P3），证据坐标引 ODR-068/069/072/073（`tellurion-docs:docs/archive/odr/`）；同轮撤掉与下文两条 ⬜ 自相矛盾的「无开放项」boilerplate（W1-F6），并给既有 `UI-FACTOR-CITATION-RETIRED` 补审查确认指针（W2-F7，dedup 不新立单）。本轮只立单不修复；W5-F6 弱探针（`nc -z`）经实测属 strategy 非 analytics，见 ODR-072 订正注记。此前：2026-11-10 晚 AUD-61 收口——4 条视觉基线在原生三服务栈（真 PG 16.15 `127.0.0.1:5433` 库 `tellurion_ui_e2e` + data `:8081` + analysis `:8085` + vite `:5173`）上先取「实际截图」逐张按 DESIGN.md v2.0 核对（画布 `#090a0c` / 表面阶梯 / 三档文字 / `#2563eb` 填充按钮 / 4-8px 圆角 / Inter），再 `--update-snapshots` 重生成、整份 `visual-regression.spec.ts` 复跑 **12 passed**、`show-trace` 无红；破坏验证（临时 `addStyleTag` 隐藏 `.nav-tiles`）→ 该条 10932 px（2%）红，逐字节还原后 **1 passed**；`e2e/tests` 现存 `test.fixme` = **0**，AUD-61 由 🔶 翻 ✅。此前：2026-11-10 晚 AUD-61 ① 批数据腿收口——真 PG（库 `tellurion_e2e`）播 262 根 600519.SH 日线后，`POST /api/backtest` 真引擎 200 `completed`（13 笔交易），`backtest history` 用例删 fixme 后真栈 **1 passed**。此前：2026-11-10 AUD-63 收口补充——core `/api/market/index` 改为本地供数后「有读数」支真栈跑通，AUD-63 由 🔶 翻 ✅。此前：AUD-61 ① 批清 11 条 fixme（14 passed / EXIT=0）。
---

# TASKS — tellurion-ui 未完成项

> **归档说明（2026-11-11）**：本文件已瘦身为「只装未做的事」。2026-11-10 及以前已收口（✅）的任务原文、施工记录、验收输出与破坏验证，已逐字移入 [`docs/archive/tasks-archive-2026-11.md`](archive/tasks-archive-2026-11.md)；该文件顶部有「检索索引」表（ID / 标题 / 收口日期 / commit / 证据链接）。检索：`grep -n "<任务ID或commit>" docs/archive/tasks-archive-2026-11.md`。
>
> 状态：`⬜ 待做` / `🔶 进行中` / `⛔ 阻塞（有未解除前置）` / `⏸ 挂起（外部依赖或已裁决暂不实施；**不计入开放项**，重开须另立单并满足该条「重开条件」）` / `✅ 完成（附日期，随即移入归档）`

## 一、未做 / 挂起 / 外部依赖

> 本节 = 既有 2 单（`UI-FACTOR-CITATION-RETIRED` / `UI-RUNBOOK-GAP`）+ 全面审查 W7 新立 5 单（`UI-NPM-AUDIT-FIX` / `UI-COPILOT-GATE-SURFACE` / `UI-SCREEN-CONSUMER` / `UI-HEALTHCHECK` / `UI-LEDGER-SELF-CONSISTENCY`）。**订正**：原「本仓当前无未做」 boilerplate 与下文两条 ⬜ 自相矛盾（W1-F6），已撤；主台账与子台账（`docs/design/stitch_quantlab_ux_redesign/`）的关系见 `UI-LEDGER-SELF-CONSISTENCY`。此前已收口单的正文与施工记录全部在归档文件里。

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

### UI-RUNBOOK-GAP · 本仓没有 runbook，托管失败与 `/api` 反代故障只有 README 零散说明 [P1] ⬜

- **① 目标**：给 ui 一份最小 runbook，让「页面打不开 / 静态资源 404 / `/api` 反代失败」有固定入口，并能一句话区分「本仓问题」还是「core 问题」。
- **② 上下文**：`SERVICE.md` 落地时实测——本仓 `docs/` 无 `runbook.md`；起停与本地开发写在 `README.md`，反代配置在 `deploy/nginx-spa.conf`，但没有成文的排查顺序。六个服务仓都有 `docs/runbook.md`，core / agent / ui 三个仓没有。
- **③ 要求**：① 覆盖「静态资源不可加载」「`/api` 404 / 502」「登录态失效」「e2e 基线红」四类现象；② 每节写「现象 → 先看什么 → 怎么判定是本仓还是 core → 处置」；③ 明确本仓无自带探针，不得把 core 的 `/health` / `/readyz` 当本仓探针；④ 完成后把 `SERVICE.md` 的 `truth.runbook` 改为该文件路径。
- **④ 约束与非目标**：不写 SLO / 告警规则 / 值班表；不改 nginx 反代策略；不在 runbook 里复制 `openapi.yaml` 或端点清单。
- **⑤ 验收**：按 runbook 能在「后端正常 / 后端停掉 / 反代配置错误」三种场景里各自定位到唯一责任仓，不出现「两边都像坏了」的结论。
- **⑥ 边界**：前端托管与反代排查归本仓；`/api` 背后的业务故障归 `tellurion`，其排查入口在 core 的 runbook（缺口见 `tellurion:docs/TASKS.md` 的 `CORE-RUNBOOK-GAP`）。
- **owner**：待定
- **重开条件**：出现第二次「页面故障但无法判断是前端还是后端」的排障经历，或接手人变更。

### UI-NPM-AUDIT-FIX · npm 依赖 5 个 high 漏洞（@vue/server-renderer XSS 等）[P0] ⬜

- **① 目标**：把本仓 `web/` 与 `e2e/` 的 npm 依赖升到无 high 漏洞，`npm audit --audit-level=high` 退出码归 0。
- **② 上下文（2026-11-11 全面审查 W5-F1，证据 ODR-072 `tellurion-docs:docs/archive/odr/odr-072-audit-wave5-security-reliability-deps.md`）**：W5 实测 `npm audit` 报 **5 high**——`@vue/server-renderer`（XSS）、`nanoid`、`postcss`、`source-map-js` 等。本仓是 Vue 3 + Vite SPA，`@vue/server-renderer` 虽主要在 SSR 路径，但作为传递依赖仍在树里。冻结参照 = `web/package.json` / `e2e/package.json` 与 lockfile。
- **③ 要求**：① `npm audit fix`（必要时 `npm audit fix --force` 升 major，但须核 breaking）把 5 high 清零；② `npm run build` / `npm run lint` / `npm run typecheck` / `npm test` 全绿，确认升级无回归；③ e2e 套件复跑（原生三服务栈）不退化；④ 若某漏洞无补丁版，登记残留 + 缓解（不静默 `audit-level=critical` 绕过）。
- **④ 约束与非目标**：不放宽 audit 阈值来变绿（禁 `--audit-level=critical` 当修复）；不复制 openapi；不改后端契约；不引入新框架；major 升级须核 breaking 并在单内记录。
- **⑤ 验收**：`npm audit --audit-level=high` EXIT=0（真退出码）；`npm run build`/`lint`/`typecheck`/`test` 全绿；破坏验证 = 把某依赖降回漏洞版 ⇒ audit 复红，还原复绿。
- **⑥ 边界**：本仓 `web/` + `e2e/` 的 package.json/lockfile；Go 侧依赖漏洞归各 Go 仓（`X-DEP-BUMP-CONSUMERS` / `BROKER-DEP-BUMP` / `KIT-DEP-SECURITY-BUMP`）。
- **owner**：待定

### UI-COPILOT-GATE-SURFACE · Copilot 把 promote 闸门拦下误报成「沙箱未启用」，且无人类 promote 操作面 [P1] ⬜

- **① 目标**：让主任在 Copilot 看到的终态文案**诚实**（闸门拦下 ≠ 沙箱未启用），并有一条**可操作的人工 promote 路径**，使 ADR-023「人是闸门」在产品面落地，而不是呈现为「永远失败」。
- **② 上下文（2026-11-11 全面审查 W6-F2 ★H，证据 ODR-073 `tellurion-docs:docs/archive/odr/odr-073-audit-wave6-service-repos-frontend.md`；裁决 D3=b 先行 + a 立案）**：后端闸门 fail-closed **正确**（agent `copilot.go:666-669` / `stopAtGate:708-709` 终态 `sandbox_rejected`，`api-schema.md:92/:168-172` 诚实成文四成因；`generated`/`backtest_complete` 是契约刻意保留的预留态）。缺口在 UI 与人类侧：① `web/src/pages/Copilot.vue:89-92` 对**一切** `sandbox_rejected` 追加「（沙箱未启用：需配置 copilot.working_dir…）」——对今天占主导的**闸门拦下**路径是假话；② `:71` 进度文案「生成中（LLM → 沙箱编译 → **回测**）」承诺不存在的回测跳（agent 今天不跑回测，`copilot.go:660`）；③ `:78-84` 仍处理 `backtest_complete`（白名单保留是契约要求，但进度文案撒谎）；④ 全 ui 仓 grep `promote|promote_gate|blocked_reason` **零命中**，唯一 promote 端点 = strategy `POST .../versions/{hash}/promote` 只认 `service` + `X-Actor`，主任以管理员身份调也不通。
- **③ 要求（分两腿，b 先行不依赖角色裁决）**：**b 腿（先行）**：① 订正 Copilot.vue 文案——`sandbox_rejected` 按 `build_error` 区分「闸门拦下」（提示「编译已通过，待人工 promote」）与「沙箱/资产/链故障」，不再一律说「沙箱未启用」；② 进度文案去掉「→ 回测」假跳（改为「LLM → 沙箱编译 → 人工闸门」）；③ 本仓 `docs/runbook.md`（与 `UI-RUNBOOK-GAP` 协同）写成文人工 promote 路径：主任拿 service token + `X-Actor` curl strategy promote 端点（可审计）。**a 腿（立案，须先裁角色）**：④ UI promote 按钮经 core 反代到 strategy——**前置 = 裁「人 promote 走什么身份」**（strategy 策略表今天只认 service；admin 代调还是给主任签发 service token 未定），角色裁决前不落按钮。
- **④ 约束与非目标**：不改后端闸门 fail-closed 语义（W4 A-3 ✅ 不动）；不删 `generated`/`backtest_complete` 白名单（契约刻意保留）；不在前端伪造 promote 成功；a 腿角色未裁前不擅自给 strategy 策略表加 admin 档；不复制 openapi。
- **⑤ 验收**：b 腿——组件测试断言「闸门拦下」终态文案不含「沙箱未启用」、含「待人工 promote」；runbook 有成文 curl promote 步骤且真栈跑通一次（A4 授权）；破坏验证 = 把文案改回一律「沙箱未启用」⇒ 用例红，还原复绿。a 腿——角色裁决落定后另验收（按钮经反代 promote 成功 + 审计留痕）。`npm run build`/`test` 绿。
- **⑥ 边界**：本仓 `web/src/pages/Copilot.vue` + `docs/runbook.md`；a 腿的 core 反代归 `tellurion`、strategy 角色策略归 `tellurion-strategy`（须先裁）；后端闸门行为归 agent（不动）。
- **owner**：待定

### UI-SCREEN-CONSUMER · 核验 `/api/screen` `/api/stocks/count` 修复后 ui 消费面真可用 [P1] ⬜

- **① 目标**：确认主任 `8c5272d` 修复 core 死反代后，本仓 Screener / DataQualityPanel / MarketMetrics 等消费方真能拿到数据或优雅处理新语义（count 派生 502），而不是静默坏掉。
- **② 上下文（2026-11-11 全面审查 W2-F8 连带，证据 ODR-069 `tellurion-docs:docs/archive/odr/odr-069-audit-wave2-core-architecture.md`）**：`web/src/api/market.ts:21` `screenStocks` → `POST /api/screen`、`:13` `getStockCount` → `/api/stocks/count`；消费方 = `web/src/pages/Screener.vue`、`web/src/components/sync/DataQualityPanel.vue`、`web/src/components/dashboard/MarketMetrics.vue`（+ `DataSync.vue`）。主任 `8c5272d` 已改 core：screen 本地供数（裁决⑰姿势）、count 派生 **502**、ingest/raw 410。core 侧核验归 `tellurion:CORE-DEAD-PROXY-SCREEN-VERIFY`；本单是 ui 消费连带——尤其 count 现在可能回 502，ui 须优雅处理而非崩。
- **③ 要求**：① 真栈（core 修复后）跑 Screener / DataQualityPanel / MarketMetrics，断言 screen 有读数、count 502 时 ui 显示「不可用」而非通用错误/空白崩；② 若 ui 把 count 502 当硬错误，改成降级提示；③ 补/改组件测试覆盖 count 502 分支；④ e2e 相关用例复跑不退化。
- **④ 约束与非目标**：不改 core 路由（主任已修，归 CORE-DEAD-PROXY-SCREEN-VERIFY 核验）；不复制 openapi；不在前端伪造 screen/count 数值；不新造端点。
- **⑤ 验收**：真栈三消费方各一条断言（screen 有读数 / count 502 降级）；组件测试覆盖 502 分支；破坏验证 = 把 502 降级改回硬错误 ⇒ 用例红，还原复绿；`npm run build`/`test` 绿。
- **⑥ 边界**：本仓 `web/src/api/market.ts` 消费方组件 + 测试；core 反代核验归 `tellurion:CORE-DEAD-PROXY-SCREEN-VERIFY`。
- **owner**：待定

### UI-HEALTHCHECK · ui Dockerfile 无 HEALTHCHECK，容器编排无法判活 [P3] ⬜

- **① 目标**：给本仓运行镜像一条 HEALTHCHECK，让 compose/编排能判「nginx 真在 serving SPA」而不是「容器进程还在」。
- **② 上下文（2026-11-11 全面审查 W5-F6，证据 ODR-072 `tellurion-docs:docs/archive/odr/odr-072-audit-wave5-security-reliability-deps.md`）**：本仓 `Dockerfile` **无 `HEALTHCHECK`**（grep 零命中）。本仓是 nginx 托管的 Vue SPA（宿主 8080），无自带业务探针；健康判据应是「nginx 能返回 SPA 入口 / 静态资源」。注意 W5-F6 另一处弱探针（`nc -z`）实属 strategy（见 ODR-072 订正注记），与本仓无关。
- **③ 要求**：① Dockerfile 加 `HEALTHCHECK`（用镜像内已有二进制，如 `wget -qO- http://127.0.0.1/` 或 nginx 静态入口；缺 curl/wget 则在镜像补或用 nginx 自带能力）；② 探测的是「SPA 真被 serving」，不是反代后端（后端健康归 core，不得把 core `/health` 当本仓探针——与 `UI-RUNBOOK-GAP` ③ 一致）；③ interval/timeout/retries 与兄弟仓同口径。
- **④ 约束与非目标**：不改 nginx 反代策略；不把后端 `/api/health` 当本仓健康判据；不引入新依赖库；不改 SPA 路由。
- **⑤ 验收**：`docker build` 后起容器，HEALTHCHECK 在 nginx serving 时 healthy、nginx 停时 unhealthy（破坏验证 = 去掉 HEALTHCHECK ⇒ 编排无法判活，还原复绿）；`grep -n HEALTHCHECK Dockerfile` 非空。
- **⑥ 边界**：本仓 `Dockerfile`；nginx 反代与后端健康归 core / `UI-RUNBOOK-GAP`。
- **owner**：待定

### UI-LEDGER-SELF-CONSISTENCY · 主台账「无开放项」自相矛盾 + 子台账过期项 + broker frontmatter 漂移 [P3] ⬜

- **① 目标**：消除台账自相矛盾，让读者（含 agent）一眼判对本仓状态：主台账 boilerplate 与开放项一致、主/子台账关系写明、子台账过期项订正、broker frontmatter 不再描述已归档单。
- **② 上下文（2026-11-11 全面审查 W1-F6 + D13，证据 ODR-068 `tellurion-docs:docs/archive/odr/odr-068-audit-wave1-product-governance.md`）**：① 本仓 `docs/TASKS.md:15` 原「无开放项」与两条 ⬜（`:17`/`:28`）矛盾（**本轮立单已撤该 boilerplate**，本单核验其余一致性）；② `AGENTS.md:54`「截至 2026-11-11 无开放项」同句须订正；③ 子台账 `docs/design/stitch_quantlab_ux_redesign/` 的 B-05（因子端点过期）/ G9（镜像构建失败已被证伪）过期项须订正，主台账「无开放项」与子台账开放 B/G 项的关系须写明（D13）；④ `tellurion-broker:docs/TASKS.md` frontmatter 仍描述已归档的 `SVC-BROKER-G3`（W1-F6）。W1-F7 观察窗功能缺口已 dedup 到子台账 B-01/B-02/B-06/G1~G4（**不新立功能单**，逐行证据补在施工时）。
- **③ 要求**：① 订正 `AGENTS.md:54` 为「有开放项，见 docs/TASKS.md」；② 子台账 B-05/G9 过期项订正（B-05 因子端点已退役 410、G9 镜像构建失败前提已证伪），写明主/子台账关系（主台账装跨仓/运维单，子台账装 UX 重构功能项）；③ broker frontmatter 的 SVC-BROKER-G3 描述改指归档（跨仓，归本单同批）；④ 核验主台账不再有「无开放项」与 ⬜ 并存。
- **④ 约束与非目标**：不新立 W1-F7 观察窗功能单（已 dedup 子台账）；不改子台账 B-01/B-02/B-06/G1~G4 的功能判定（只补证据，施工时做）；不动主任 2026-11-12 ✅ 条目（`UI-VISUAL-BASELINE`）；不改代码。
- **⑤ 验收**：`grep -n "无开放项" docs/TASKS.md AGENTS.md` 不再与开放项矛盾；子台账 B-05/G9 有过期订正注记；broker frontmatter 指归档；主/子台账关系成文。
- **⑥ 边界**：本仓 `docs/TASKS.md` + `AGENTS.md` + 子台账 + `tellurion-broker:docs/TASKS.md` frontmatter（跨仓同批）；观察窗功能实现归子台账 B/G（不在本单）。
- **owner**：待定

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
