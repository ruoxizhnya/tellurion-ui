---
status: active
last-verified: 2026-11-13
verified-by: 2026-11-13 `UI-PLAYWRIGHT-TRIAGE-2026-11-13` 收口（7 条 Playwright 失败逐条分诊：全部为用例陈旧，产品缺陷 0 条；W5-1~W5-5 已修；真栈全量复跑 218 passed / 0 failed / 2 skipped）；此前：2026-11-13 五角审查立单（只立单不施工）——档 2（产品设计）新立 `UI-INDUSTRY-ENTRY` ⏸ / `UI-THEME-TOGGLE` ⏸（均待主任裁决）、`UI-FACTOR-RESEARCH-LABEL` ⬜；档 4（测试）新立 `UI-PLAYWRIGHT-TRIAGE-2026-11-13` ⬜ / `UI-CI-COVERAGE` ⬜；档 5（文档与代码一致性）新立 `UI-PAGE-INVENTORY` ⬜；此前：2026-11-12 跨仓伞 `X-LOW-CLEANUP` 的 ui 腿——新增 `scripts/check-no-openapi.mjs` 守卫（ADR-0001：openapi 只住 core），CI 在前端 job 末尾加 Guard 步；破坏验证：复制一份 `openapi.yaml` ⇒ EXIT=1，删除后 ⇒ EXIT=0；2026-11-12 跨仓伞 `X-CI-RACE-STATICCHECK` 的 ui 腿——前端 CI 在 `Test` 之后补 `Build`（`npm run build`）门，本地真跑退出码 0（vite build 6.96s，产物正常）；本仓无 Go 代码，`-race`/`staticcheck` 由 Go 仓各自承担；2026-11-12 W7 收口批次（A4 授权 + 两处裁决）——`UI-COPILOT-GATE-SURFACE` b 腿 + a 腿全部落地并归档（a 腿按「登录者自己的 JWT」裁决施工，含组件测试与破坏验证；端到端成功态的两条跨仓前置写成归档条目的重开条件）；`UI-NPM-AUDIT-FIX`（audit high 清零，13 条 moderate 的不修理由 + 重开条件已写进归档）/`UI-RUNBOOK-GAP`（新增 runbook，`SERVICE.md` 的 `truth.runbook` 已订正）/`UI-SCREEN-CONSUMER`（count 5xx 降级）/`UI-HEALTHCHECK`（镜像 HEALTHCHECK）四单收口并归档；`UI-LEDGER-SELF-CONSISTENCY` 订正 AGENTS.md / ARCHITECTURE.md 与子台账 B-05/G9 并写明主/子台账分工（已归档）；`UI-FACTOR-CITATION-RETIRED` 按裁决改为退役说明页（保留入口、删除 `api/factor.ts`，已归档）；另三条新发现（选股失败冒充空结果、a08 写死总数、dashboard 假定空历史）同批收口。**台账现状（2026-11-12 时点，已被本轮 2026-11-13 立单覆盖，勿引用）：当日 0 张开放单；UX 子台账开放项见 §一 末表（B-03 / B-05 / V-2 / V-3 / A-04 断言 2·8）。** 2026-11-12 UX 收尾批（ui 仓，不改后端）：`A-09` 纸交易观测台（`9ca2a61`，四块齐备；外部信号流 `97e934d` 接 core 新补的 `GET /api/signals`）、`A-10` 三缺屏（5 commit）、`A-11` 自托管 latin 子集（`01b5baa`，ODR-001，91.4 KiB）、`B-01` seq 升序用例（`416d598`）、`B-02` 审阅台（`efc6cef`，近似版显式标注）、`B-04` 三页合一（`08e95f1`）、`B-06` 三干预（`efc6cef`，接真端点）、`A-04` 断言 5（`319004c`+`a540f65`）；**事实订正**：G1/G2/G3/G4/G6 由「无」改为已落地，A-10 断言 3 由 5→4，B-05 归口由 analytics 改为 core（ADR-038）。此前：2026-11-11 全面审查 W7 台账立单（A5 授权）——新立 5 条六字段单，证据坐标引 ODR-068/069/072/073（`tellurion-docs:docs/archive/odr/`）；同轮撤掉与下文两条 ⬜ 自相矛盾的「本仓当前没有未做项」boilerplate（W1-F6），并给既有 `UI-FACTOR-CITATION-RETIRED` 补审查确认指针（W2-F7，dedup 不新立单）。此前：2026-11-10 晚 AUD-61 收口——4 条视觉基线在原生三服务栈上逐张核对后重生成、整份 `visual-regression.spec.ts` 复跑 **12 passed**；破坏验证（隐藏 `.nav-tiles`）→ 2% 红，逐字节还原后复绿；`e2e/tests` 现存 `test.fixme` = **0**。此前：2026-11-10 AUD-63 收口补充——core `/api/market/index` 改为本地供数后「有读数」支真栈跑通。
---

# TASKS — tellurion-ui 未完成项

> **归档说明（2026-11-11）**：本文件已瘦身为「只装未做的事」。2026-11-10 及以前已收口（✅）的任务原文、施工记录、验收输出与破坏验证，已逐字移入 [`docs/archive/tasks-archive-2026-11.md`](archive/tasks-archive-2026-11.md)；该文件顶部有「检索索引」表（ID / 标题 / 收口日期 / commit / 证据链接）。检索：`grep -n "<任务ID或commit>" docs/archive/tasks-archive-2026-11.md`。
>
> 状态：`⬜ 待做` / `🔶 进行中` / `⛔ 阻塞（有未解除前置）` / `⏸ 挂起（外部依赖或已裁决暂不实施；**不计入开放项**，重开须另立单并满足该条「重开条件」）` / `✅ 完成（附日期，随即移入归档）`

## 一、未做 / 挂起 / 外部依赖

> **本仓当前开放项（2026-11-13 口径，以本表为准）**：`UI-FACTOR-RESEARCH-LABEL` ⬜、`UI-CI-COVERAGE` ⬜、`UI-PAGE-INVENTORY` ⬜；**挂起待主任裁决、不计开放项**：`UI-INDUSTRY-ENTRY` ⏸、`UI-THEME-TOGGLE` ⏸。2026-11-12 W7 批次的六字段单（含 `UI-COPILOT-GATE-SURFACE` b 腿 + a 腿、`UI-FACTOR-CITATION-RETIRED`、三条 e2e / 失败态新发现）均已收口并移入 [`docs/archive/tasks-archive-2026-11.md`](archive/tasks-archive-2026-11.md)，检索入口见该文件的「检索索引」表。`UI-COPILOT-GATE-SURFACE` 的端到端成功态有两条跨仓前置（core 反代 promote、strategy policy 打开 admin/trader），已写成该归档条目的「重开条件」，**不计入本仓开放项**。
>
> **e2e 健康度（2026-11-13 实测，勿再写"8/8 spec 全绿、0 open"）**：31 spec / 220 例，真栈全量 **218 passed / 0 failed / 2 skipped**（5.9m）；2 skipped 为 `auth-login-flow.spec.ts` 的开鉴权形态与引导流程（当前栈为 open-access 且未提供 `E2E_AUTH_USER` / `E2E_AUTH_PASSWORD`，跳过理由在用例内显式写明）。`test.fixme` = 0。审查报告里的 7 条失败已由 `UI-PLAYWRIGHT-TRIAGE-2026-11-13` 逐条分诊并归档。
>
> **主/子台账分工（D13，2026-11-12 定；同日修订「互不索引」条款）**：本文件装**跨仓 / 运维 / 一致性**类单，是「本仓现在在做什么」的唯一入口；`docs/design/stitch_quantlab_ux_redesign/TASKS.md` 装 **UX 重构功能项**（A/B 组与 G 缺口）。两处**互不收录正文**；某条单只在一处写正文，出现第二处即视为重复立单。**但主台账 §一 末尾必须列出子台账开放项的 ID（只列 ID，不搬正文）** —— 否则会出现「主账说 0、子账躺 10 条」的自相矛盾。

### 子台账开放项（只列 ID，正文见 [`design/stitch_quantlab_ux_redesign/TASKS.md`](design/stitch_quantlab_ux_redesign/TASKS.md)，截至 2026-11-12）

| ID | 状态 | 一句话 |
|---|---|---|
| B-03 | 可开工 | 实验日志与采纳台账（G6 已落地：`/api/pipeline/adoption` + `/calibration`） |
| B-05 | ⏸ 挂起 | 因子读面归 **core**（ADR-038）；analytics 全仓无因子端点，等 core 提供读面并新立单 |
| V-2 / V-3 | 待做（测试债） | 2 条 responsive 视觉基线仍红；归 AUD-61 执行登记，不在 UX 批次内 |
| A-04 断言 2/8 | ⏸ 裁决暂缓 | 侧栏 9 项归并（主任 2026-10-14 裁决暂不实施；当前实测 15 项） |

#### 2026-11-13 五角审查 · 档 2（产品设计）

### UI-INDUSTRY-ENTRY · 产业链/宏观产品入口（补 UI 或明确仅 API）[P2] ⏸ 待主任裁决

> 档 2（产品设计）· 来源：01-product-design P2-1 · 顺序 2-3 · 依赖：主任裁决 A/B；若选 A，排在 `CORE-S1-EXIT-EVIDENCE` 之后

- **① 目标**：消除"`PRODUCT.md` L2 承诺产业链查询、UI 无任何入口"的产品面缺口。
- **② 上下文**：core 已实现并装配 4 条行业端点（`cmd/analysis/handlers_industry.go:74-77`：tree / edges / vitality / ETF 成分）与 `GET /api/macro/series`（`handlers_macro.go`；`main.go:487/493`），契约已在 `docs/openapi.yaml`；UI `web/src` 检索 `industry|macro|产业链` 零命中，`REPO-MAP.md` 也未登记。性质 = **能力已具备但未暴露**，不是缺后端，也不是"不该做"。
- **③ 要求**：建议 **A 补只读页**：在"选股与市场"下加"产业链"页，读 5 条端点，展示行业树 / 供应链边 / 行业活力 / ETF 成分 / 宏观序列；不新增后端、不做写操作。备选 **B 明确仅 API**：PRODUCT/REPO-MAP 改口径为"后端可用、暂无 UI"，UI 不加入口。
- **④ 约束与非目标**：不新增 core 端点；不把产业链做成投研结论或买卖建议；若资源优先 S1 出口，可先按 B 落文案，S2 再升级 A（升级条件写进本条）。
- **⑤ 验收**：A——页面渲染两组以上真实数据，空/错态明确，断 core ⇒ 明确错误态，组件测试 + 破坏验证；B——PRODUCT/REPO-MAP 不再让读者以为"用户可查"。
- **⑥ 边界**：UI 消费面；core 契约与数据分别归 core/data。
- **重开条件**：主任裁决 A 或 B；若选 A 但暂不施工，写明"排在 S1 出口验收之后"。

### UI-FACTOR-RESEARCH-LABEL · 「因子研究」入口与退役说明页对齐 [P3] ⬜

> 档 2（产品设计）· 来源：01-product-design P2-3 · 顺序 2-5 · 依赖：无（2026-11-12 已裁决保留入口）

- **① 目标**：让导航标签与页面内容一致，停止把"退役说明"呈现为"因子研究能力"。
- **② 上下文**：`FactorCitation.vue:4-10` 自述 `GET /api/factors/:factor_name` 已按 ADR-037 退役为 410；`navItems.ts:61` 仍以"因子研究"作为一级入口；2026-11-12 产品裁决明确"不删入口，保留可见落点"。
- **③ 要求**：把导航项与页面标题改为"因子证据（已退役）"或等价表述；保留现有说明、机器码与 ADR 链接；不改路由路径（避免外链失效）。
- **④ 约束与非目标**：不恢复任何因子查询请求；不显示因子数值；不删入口（除非主任改判并另立清理单）。
- **⑤ 验收**：导航/标题文案一致；`FactorCitation.test.ts` 仍钉住"不发 `/api/factors`、不撞 410"；无新增控制台错误。
- **⑥ 边界**：UI 文案与路由展示；core/data 不改。

### UI-THEME-TOGGLE · 主题切换死控件处置 [P3] ⏸ 待主任裁决

> 档 2（产品设计）· 来源：01-product-design P2-3 · 顺序 2-6 · 依赖：主任裁决 A/B

- **① 目标**：消除"点击只弹主题切换开发中"的可见死控件。
- **② 上下文**：`AppHeader.vue:148` 的 `toggleTheme()` 仅 `message.info('主题切换功能开发中')`；工程内无主题系统或暗色切换实现。
- **③ 要求**：建议 **A 移除控件**：删按钮与函数，保留当前深色主题；备选 **B 实现**：引入完整主题切换（持久化 + 对比度校验）。建议 A——主题切换不服务"观察窗"核心价值，半成品比没有更伤体验。
- **④ 约束与非目标**：不引入新 UI 框架/主题库；不做只有开关、没有主题的中间态。
- **⑤ 验收**：A——Header 无主题按钮、无 console 报错、视觉基线按需复核；B——主题持久化 + 对比度检查通过。
- **⑥ 边界**：UI Header。
- **重开条件**：主任裁决 A 或 B（建议 A）。

#### 2026-11-13 五角审查 · 档 4（测试）

### UI-CI-COVERAGE · 前端覆盖率门（vitest coverage + CI 步骤）[P2] ⬜

> 档 4（测试）· 来源：03-testing P2-2 · 顺序 4-11 · 依赖：core 伞 `X-COVERAGE-FLOOR`

- **① 目标**：前端也有能拦住回退的覆盖率门。
- **② 上下文**：`package.json` 无 `test:coverage` 脚本，CI 不跑覆盖率；当前只有单测与 e2e 通过性。
- **③ 要求**：① 加 `test:coverage`（vitest 内置 coverage，如缺 `@vitest/coverage-v8` 属必要依赖，需在提交说明）；② 先测实际覆盖率；③ CI 设门 = 实测 - 5 点；④ 报告输出到 CI artifact 或 `coverage/`（不入库）。
- **④ 约束与非目标**：不引入第二套测试框架；不把 e2e 计入覆盖率；不追求 100%。
- **⑤ 验收**：`npm run test:coverage` 产出摘要；CI 使用新阈值；删除一个有断言的测试文件 ⇒ 门红。
- **⑥ 边界**：UI `package.json` + CI。

#### 2026-11-13 五角审查 · 档 5（文档与代码一致性）

### UI-PAGE-INVENTORY · 页面全集入口（ARCHITECTURE §3.1 之外）[P3] ⬜

> 档 5（文档与代码一致性）· 来源：04-doc-consistency P3-1 · 顺序 5-7 · 依赖：无

- **① 目标**：给读者一个"UI 共有哪些页面"的完整入口，而不只是增量登记。
- **② 上下文**：`docs/ARCHITECTURE.md §3.1` 自述"新增页登记于此"，只列 5 行；实测 20 个页面，多数不在该节。该节不是缺陷，但缺少全集视图。
- **③ 要求**：新增"页面全集"表（路由 → 页面 → 一句话用途），由路由配置生成或人工维护 + 检查脚本；保留原增量登记节并注明两者分工。
- **④ 约束与非目标**：不改页面实现；不要求每个页面都写详细设计；不把该表做成路由的第二真相（能生成就生成）。
- **⑤ 验收**：20 个页面全部出现在全集表；路由配置新增页面时检查脚本能提示；链接检查绿。
- **⑥ 边界**：`tellurion-ui/docs/ARCHITECTURE.md` + 可选 `scripts/`。

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
