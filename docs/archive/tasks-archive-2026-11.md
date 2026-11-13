# TASKS 归档 — tellurion-ui（2026-11）

> **本文件是 `docs/TASKS.md` 的历史归档，进 git、不删除**。归档时间 2026-11-11；收录范围 = 截至 2026-11-10 已收口（✅）的任务原文（**逐字搬入、未改写**；原文件 frontmatter 留在新台账，任务标题与正文原样保留），以及 2026-11-12 起收口的 W7 六字段单（原文随收口一并搬入，标题带收口日期）。

> **检索方式**：按任务 ID `grep -n "<ID>" docs/archive/tasks-archive-2026-11.md`；按 commit `grep -n "<sha>" docs/archive/tasks-archive-2026-11.md`；索引表在本节下方，含 ID / 标题 / 收口日期 / commit / 证据链接。

## 检索索引

| ID | 标题 | 收口日期 | commit / 正文所记哈希 | 证据链接 |
|---|---|---|---|---|
| AUD-61 | e2e 套件与前端结构脱节（测试债） | 2026-10-23 | `d12b07a`、`837207c`、`166c4b1` | [原文](#AUD-61) |
| AUD-63 | 三个组件的窄 `data-testid` 落地（裁决 ⑳ 的例外，AUD-61 ⑥ 不许改模板） | 2026-11-10 | —（原文未记） | [原文](#AUD-63) |
| UI-03 | 375 宽下侧栏不折叠，正文列被压到一两个字宽 | 2026-11-10 | —（原文未记） | [原文](#UI-03) |
| API-01 | client.ts 把后端 4xx 原话换成通用文案（🟠 全站错误可读性）✅ 完成（2026-10-22） | 2026-10-22 | —（原文未记） | [原文](#API-01) |
| DATA-14 | 空列表编码成 `null` 而不是 `[]`（🟠 契约说谎，任何客户端都会踩）✅ 执行地已闭合（core，2026-10-24）· 本仓只留指针 · **已迁 core（2026-10-21，原号 DATA-04，SPEC-R-03 换号）** | 2026-10-24 | —（原文未记） | [原文](#DATA-14) |
| SPEC-R-02 | 五张无主表 owner 认领（不在本仓，本仓留指针）✅ 2026-10-21 | 2026-10-21 | —（原文未记） | [原文](#SPEC-R-02) |
| UI-01 | 「研究质量读数」文案过期 + `fmtVolume/fmtAmount` 把 0 读成缺失（两处界面在撒谎）✅ 完成（2026-10-22） | 2026-10-22 | `f473fa9` | [原文](#UI-01) |
| UI-02 | 三值 status 消费与 `invalid_reasons` 展示口径（refactor-plan-review C1 传播）✅ 完成（2026-10-22） | 2026-10-22 | —（原文未记） | [原文](#UI-02) |
| QT-61 | QT-61（ui 腿）· CI 基线归零——SchedulePanel flaky 用例 | 2026-10-21 | `1075c28` | [原文](#QT-61) |
| UI-NPM-AUDIT-FIX | npm 依赖 5 个 high 漏洞（@vue/server-renderer XSS 等） | 2026-11-12 | 见正文 | [原文](#UI-NPM-AUDIT-FIX) |
| UI-RUNBOOK-GAP | 本仓没有 runbook，托管失败与 `/api` 反代故障只有 README 零散说明 | 2026-11-12 | 见正文 | [原文](#UI-RUNBOOK-GAP) |
| UI-HEALTHCHECK | ui Dockerfile 无 HEALTHCHECK，容器编排无法判活 | 2026-11-12 | 见正文 | [原文](#UI-HEALTHCHECK) |
| UI-SCREEN-CONSUMER | 核验 `/api/screen` `/api/stocks/count` 修复后 ui 消费面真可用 | 2026-11-12 | 见正文 | [原文](#UI-SCREEN-CONSUMER) |
| UI-LEDGER-SELF-CONSISTENCY | 主台账「无开放项」自相矛盾 + 子台账过期项 + broker frontmatter 漂移 | 2026-11-12 | 见正文 | [原文](#UI-LEDGER-SELF-CONSISTENCY) |
| UI-SCREENER-ERROR-STATE | 选股请求失败被渲染成「未找到符合条件的股票」（失败冒充空结果） | 2026-11-12 | 见正文 | [原文](#UI-SCREENER-ERROR-STATE) |
| UI-E2E-A08-HARDCODE | a08 用例把票池总数写死 5908（真库 5580），数据一变就假绿 | 2026-11-12 | 见正文 | [原文](#UI-E2E-A08-HARDCODE) |
| UI-E2E-HISTORY-EMPTY | dashboard 用例假定历史为空，而库里已有真实回测记录 | 2026-11-12 | 见正文 | [原文](#UI-E2E-HISTORY-EMPTY) |
| UI-FACTOR-CITATION-RETIRED | 因子引用抽屉死调已退役的 `GET /api/factors/:name`，现改为退役说明页 | 2026-11-12 | 见正文 | [原文](#UI-FACTOR-CITATION-RETIRED) |
| UI-COPILOT-GATE-SURFACE | Copilot 把 promote 闸门拦下误报成「沙箱未启用」，且无人类 promote 操作面（b 腿文案 + a 腿放行按钮） | 2026-11-12 | 见正文 | [原文](#UI-COPILOT-GATE-SURFACE) |
| X-CI-RACE-STATICCHECK（ui 腿） | CI 在前端 job 补生产构建门 `npm run build` | 2026-11-12 | 见本条 | [施工记录](#X-CI-RACE-STATICCHECK-ui) |
| X-LOW-CLEANUP（ui 腿） | `scripts/check-no-openapi.mjs`：openapi 不复制守卫 + CI 门 | 2026-11-12 | 见本条 | [施工记录](#X-LOW-CLEANUP-ui) |
| UX-AB-CLOSEOUT | UX 重构 A/B 收尾批（A-09/A-10/A-11/B-01/B-02/B-04/B-06 连同 A-04 断言 5） | 2026-11-12 | `9ca2a61` `97e934d` `efc6cef` `416d598` `319004c` `a540f65` `01b5baa` `08e95f1` + A-10 五连 | [原文](#UX-AB-CLOSEOUT-2026-11-12) |
| UI-PLAYWRIGHT-TRIAGE-2026-11-13 | 7 条 Playwright 失败逐条分诊（7/7 用例陈旧，产品缺陷 0；W5-1~W5-5 已修；复跑 218 passed / 0 failed / 2 skipped） | 2026-11-13 | `120af41` `ca6f590` `2c84faa` `814e7c1` `5a356f3` | [原文](#UI-PLAYWRIGHT-TRIAGE-2026-11-13) |
| UI-CI-COVERAGE | 前端覆盖率门：实测 66.50/65.65/51.60/61.35，门 = 下浮 2 点（64/63/49/59），CI Coverage gate + artifact；破坏验证 EXIT=1 | 2026-11-13 | 本批 | [原文](#UI-CI-COVERAGE) |

---

## 原文归档（逐字）

# tellurion-ui · 任务台账

> 任务定义规范沿用 core 仓 `tellurion/AGENTS.md` §8.5（六字段：①目标 ②上下文 ③要求 ④约束与非目标 ⑤验收 ⑥边界）。
> 状态标记：`⬜ 待做` / `🔶 进行中` / `⛔ 阻塞` / `✅ 完成（附日期）`
>
> **台账终扫（2026-11-10）**：任务标题带 `⬜` / `🔶` / `⛔` 的 = **0 条**；正文旧标记以标题与最新「收口」块为准。**无开放项**。
>
> **注（2026-11-12，`UI-LEDGER-SELF-CONSISTENCY`）**：上面这句终扫结论**只对 2026-11-10 那个时点成立**。此后 2026-11-11 全面审查新立 6 条单，其中 1 条待产品裁决、1 条 a 腿待角色裁决 —— **本仓现状以主台账 `docs/TASKS.md` §一 为准**，不要拿本文件的终扫结论判断当前有没有未做的事。

> **第三轮裁决指针（2026-10-25）**：⑥ e2e 走两轨——无栈的 `typecheck/lint/vitest` 现在做；真栈 e2e 等 Docker Desktop / CI；**视觉基线在本机重生成**（playwright 无 `webServer`）。⑳ AUD-61 ④ 允许**窄例外**：只给 `NavTiles.vue` / `MarketMetrics.vue` / `AppSidebar.vue` 加 `data-testid`（纯增量属性，不改类/结构/文案），**单独 commit**。正文见 `tellurion:docs/design/qt-decoupling/cross-repo-decision-record-2026-10-25.md` §五。

---


## 施工序（候选单，开工前必须展开成六字段）

> 这张表是**施工顺序**，不是任务台账：每条在执行前要展开成六字段单（目标/上下文/要求/约束/验收/边界），并写明冻结契约的路径与节号。
> 顺序有依赖，不要跳级。

| 阶段 | 内容 | 上游单号 | 前置 |
|---|---|---|---|
| AUD-61 阶段一（✅ 2026-10-23） | 起齐三服务跑 e2e，把已知红改 `test.fixme` 并登记 | `AUD-61` | 无 |
| AUD-61 阶段二 ③/④（✅ 2026-10-23） | 先做不依赖 DOM 的 API 期望与共享限流两类，逐条清 fixme 与登记 | `AUD-61` | 阶段一 |
| AUD-61 阶段二 ①（✅ 2026-11-10：16/16 清表，fixme 归零） | 结构漂移/视觉基线 16 条；原「等 `feat/design-tokens-v2-palette-sweep` 合并」的阻塞已于 2026-10-25 解除；2026-11-10 用**无 Docker 的原生三服务栈**分两批清完：结构类 12 条 + 视觉 4 条（先取实际截图对 DESIGN.md 核对，再重生成基线并复跑 12 passed） | `AUD-61` | ③/④ ✅ + 重构合并 ✅ + 三服务与 PG 起齐 ✅（2026-11-10 原生栈） |


<a id="AUD-61"></a>
## AUD-61 · e2e 套件与前端结构脱节（测试债） ✅ 完成（阶段一 2026-10-23；阶段二 ③/④ 2026-10-23；① 批 2026-11-10：清 12 + 视觉 4，台账 fixme 归零）

> **K 组取证（2026-10-26，决策材料；未实现）**：`rg -n 'data-testid' --glob '*.vue'` 基线 = **113 行 / 14 文件**（`web/src` 全部文件口径 = 288 行 / 25 文件，与下文 ③ 的 288 一致）。两条均 ⛔ 不可开工：
> ① 批量断言 ⛔：派发单明确「不可执行（决策材料）」，且真栈未起。**订正上一版阻塞理由**：本轮 `docker version` / `docker ps` **可达**（daemon 已起，`dockerDesktopLinuxEngine` 连通），先前记的「daemon 不可达」已失效；仍缺的是前端栈本身——`5173 / 8081 / 8085 / 5432 / 6379` 未起、本仓无六字段的可执行单。⑳ 窄 `data-testid` ⛔：仅授权 `NavTiles.vue` / `MarketMetrics.vue` / `AppSidebar.vue`，但**无六字段单**——缺 testid 命名规则、断言清单与「是否允许改组件模板」的授权。
> 本轮未改任何组件、未铺 testid、未引测试框架；破坏验证不适用（无实现可破坏）。

> 2026-10-14 自 core 仓 `tellurion/docs/TASKS.md` §五迁入——e2e 套件随前端拆仓（2026-10-09）已物理归属本仓，且本仓前端正处设计系统重构（DESIGN.md v2.0），e2e 将大改，留 core 主线已无执行意义。本文件为 AUD-61 唯一归属地。

- **① 目标**：e2e 套件恢复「全绿 = 真实通过」的可信账目——已知红全部 `test.fixme` 显式登记在案；前端重构落地后按页重对齐选择器与期望值，直至 fixme 清零。
- **② 上下文**：
  - 套件位置：`e2e/tests/` 共 **19** 个 spec（api-backtest / api-health / api-negative / api-strategy / auth-login-flow / backtest-engine / copilot / copilot-e2e / critical-e2e / cross-navigation / **nav-consistency** / dashboard / data-sync / data-sync-error / data-sync-schedule / rbac-open-access / screener / strategy-selector / visual-regression；重构期间 spec 有增减，**阶段一以 `npx playwright test --list` 实测为准**）。
  - 运行配置：`e2e/playwright.config.ts`——`BASE_URL`（默认 :5173）、`DATA_SERVICE_URL`（:8081）、`BACKEND_URL`（:8085）、`workers: 1`、CI 下 `forbidOnly` + retries 2；数据隔离由 `e2e/helpers/isolation.ts`（库级隔离）保证。
  - 历史实测（**2026-09-26** 干净环境，出处 core 仓 `tellurion-docs/docs/TEST.md` §7.2.0 实测读数 + core 台账原记录）：**127 passed / 34 failed / 2 skipped（共 163）**；34 条全归因（24 条 DOM/选择器漂移 + 4 条 API 期望过时 + …）、与代码改动无关——套件选择器/期望值与前端结构脱节。
  - 前端现状：`feat/design-tokens-v2-palette-sweep` 分支正在做设计系统重构（DESIGN.md v2.0 为唯一基准、调色板全量扫仓），页面结构将大改 ⇒ **现在按旧结构重对齐是白做工**，先登记、后对齐。**（2026-10-25 注：本句是 2026-10-14 立单时的现状，今天已不成立——该分支已并入 main 且内容已随迁移进本仓，"白做工"这个前提消失；证据见本节末「订正（2026-10-25）」条。原文照留，是为了保住"阶段一为什么只登记不改断言"这条判断的来历。）**
  - 红线（继承 core 台账原文）：不得把「34 条红」洗成「已验证通过」，也不得放宽断言消红。
- **③ 要求**：
  - **阶段一（先做，独立可交付）**：起齐三服务（前端 :5173 / data-service :8081 / analysis :8085）后干净环境跑 `npx playwright test` 取得**当前**红清单（重构进行中，数字会漂移，以实测为准）；每条红改为 `test.fixme("AUD-61: <一句话归因>")` 并在下方登记表登记一行。除 fixme 与登记表外**不改任何断言/选择器/期望值**。
  - **阶段二（设计系统重构落地后）**：按页面分批重对齐——每批一个 commit，对齐一条则同步删除该条 fixme 与登记行；选择器优先 `data-testid`，不靠文案/DOM 位置（重构即碎）。
  - 登记表列：`spec 文件 | 用例名 | 红因归类 | fixme 日期 | 对齐批次 | 清除日期`。

  | spec 文件 | 用例名 | 红因归类 | fixme 日期 | 对齐批次 | 清除日期 |
  |---|---|---|---|---|---|
  | （空） | — | — | — | — | — |

  > 2026-11-10：最后 4 行（视觉基线段）已随 ① 批视觉腿清除，本表归零。

- **阶段二 · ① 批视觉腿（2026-11-10 晚，4 条基线：先核对、后重生成）**：
  - **栈**：与 ① 批同构，唯一差异是 PG 用独立实例 `127.0.0.1:5433`（库 `tellurion_ui_e2e`，`initdb` 出来的临时集群，不碰系统 `:5432` 实例）；`/health`、`/readyz`、`/api/strategies` 均 200 后才开跑。
  - **先取证再盖章**：临时去掉 4 条 `test.fixme` 跑一次（**不加** `--update-snapshots`），得 4 failed，`*-actual.png` 落在 `test-results/`；逐张读图对 DESIGN.md v2.0 核对：
    - `dashboard-actual.png`（4420 px / 0.01 差异）：画布 `#090a0c`、面板 `#111620/#171E2C`、主按钮 `#2563eb`、侧栏 12 项 + 激活态浅底、5 块磁贴、快速回测表单、控制台历史空态——与 token 表一致；市场概览走 **DATA-07 显式空态**（「无指数数据」+ 补数说明），不是补零伪造，符合「missing≠0」。
    - `backtest-actual.png`（2425 px）：同步/异步切换、6 个表单字段、`运行回测` 主按钮、两处空态图标与文案——与 DESIGN.md 的 4/8px 圆角、Inter、三档文字一致。
    - `backtest-tablet-actual.png`（768 宽，5885 px）：侧栏占比 28%、表单两列换行正常。
    - `dashboard-mobile-actual.png`（375 宽，1772 px）：**侧栏默认展开占 ~215px、正文列被压到一两个字宽**。与 `docs/design/visual.md` §5.2「≤768px 时 `.app-sidebar` display:none 或折叠」的建议不符。这是**既有布局行为**（旧基线同样如此，差异仅 1%），不是本次重生成引入；按本单 ⑥「前端生产代码缺陷另立工单」不在本批修，**已另立 `UI-03` 并当日修掉**（侧栏 ≤768px 默认收起 60px，mobile/tablet 两张基线随之重生成，12 passed）。
  - **后重生成**：`--update-snapshots` 四条全部 `is re-generated, writing actual`，`4 passed`；随即整份 `visual-regression.spec.ts` 复跑 **12 passed (1.0m) EXIT=0**。
  - **破坏验证（护栏必验）**：临时在 dashboard 用例截图前 `page.addStyleTag({content:'.nav-tiles{display:none!important}'})` ⇒ 该条 **10932 px（2%）红 / EXIT=1**；删掉该行逐字节还原后 **1 passed / EXIT=0**，基线未被写坏。
  - **计数**：`e2e/tests` 现存 `test.fixme` = **0**（阶段一 78 → 阶段二 70 → 16 → 12 → 4 → 0）。
  - **边界守住**：只动 `e2e/tests/visual-regression.spec.ts`（删 4 行 fixme）与 4 张快照 png；未改任何断言/选择器/期望值，未动 `web/src`、未动 `playwright.config.ts` / `isolation.ts`。

- **阶段二 · ① 批（2026-11-10，无 Docker 起原生三服务栈；16 → 4 行）**：
  - **栈怎么起的（本机无 Docker，全部原生进程）**：真 PostgreSQL 16.15 `127.0.0.1:5432`，新建库 `tellurion_ui_e2e`（analysis-service 启动自动迁移 core 面；data-service 启动自动迁移 `market`/`ingest` 面）；`data-service :8081`（`tellurion-data` 仓 `cmd/dataservice`）；`analysis-service :8085`（core 仓 `cmd/analysis`，`CONFIG_PATH=<core>/config/analysis-service.yaml`，env：`DATABASE_HOST/PORT/USER/PASSWORD/DATABASE`、`AUTH_INSECURE=true`、`AUTH_INSECURE_EXPOSURE=loopback-published`、`RATE_LIMIT_PER_MINUTE=100000`、`DATA_SERVICE_URL=http://127.0.0.1:8081`、`RISK_SERVICE_RESOLVE_ENABLED=false`、`SERVER_HOST=127.0.0.1`）；`vite :5173`（`web` 下 `npm run dev`）。
    - 坑（下一个人会踩）：vite 5 在 Windows 只监听 `::1`，`curl 127.0.0.1:5173` 连不上、`localhost:5173` 才行；`RISK_SERVICE_RESOLVE_ENABLED=false` 是必须的——analysis 出厂 `risk_service.resolve_enabled=true`，取不到 risk 快照会**拒绝启动**；`:8081`/`:8085` 的 `/health` 与经 vite 代理的 `GET /api/strategies` 均实测 200。
  - **基线（临时去 16 条 fixme 的真栈复跑）**：**16 failed**，逐条读 Expected/Received 后分三档：11 条选择器/期望过期（本批清）、1 条缺真行情数据（当日另起真库补齐后清除，见下）、4 条视觉基线（留）。
  - **清掉的 11 条**（逐条删 fixme + 删登记行；还原后合跑 **14 passed / EXIT=0**，11.9s）：
    - `dashboard: sidebar navigation renders with all items`：5 → 12；改 `[data-testid^="nav-item-"]` 计数 12 + 逐个 `nav-item-*` 可见（testid 属 AUD-63）。
    - `dashboard: navigation tiles are present and link to correct routes`：4 → 5；改 `[data-testid^="nav-tile-"]` 计数 5 + 五个 `href`（`nav-tile-batch` → `/dashboard?tab=batch`）。旧期望里的「因子分析」tile 已并入策略库，dashboard 上不存在。
    - `cross-navigation: Dashboard nav tiles navigate to correct routes`：同上，4 → 5。
    - `dashboard: quick backtest form renders correctly`：`.quick-bt-card` 全仓 0 命中（`:104` 早已核实）；改 n-card(title=快速回测) 作用域内断言 placeholder `600000.SH` / 2 个 `.n-date-picker` / 1 个 `.n-select` / 「运行」按钮。
    - `dashboard: history card section renders`：`.history-card` / 「控制台日志」过期；改 n-card(title=控制台历史) + 空态「暂无历史记录」。
    - `dashboard: metrics cards render with labels`：`.metric-card` 只在 `BacktestCompare.vue`，dashboard 无此类；「股票数/回测/策略」三标签亦不存在。改为 `MarketMetrics`（AUD-63 testid）：有读数时断言 4 个 `.metric-item` + 收盘价/涨跌幅/成交量/成交额四标签，无读数时断言 DATA-07 的显式空态**且不得伪造四格**。依据是组件现契约（`MarketMetrics.vue:33-36` 的 `v-if="!metrics"` 空态是设计行为，不是缺省补零），不是为消红放宽。
    - `data-sync: UI: Data source panel displays correctly`：旧文案「数据源状态」不存在，组件标题是「数据源管理」；改 n-card 作用域 + 第一枚 `.n-tag` 文案 ∈ {已启用, 未启用, 未知}。
    - `strategy-selector: navigation from dashboard works`：旧点「因子分析」tile；改 `nav-tile-strategy-lab` → `/strategy-lab`。
    - `critical-e2e: 访问不存在的报告ID显示友好错误提示`：**用例自身写错入口参数**——页面只读 `?id=`（`BacktestEngine.vue` 的 `route.query.id`），旧用例发 `?report=`，于是永远走空态、从不触发错误态。改 `?id=nonexistent-report-id-99999`，断言 `.n-alert`「报告加载失败」+ 正文 /加载失败|不存在|not found|404/。
    - `backtest-engine: form fields render correctly`：`.n-button--primary-type` 命中 2 枚（同步/异步切换默认也是 primary）⇒ strict violation；改 `getByRole('button', {name:/运行回测/})`。
    - `backtest-engine: responsive layout on different viewport sizes`：`.bt-form-card` 0 命中；改 `.bt-page .n-card` 中 title=回测引擎 的卡片 + `.form-grid`，768/1280 两个视口都验。
  - **留下的 4 条（不洗绿）**：
    - `visual-regression` 4 条：`--update-snapshots` 重生成 = 用新截图当真相（AUD-63 ⑥ 的另一腿，本单 ⑥ 亦不许），且当前库无行情数据，重生成只会把「空态页面」固化成基线。4 条 fixme 理由已改写为「须人工按 DESIGN.md 核对后重生成」。
  - **回测历史那条当日清除（2026-11-10 晚，阶段二 ① 数据腿）**：
    - **数据**：真 PostgreSQL 16.15 `127.0.0.1:5432` 新建库 `tellurion_e2e`；data-service 启动自动建 `market`/`ingest` 22 张表；播种 `600519.SH` **2024 全年 262 根日线**（确定性公式，非随机）+ 262 行交易日历 + 1 行 `market.stocks`。行数与可见性核对：`select count(*)` = 262。
    - **真引擎**：`POST /api/backtest`（`momentum` / 600519.SH / 2024-01-01~2024-12-31 / 本金 100 万）→ **200 `status=completed`**，`total_return=0.0440`、`sharpe=1.646`、`total_trades=13`、`win_rate=0.846`（真行情 + 真引擎，不是桩）。
    - **订正原 fixme 归因**：不只是「库内零行情行」。页面 `asyncMode = ref(true)`（`BacktestEngine.vue:157`）默认走异步，而异步要求 `ORCHESTRATION_URL`；本栈未起编排 ⇒ `POST /api/backtest` 得 **503「服务暂时不可用」**（实拍页面快照：`回测失败 / 服务暂时不可用，请稍后重试`）。即使播了行情，原用例也等不到 `.metrics-grid`。
    - **用例改法**：显式点 `.mode-toggle .n-button:has-text("同步")` 切同步模式（用例目标是「跑完一次回测并核对历史」，不依赖编排栈），**未放宽任何断言**；`test.fixme(...)` 与登记行同笔删除。
    - **真栈结果**：`npx playwright test -g "backtest history shows completed jobs with correct data"` → **1 passed (1.3s) / EXIT=0**；历史区块实拍到 `600519.SH · momentum | 夏普: 1.65 | 最大回撤: -0.98% | +4.40%`。
    - **收尾**：`tellurion_e2e` 库用完即删；data/analysis/vite 进程已停；本笔只改 `e2e/tests/backtest-engine.spec.ts` 一处 + 本台账。
  - **AUD-63 真栈轨与破坏验证（⑤②③）**：
    - 四条 AUD-63 登记项（sidebar / nav tiles / cross-nav tiles / metrics）在真栈上**全绿**（含在上面 14 passed 里）。
    - 破坏验证一：把 `NavTiles.vue:49` 的 `testid: 'nav-tile-strategy-lab'` 改成 `-del` ⇒ `navigation tiles are present…` 与 `navigation from dashboard works` **双红**；逐字节还原，`SHA256=9FFFFBB044D2A51C97AE08F1B33BD93B7AD8C8A40CC5E1DAB75C745E32E13516` 与破坏前一致。
    - 破坏验证二：把 `MarketMetrics.vue:36` 的 `data-testid="market-metrics-empty"` 改成 `-del` ⇒ `metrics cards render with labels` **红**；逐字节还原，`SHA256=300F7037A37A02C889FAB33D71E7787BA9A4FC7C93F236D9A81173A92D28EF69` 一致。
    - **读数支（当时未验证，2026-11-10 晚已解除）**：`market-metric-close/pct/volume/amount` 四个读数锚点在本机栈里没被实测过——dashboard 市场概览恒走空态，根因是 core 反代 `/market/index` → data 404 → 502（跨仓读链，属 K2）。core 改成本地供数后，同栈复跑该用例 **1 passed（走有读数那支）** 并补了 `market-metric-close` 的破坏验证；详见下方 AUD-63「四个读数锚点（2026-11-10 晚补证）」。
  - **顺带实测到的跨仓缺口（不在本单修，登记备派）**：dashboard 市场概览恒为「读数失败」空态。链路：core `cmd/analysis/handlers_proxy.go:163,171` 把 `GET /api/market/index` 反代到 data-service `/market/index`，而 data-service 兼容面只有 7 条（`tellurion-data:internal/httpapi/server.go:116-137`），**不含 `/market/index`** ⇒ 404 → core 502。此面属已知未闭合项 K2，且裁决 ⑰ 明定 `market.index_daily` 由 core 自持（`tellurion-data:docs/TASKS.md:47,399`）⇒ 该读链应由 core 本地供数或显式下线，不该继续反代。本单 ⑥ 只许动 `e2e/` 与登记表，故只登记。
  - **全量读数（2026-11-10，本机原生栈，`npx playwright test`，未截断，23.6 分钟）**：**135 passed / 44 failed / 7 skipped，EXIT=1**。44 条红按 spec：`api-backtest` 14、`backtest-engine` 8、`data-sync-error` 8、`data-sync` 5、`critical-e2e` 3、`evidence-probe` 3、`a08-job-console` 2、`screener` 1、`status-tristate` 2、`api-negative` 1（`POST /api/screen` 空体 → 502，同属市场读链缺口）。根因两类：**库内零行情行**（所有回测/报告/证据链）、**无 orchestration 与同步作业无外网**（作业控制台、data-sync 全族）。这与 AUD-61 ⑤ 的「每批后全量 0 failed」还差一段：本机环境无法复现 2026-10-23 那份 `168 passed / 0 failed`（当时库里有 11974 行 `ingest.raw` 真数据）。

- **阶段一收口（2026-10-23）**：
  - **基线全量实测**（vite :5173 + data :8081 + analysis :8085，`workers: 1`，`--list` 实测 **186 tests / 23 files**，台账旧读数 179/185 已过时）：**64 failed / 120 passed / 2 skipped，退出码 1**（11.8 分钟，未截断取完整红清单）。
  - **限流红的轮换性（实测发现，收口判据据此调整）**：逐条 fixme 后复跑并不能到 0 failed——第二遍全量（2.9m）翻出 **8 条新红**、第三遍（3.5m）又 **6 条**，三轮红样本**各不相同**且**全部是显式 429**（隔离复跑也 429，坐实进程级共享限流桶被满负荷套件打翻）。**结论：④ 类红是环境性的、按用例轮换，逐条 fixme 到不了稳定绿**；账目取三轮**并集 78 条**全部 fixme 登记。复跑的验证目标因此不是 exit 0，而是「**不再出现 ①/③ 类新红**」——第三轮的 6 条全是 ④，目标达成。④ 的根治（全 API spec 走 `getJsonWithBackoff` 或限流预算上调）归阶段二，不在阶段一铺开。
  - **处置**：78 条红逐条 `test.fixme("AUD-61: <归因>")` 插在用例体首行（**纯增量 78 行**，17 个 spec 文件，未动任何断言/选择器/期望值）；fixme 保留原用例名（登记表可对上），阶段二按批次逐条删除。
  - **终态复跑**：78 条 fixme 就位后全量 → **0 failed / 106 passed / 80 skipped（78 fixme + 2 原有），退出码 0**（2.8 分钟）。
  - **四类根因分布（并集 78 条）**：④ 共享限流 **52** 条（Received 显式 429 或页面文案含 rate limit exceeded；其中 12 条已被 `getJsonWithBackoff` 覆盖但退避预算在满负荷下耗尽——evidence-probe / status-tristate；其余 API spec 的同类改造归阶段二）、③ API 期望/响应形状漂移 **10** 条（invalid 运行无指标键、screen 空体 200、copilot 503、策略列表空、生成错误体形状）、① 结构漂移/死选择器 **16** 条（导航计数 4→5 / 5→12、`.quick-bt-card` 全仓 0 命中、视觉基线 4 张、错误态与历史区块选择器）。
  - **归因方法**：逐条读 playwright 失败详情的 Expected/Received，不定性的不硬归——backtest-engine 的 7 条流程红以「回测失败 rate limit exceeded」为直接证据归 ④；`backtest history` 区块与限流无关归 ①。api-backtest:331（期望两笔不同本金的 `total_return` 深相等）是本轮确认的**错误期望**而非漂移。api-health 三条经隔离复跑取证（仍 429）后归 ④。
  - **红线执行情况**：除 fixme 与本登记表外零改动。

- **阶段二 · ③ API 期望批（✅ 2026-10-23，commit 68ff6dd）**：
  - **清掉的 8 条**（逐条读后端实测响应后对齐，不靠推断）：
    - `api-backtest: persisted report contains all required metrics fields`：`win_rate` 在契约里是 `json:"win_rate,omitempty"`（`tellurion-contracts:engine/contracts.go`），零胜率时键缺席是契约行为。改为「有则必须 number；缺席则 `win_trades ?? 0 === 0`」——缺席只在没有盈利平仓时合法。
    - `api-backtest: larger initial capital …`：深相等是**错误期望**。实测 50 万 vs 200 万（同参数）收益率 0.1164% vs 0.1423%、绝对盈亏 582 vs 2846——100 股整手量化 + 规模相关市场冲击，收益率不是规模不变量。改为断言「平仓笔数不变、买入股数按本金同比例放大」（见下方订正）。
    - `api-negative: /api/screen 空 body`：空 body = 无筛选条件，代理返回 200 + `{count, results}`（契约 `core:docs/openapi.yaml` 的 /api/screen）。改为断言 200 与形状。
    - `api-negative: copilot 空 description`：实测 ai-service 不在线时 /api/copilot/* 整族被反代 fail-closed 成 503；在线时才是 400。改为 `[400,503]` + `error` 必在，请求字段改用活契约的 `description`（旧 `prompt` 会被静默忽略）。
    - `copilot-e2e` 的 4 条 UI 用例：前端自 OBS-12 起按**异步 job** 契约工作（POST 202 `{job_id,status}` → GET `/generate/{job_id}` 轮询到终态），旧 stub 返回同步 `{code,explanation}`，页面拿不到 job_id 必然走「生成失败」。stub 全部改异步两段式；`explanation` 字段已不在契约，该条改名为「code 与策略名都渲染到 UI」。
  - **改归类的 2 条**：`backtest-engine: strategy selector loads strategies from backend`、`strategy-selector: strategy cards render with data` 的根因是 429 期间 `/api/strategies` 取不到（页面卡片为空），不是期望值错——登记表里改归 ④，随 ④ 批处理。
  - **验收**：三条 spec 合跑 `23 passed / 14 skipped / EXIT=0`（含 8 条新绿）；未放宽任何断言为「恒真」，改的两处深相等换成有物理依据的断言并在用例内写清依据。
  - **破坏验证**：把 `win_rate` 那条改回 `expect(typeof report.win_rate).toBe('number')` → 该条重新变红（实得 `undefined`）；逐字节还原后转绿。
  - 登记表 78 → 70 行，fixme 78 → 70 条，两边仍一一对应。
  - **订正（2026-10-24，commit 17dbc36）**：原第三句「收益率同号」**不成立** —— 终态复跑实测同一 payload 50 万 `-0.0037%` vs 200 万 `+0.0182%`（PnL 贴零轴，整手量化 + 规模相关冲击会让符号翻转；早两轮同号只是运气）。该用例改名为 `larger initial capital scales position size (PnL is not a precision invariant)`，断言真实机制：平仓笔数不变 + 买入股数按 4× 本金同比例放大（实测 3300 股 vs 14000 股 = 4.24×，容差带 3~5 倍）+ 两侧总收益率是有限数。不再断言收益率符号或绝对盈亏大小。

- **阶段二 · ④ 共享限流批（✅ 2026-10-23，commit c70bce0）**：
  - **先改姿势，再谈断言（根因不是断言）**：analysis-service 的限流桶是**全进程、每 ClientIP 100 req/min**（`core:pkg/bootstrap/server.go`），整套 playwright 从 `127.0.0.1` 一个 IP 出量，全量必然越额。按 core 仓既有的 e2e 覆盖层重建后端：`core:docker-compose.e2e.yml`（AUD-58）把 `RATE_LIMIT_PER_MINUTE` 抬到 100000，基础 compose 默认值不动。起栈、自检（110 次 `/api/strategies` 应全 200）与恢复默认的命令写进 `e2e/README.md`。**没有放宽、跳过或删除任何断言。**
  - **清掉的 54 条**（52 条登记为 ④ + 2 条原 ③ 复核后改归 ④）：逐条删 fixme 与登记行。其中 11 条在 429 消失后暴露的是**别的原因**，按实测对齐而不是洗红：
    - `backtest-engine`：Naive UI 用 `n-button--loading` class 挡重复提交（DOM 上没有 disabled 属性）→ 断言 loading + 单张进度卡；策略下拉选项类在 Naive 2.44 是 `.n-base-select-option`（旧 `.n-select-option` 0 命中）；「查看报告」是**就地装入本页报告**、不改 URL → 断言指标卡真的出现（旧 `/report=/` 描述的是不存在的路由行为）。
    - `data-sync`：`stocks` 批量作业不写 progress 计数器（`total_items`/`processed_items` 恒 0，progress 由逐 symbol 执行器才 ReportProgress）→ 进度断言改用 `ohlcv` 单票作业；`calendar` 只校验日期**格式**、不校验先后，反向日期可造出真 `failed`（`ohlcv` + `INVALID_SYMBOL` 会被执行器 `continue` 吞掉而成功）；终态 `failed` 意味着自动重试预算已耗尽，手动 retry 按契约返回 400（旧期望 202 与「先 RetryLater 到耗尽才 FailJob」的设计冲突）；SSE 用例在 Node 测试体里 `new EventSource`（Node 无此浏览器全局）→ 改 `fetch` 读流，并**真的断言**收到该作业的 `completed` 事件（旧实现超时也 resolve，等于恒绿）。
    - `data-sync-schedule`：契约字段是 `is_active`（`sync.Schedule`），不是 `enabled`（发 `enabled` 被静默忽略）；PATCH 是整对象替换（`UpdateSyncSchedule` 写全部列），只发局部对象会清空 name/job_type → 带完整对象；表上有 UNIQUE(name)，固定名字复跑撞键（实测 500）→ 每次运行用唯一名。
    - `evidence-probe`：硬编码的 akshare content_hash 已不在 `ingest.raw`（2026-10-23 实测表内 11974 行、该 hash 0 行；深链退化成「未摄取」）→ 改为经平台唯一写门 `POST /api/ingest/raw` 自建**幂等**夹具（content_hash 主键 + ON CONFLICT DO NOTHING），hash 由服务端算出，不再手工维护会腐烂的常量。
    - `rbac-open-access`：ai-service 不在线时 `/api/tools*` 整族被反代 fail-closed 成 503；判据仍是「不得 401/403」。
  - **顺带修的既有 flake（不是本批引入，登记在案）**：`nav-consistency` 的 Tab 焦点环用例在全量套件里红、隔离 `--repeat-each=3` 全绿——根因是 `goto` 返回后侧栏尚未挂载完。改为先等 `.nav-item` 可见再按 Tab（与同文件断言 1 同一纪律：等条件，不等时长）。
  - **验收**：全量 `npx playwright test` → **168 passed / 18 skipped / 0 failed，退出码 0**（4.0 分钟；18 skipped = 16 条 ① fixme + 2 条原有）。登记表 70 → 16 行（全为 ① 结构漂移），fixme 同步 16 条。
  - **破坏验证**：把后端重建回默认 100 req/min，先连打 110 次 `GET /api/strategies` 抽干桶，再跑 `api-health: GET /api/strategies returns strategy list` → **429 红**；恢复 `RATE_LIMIT_PER_MINUTE=100000` 重建后同一条 **绿**。证明这批的绿来自姿势，不是断言被放宽。
  - **留待**：① 结构漂移 16 条仍等 `feat/design-tokens-v2-palette-sweep` 合并（2026-10-24 复核：本仓 `tellurion-ui` 与 origin 均无此分支；该分支只存在于旧仓 `quant-trading-ui`（本地 + origin），尚未迁入本仓）。
    - **订正（2026-10-25，本行上一条 2026-10-24 的复核结论不成立）**：当时的判据是「**分支名**在不在」，而该问的是「**重构内容**进没进」。实测四条：
      ① 旧仓 `quant-trading-ui` 的 main 里有一条合并提交 `cb01fcc Merge pull request #1 from ruoxizhnya/feat/design-tokens-v2-palette-sweep`；`git merge-base --is-ancestor feat/design-tokens-v2-palette-sweep main` **退出 0** ⇒ 分支**已合并**，不领先（`rev-list --left-right --count` = `18 0`，18 全在 main 侧）。
      ② 旧仓 `origin` 今天**已不再有这个分支 ref**（`git ls-remote origin` 只有 `refs/heads/main` 与 `refs/pull/1/head`）——上一条记的「origin 也有」同样不实；本地那个 `remotes/origin/feat/...` 是合并后没清理的陈旧远程跟踪 ref。
      ③ 内容已随迁移进本仓：旧仓 main 与本仓 HEAD 的 `web/src` **文件集完全相同**（120 vs 120，old-only 0、new-only 0），其中 **103 个 blob 逐字节相同**。17 个不同**逐条对上出处**、无悬空项：12 个是本仓五批后续改动——UI-01（`d12b07a`/`837207c`：`format.ts(+test)`、`DataQualityPanel.vue(+test)`、`MarketMetrics.test.ts`）、UI-02（`166c4b1`：`runStatus.ts(+test)`、`QuickBacktest.test.ts`）、API-01（`3d6e321`：`client.ts(+test)`、`apiMessage.ts`）、REV-01-A 注（`34c1cbe`：`runStatus.ts`）、QT-61（`d7a4ad5`/`1075c28`：`SchedulePanel.test.ts`）；**另 5 个只是注释里的旧仓名** `quant-trading:` → `tellurion:`（`api/sync.ts`、`api/sync.test.ts`、`types/sync.ts`、`utils/jobActions.ts`、`utils/jobActions.test.ts`——逐对 `wc -l` 相等、diff 各只有那一行）。**没有一处是重构回退。** 再抽查四个重构落地文件：`styles/palette.ts`、`styles/palette.test.ts`、`styles/variables.css` 的 blob 与旧仓 main **逐字节一致**，`utils/runStatus.ts` 是本仓 UI-02 改的。
      ④ 重构产物在本仓仓内可用，但 16 条的**落点分三档**（逐个组件核过，不是一套姿势）：`web/src` 内 `data-testid` 共 288 处——**可直接换 testid**：`QuickBacktest.vue` 6 个（`quick-invalid`/`quick-failed`/`quick-unknown-status` 三对；登记表里 `.quick-bt-card` 那条确属死选择器，实际类是 `.quick-result`）、`ConsoleHistory.vue` 1 个（`console-history-status`）、同步族四块面板各有；**只有类锚、零 testid**：`NavTiles.vue`（`.nav-tiles` / `.nav-tile` 在，`:3`）、`MarketMetrics.vue`（`.metric-item` / `.metric-label` / `.metrics-row`；注意 `metric-card` 这个类只在 `BacktestCompare.vue`，dashboard 上没有）、`AppSidebar.vue`（`class="nav-item"`，`:18`）；**视觉基线 4 条**（`visual-regression`）不吃选择器——要动的是快照本身（重生成），与前三档姿势不同。⇒ 后一档若按 ③ 的纪律「选择器优先 `data-testid`，不靠文案/DOM 位置」做齐，**Dashboard 族 + 侧栏要补 testid，那是前端改动**，得写进 ① 批的边界，不能算"只对齐测试"。
      ⚠️ 另记一条**本批的陷阱**（不是核对项）：视觉那 4 条用 `npx playwright test --update-snapshots` 重生成基线**等于用新截图当真相**，跑完必然绿，本身不构成验收。收口时要留下判据（对着 `docs/design/visual.md` / DESIGN.md v2.0 核对，或人工过目后在登记行写明"谁看过、看了什么"），否则那 4 条就是把 fixme 洗成不可信的绿。
      ⇒ **AUD-61 ① 批的前置已解除**，「等合并」不再是理由；剩下 16 条 fixme 的阻塞换成了**运行环境**（见下行），不是设计系统未落地。登记表 16 行与 spec 里 `fixme("AUD-61` 的 16 处命中仍一一对应，本条未动任何断言/选择器/期望值。
    - **① 批今天真正的阻塞（2026-10-25 实测）**：全量 e2e 起不来——`com.docker.service` 状态 **Stopped**（`docker version` 连不上 `dockerDesktopLinuxEngine` 命名管道），且 `5173 / 8081 / 8085 / 5432 / 6379` **无一个在监听**（`netstat -ano` grep 空）。本单 ③ 要求里对阶段二的规定是「按页重对齐选择器与期望值——每批一个 commit」，验收必须有实测与破坏验证，**在没有三服务的环境里盲改选择器＝把 16 条 fixme 洗成不可信的绿**，撞本单红线。⇒ 需要先把栈起起来（`docker-compose.e2e.yml`，含 `RATE_LIMIT_PER_MINUTE=100000` 那条覆盖层）再按批做。

- **实测登记（2026-10-14，A-07 收口时顺手取的真实读数；阶段一的 fixme 转换仍未做）**：
  - **179 条用例 = 61 failed / 116 passed / 2 skipped**（`workers: 1`，本地栈齐全）。
    **本节 ② 里"127 passed / 34 failed"那份 2026-09-26 的历史读数已经过时**，
    红条数在涨（34 → 61），而涨的部分主要是下面第 ④ 类（共享限流）与第 ① 类（死选择器）。
  - **一处方法学错误必须先认**：此前两次"全量套件 0 failed"的读数**都是错的** ——
    命令写成 `npx playwright test | tail -30`，**管道把退出码换成 `tail` 的 0**，
    而截断恰好把红清单整段切掉。判据只能是不截断重跑 + 读 playwright 自己的退出码
    （`EXIT=1`）。台账里 A-06 那条"全量 0 failed"已按此更正。
  - 按 spec 的红分布（共 61）：copilot-e2e 9、backtest-engine 9、data-sync-error 6、
    data-sync 6、rbac-open-access 5、dashboard 5、evidence-probe 4、critical-e2e 4、
    visual-regression 3、strategy-selector 2、status-tristate 2、api-negative 2、
    api-backtest 2、data-sync-schedule 1、cross-navigation 1。
  - 四类根因，各附**当场核过**的证据：
    ① **死选择器 / 结构漂移**（阶段二的活）。例：`dashboard.spec.ts:75` 等
    `.quick-bt-card` —— `git show HEAD:web/src/components/dashboard/QuickBacktest.vue`
    里**这个类名 0 命中**，全仓也 0 命中 ⇒ 这条红与本轮改动无关，早于本轮。
    ② **strict-mode 撞上后加的结构**。例：`backtest-engine.spec.ts:49` 断
    `.n-button--primary-type` 唯一，但 `BacktestEngine.vue` 的同步/异步切换
    （`asyncMode = ref(true)`，HEAD 里 `:155` 就是这个默认值）让页面上有**两枚**
    primary 按钮 ⇒ 选择器必须换 `data-testid` 或 `getByRole(name)`。
    ③ **纯 API 用例的数据期望**。例：`api-backtest.spec.ts:174` 断
    `typeof report.win_rate === 'number'` 实得 `undefined` —— 这与 OBS-01 同源：
    被判 `invalid` 的运行**指标键是缺席的**（2026-10-14 实测：`POST /api/backtest`
    拿 `["csi300"]` 当票池，返回里没有 `total_return`/`sharpe_ratio`，却带着
    `sortino_ratio=1.79e+308`）。用例假设"每次运行都带全指标"，那个假设已经不成立。
    ④ **共享限流**。本地 analysis-service 的限流桶是**全进程共享**的，一次全量套件
    里 `GET /api/backtest` 会 429，于是 `expect(res.ok())` 在**与自己改动无关**处变红。
    本轮已把我自己写的两条 spec（`evidence-probe` / `status-tristate`）的取值 helper
    改成走 `helpers/api.ts` 新增的 `getJsonWithBackoff` —— **只对 429 退避**
    （404/500 照旧响），且退避预算必须远小于 30s 用例超时（第一版写 8×5s=40s，
    把"429 红"变成了"超时红"，归因更难，已改）。其余 spec 的同类改造属阶段一/二，
    **不在这里全仓铺开**。
  - 红线不变：不得为消红放宽断言或删用例。上面 ③ 那条若要改期望值，必须先在
    core 侧确认"invalid 运行不带指标"是**契约**而非缺陷（`contracts.CheckValidity`
    与 ResultSpec 的口径支持前者），改的时候在登记行写明依据。

- **V-3 基线登记（2026-10-14，A-08 收口时改判；归本表是因为它动的是测试基础设施）**：
  - `e2e/tests/visual-regression.spec.ts` 的 **data-sync 那张基线**从「遮四块」改成「route fixture 固定 8 条端点」，基线 png 已重生成。
  - 改判依据是实测不是偏好：遮罩版**单独连跑三轮全绿**，但全量套件里同一条用例红了 —— 遮罩只糊像素**不改布局**，被遮的队列面板行数一变就变高，下面每块整体下移进视口。那个"三轮绿"什么也没证明。
  - 双向取证：① 先跑 `a08-job-console`（含改真库的 cancel 腿）再跑这条基线 → 仍绿（不敏感）；② 临时脚手架量得「换 fixture 时 queue/schedule/readout/quality/datasource 五块像素全变」+「同一 fixture 两次整页逐字节相同」→ 基线不是空跑（脚手架跑完即删，不进提交）。
  - 代价（明写）：视觉网**不再覆盖真数据渲染**；页面将来消费新字段时 fixture 必须跟着补，补漏 = 基线照常绿而界面已错。兜底是 A-08 的真后端功能断言 + 组件单测。
  - 本轮新增 e2e：`a08-job-console.spec.ts` **6 条逐条绿**（真后端只读腿 + 真 cancel 写一次 + 三条拦截腿，分界与理由写在文件头），全量运行里也绿。

- **全量复跑读数（2026-10-14，A-08 收口后；上面那份"61 failed"已经过时）**：
  - `npx playwright test` → **79 failed / 104 passed / 2 skipped**（185 条，退出码 1，`workers: 1`，12.5 分钟）。
  - 相对 61 红涨了 18 条，涨的**全部**在纯 API spec：`api-negative` 2→11、`api-backtest` 2→5、`api-health` 0→3、`api-strategy` 0→2、`backtest-engine` 9→11。抽样核对到根因第 ④ 类：`api-negative.spec.ts:15` 的红是 `Expected: 400 / Received: 429`（要 400 拿到限流），不是新缺陷；`api-backtest.spec.ts:186` 是第 ③ 类（`win_rate` 在 invalid 运行里缺席）。
  - 同一次跑里 `visual-regression` 从 3 红降到 2 红（data-sync 那条基线改走 fixture 之后转绿；剩下两条是 `backtest page` 与 tablet 响应式，属第 ①/② 类，早于本轮）。
  - **阶段一的处置建议不变**：先做 fixme 登记再谈对齐 —— 但登记时请把"限流红"与"断言红"分列，否则 429 会把真缺陷淹掉。本轮不做那件事（它是独立可交付的一整块，且需要一次干净环境的基线跑）。

- **④ 约束与非目标**：
  - DO NOT 放宽/删除断言、改期望值迁就现状、把红改成裸 `skip`——消红唯一合法路径是对齐选择器与期望。
  - DO NOT 在设计系统重构落地前做阶段二的重对齐（防白做工）。
  - DO NOT 动 `web/src` 生产代码——e2e 债归 e2e；对齐过程中发现的前端缺陷另立工单，不在本单修。
  - DO NOT 改 `e2e/playwright.config.ts` 与 `helpers/isolation.ts` 的隔离机制（库级隔离是防测试串数据的护栏，AUD-62 同源教训）。
- **⑤ 验收**：
  - 阶段一：`npx playwright test` 输出 **0 failed**（红全部以 fixme 形式登记在案，报告可见 fixme 注解）；登记表行数 == fixme 总数；随机抽 3 条与实测红清单核对一致。
  - 破坏验证（护栏必验）：任选一条登记项**去掉 fixme 前缀重跑 → 该条必须重新变红**（证明 fixme 没把真红藏起来）→ 逐字节还原。
  - 阶段二：每批对齐后全量套件仍 0 failed；批次收口时登记行同步清除，最终登记表为空。
- **⑥ 边界**：只做 `e2e/` 目录 + 本登记表；前端生产代码缺陷、core 侧问题均另立工单。

---


<a id="AUD-63"></a>
## AUD-63 · 三个组件的窄 `data-testid` 落地（裁决 ⑳ 的例外，AUD-61 ⑥ 不许改模板）[P2] ✅（2026-11-10：无栈轨 11-07 + 真栈轨/破坏验证/计数据全绿，含 `market-metric-*` 四锚点）

> **为什么要单独一张单**：AUD-61 的 ⑥ 边界原文「**只做 `e2e/` 目录 + 本登记表；前端生产代码缺陷…另立工单**」，而 ① 批要动的是 `.vue` 模板——AUD-61 自己 `:104` 就写了「Dashboard 族 + 侧栏要补 testid，**那是前端改动**，得写进 ① 批的边界，不能算“只对齐测试”」。第三轮裁决 ⑳ 于是裁了窄例外，但台账 `:30` 如实登记「⑳ 窄 `data-testid` ⛔：仅授权三件，**但无六字段单**——缺 testid 命名规则、断言清单与“是否允许改组件模板”的授权」。**本单补的就是这三样缺失**，补完即解除「无单」这一半阻塞；「真栈未起」那一半仍由裁决 ⑥ 的两轨制处理（见 ⑤）。

- **① 目标**：给 `NavTiles.vue` / `MarketMetrics.vue` / `AppSidebar.vue` 补 `data-testid`，并把命名规则与断言清单成文，使这三块 e2e 选择器不再靠文案或 DOM 位置（重构即碎）。
- **② 上下文**：K 组取证基线（台账 `:29`，2026-10-26 实测）`rg -n 'data-testid' --glob '*.vue'` = **113 行 / 14 文件**（`web/src` 全口径 288 行 / 25 文件）；三个目标组件的锚点（`:104` 逐组件核对的结论）：`NavTiles.vue` 有 `.nav-tiles` / `.nav-tile`（`:3`）**零 testid**、`MarketMetrics.vue` 只有 `.metric-item` / `.metric-label` / `.metrics-row`（注意 `metric-card` 这个类只在 `BacktestCompare.vue`，dashboard 上**没有**）、`AppSidebar.vue` 是 `class="nav-item"`（`:18`）**零 testid**；可直接换 testid 的对照组（`QuickBacktest.vue` 6 个、`ConsoleHistory.vue` 1 个）已在册；视觉基线 4 条（`visual-regression`）不吃选择器，**不在本单**（要动的是快照本身，属裁决 ⑥ 的另一腿）。
- **③ 要求**：① **先统计再定名**：从既有 113 处里取主流风格（开工前跑 `rg -o 'data-testid="[^"]+"' --glob '*.vue' | sort | uniq -c`），命名规则成文写进本登记表头或 `docs/design/`，**禁止自造第四种风格**；② 三个组件按规则加 `data-testid`，**纯增量属性**——不改类名、不改结构、不改文案（裁决 ⑳ 原话）；③ 把 AUD-61 登记表里指向这三块的死选择器/文案选择器改成 testid 锚定，**对齐一条同步删除该条 fixme 与登记行**（阶段二纪律原文）；④ **单独 commit**（裁决 ⑳ 原话，不与 e2e 对齐混提）；⑤ 若某条用例改完仍红，那是真红，按 `AGENTS.md` §3 红线**登记**而非放宽断言或 `skip`。
- **④ 约束与非目标**：不改组件的类名/结构/样式/文案；不批量给其余 11 个文件铺 testid（超出三件即另立单）；不动 `e2e/playwright.config.ts` 与 `helpers/isolation.ts` 的隔离机制（`:162` 红线，AUD-62 同源教训）；不引新测试框架（vitest/playwright 之外不加）；不重生成视觉基线（裁决 ⑥ 的另一腿）；**禁止**把 34 条已知红改成跳过或放宽断言来变绿。
- **⑤ 验收**：① 无栈轨现在可做：`npm run lint` + `npm run typecheck` + `npm test`（`lint:tests` + `vitest run`）三条绿，贴真实退出码；② 真栈轨需起齐 `:5173 / :8081 / :8085` 后 `npx playwright test` 跑到那几条被对齐的用例，**未跑就如实标注「本腿未执行」，不许用 skip 冒充通过**；③ 破坏验证（护栏必验）：删掉三个新 testid 中任一个 ⇒ 对应用例必须红（证明断言真指着它），还原复绿；④ 登记表里被对齐的条目其 fixme 与登记行已同批删除，`git grep -c fixme` 计数下降且下降数与对齐数一致；⑤ 命名规则成文且新增三处与规则逐字一致。
- **⑥ 边界**：只这三个 `.vue` 的模板属性 + 对应 e2e 选择器 + 登记表行；其余 11 个 `data-testid` 文件的批量对齐、视觉基线重生成、真栈 CI 各归各单（裁决 ⑥ 两轨制）。

- **testid 命名规则（2026-11-07 定，取自既有 110 处的主流风格，不自造第四种）**：
  1. **全小写 kebab-case**，`<区块前缀>-<元素>[-<限定>]`；前缀取组件归属域（`nav` / `market-metric` / `nav-item`），不用组件文件名。
  2. **禁止** camelCase、下划线、中文、空格；静态值里**不留 `/`**（路径段一律换成 `-`）。
  3. 列表项用**显式字段或模板字符串**生成确定值，不靠数组下标（下标会随排序漂移）：
     静态列表（如 `NavTiles` 的 5 块）在数据对象里写 `testid` 字段；动态列表（如侧栏）用 `:data-testid="navTestId(item.path)"`。
  4. 与既有 110 处的写法逐字一致（`queue-*` / `schedule-*` / `readout-*` / `login-*` 等即此规则）。

  | 组件 | 新增 testid |
  |---|---|
  | `NavTiles.vue` | 容器 `nav-tiles`；磁贴 `nav-tile-backtest` / `nav-tile-screener` / `nav-tile-strategy-lab` / `nav-tile-copilot` / `nav-tile-batch` |
  | `MarketMetrics.vue` | 空态 `market-metrics-empty`；读数容器 `market-metrics`；四格 `market-metric-close` / `market-metric-pct` / `market-metric-volume` / `market-metric-amount` |
  | `AppSidebar.vue` | 容器 `app-sidebar` / `sidebar-nav`；导航项 `nav-item-home` / `nav-item-explore` / `nav-item-evidence` / `nav-item-backtest` / `nav-item-backtest-compare` / `nav-item-strategy-lab` / `nav-item-strategy-builder` / `nav-item-copilot` / `nav-item-factors` / `nav-item-screener` / `nav-item-data-sync` / `nav-item-alerts` |

- **施工记录（2026-11-07）**：
  - **已落**（3 文件，纯增量属性）：`web/src/components/dashboard/NavTiles.vue`（容器 + 5 磁贴；`NavTile` 接口加 `testid` 字段）、`web/src/components/dashboard/MarketMetrics.vue`（空态 + 容器 + 四格）、`web/src/components/layout/AppSidebar.vue`（`aside` / `nav` 容器 + 每项 `navTestId(path)` 生成；未改类名、结构、样式、文案）。
  - **无栈轨实测**（`web/` 下，2026-11-07）：`npm run lint` → **exit 0**（`✖ 945 problems (0 errors, 945 warnings)`，警告均为既有 `vue/max-attributes-per-line` 一类的格式提示，本单未新增 error）；`npm run typecheck` → **exit 0**；`npm test` → **exit 0**（`Test Files 38 passed / Tests 540 passed`）。
  - **未执行腿（故记 🔶 非 ✅）**：③ 的 e2e 选择器改写**未做**——四行登记项（`dashboard: sidebar navigation renders with all items`、`dashboard: metrics cards render with labels`、`dashboard: navigation tiles are present and link to correct routes`、`cross-navigation: Dashboard nav tiles navigate to correct routes`）的期望值本身已过期（侧栏 5→12、磁贴 4→5 且 `因子分析` 已不在磁贴里、指标卡指向的是 `.metric-card` 族而非 `MarketMetrics`），改期望值属**内容裁决**而不是换选择器，且必须真栈跑到才能取证；`5173 / 8081 / 8085` 本轮未起 ⇒ ③ 与其 fixme/登记行删除、⑤③ 破坏验证、⑤④ 计数下降三条**一律未执行**，不标通过。
  - **边界守住**：未动 `e2e/` 任何文件、未动 `playwright.config.ts` / `isolation.ts`、未给其余 11 个文件铺 testid、未重生成视觉基线。

- **施工记录（2026-11-10，真栈轨 ② + 破坏验证 ③ + ⑤④ 计数）**：
  - **起栈**：本机无 Docker，起原生三服务栈（真 PG 16.15 `tellurion_ui_e2e` + data `:8081` + analysis `:8085` + vite `:5173`），方法/坑同 AUD-61 阶段二 ① 批那节。
  - **② 真栈轨（已执行）**：四条登记项（`sidebar navigation renders with all items` / `navigation tiles are present and link to correct routes` / `cross-navigation: Dashboard nav tiles navigate to correct routes` / `metrics cards render with labels`）在真栈上**全绿**，含在 AUD-61 ① 批「还原后合跑 14 passed / EXIT=0（11.9s）」里。其中 sidebar 走 `[data-testid^="nav-item-"]` 计数 12、tiles 走 `[data-testid^="nav-tile-"]` 计数 5 —— 用的正是 2026-11-07 落的窄 testid，不是文案/位置选择器。
  - **③ 破坏验证一**：把 `web/src/components/dashboard/NavTiles.vue:49` 的 `testid: 'nav-tile-strategy-lab'` 改成 `-del` ⇒ `navigation tiles are present…` 与 `strategy-selector: navigation from dashboard works` **双红**；逐字节还原后 `SHA256=9FFFFBB044D2A51C97AE08F1B33BD93B7AD8C8A40CC5E1DAB75C745E32E13516` 与破坏前一致，复绿。
  - **③ 破坏验证二**：把 `web/src/components/dashboard/MarketMetrics.vue:36` 的 `data-testid="market-metrics-empty"` 改成 `-del` ⇒ `metrics cards render with labels` **红**；逐字节还原后 `SHA256=300F7037A37A02C889FAB33D71E7787BA9A4FC7C93F236D9A81173A92D28EF69` 一致，复绿。
  - **四个读数锚点（2026-11-10 晚补证，原记「未验证」已解除）**：当天先行取证时 dashboard 市场概览恒走空态，`market-metric-close/pct/volume/amount` 一次也没渲染；根因是跨仓读链断了（core 反代 `/market/index` → data 404 → 502）。core 侧改成**本地供数**（`cmd/analysis/handlers_market_index.go` + `pkg/storage/index_daily.go` 的 `LatestIndexBars`，裁决 ⑰ 口径；详见 core 台账 `SVC-CORE-DATA-RETIRE` 的 2026-11-10 记录）后，用同一个原生栈（analysis `:8085` 接真 PG `tellurion_market_index_test`，播 4 行指数日线；vite `:5173`）复验：
    - `npx playwright test tests/dashboard.spec.ts -g "metrics cards render with labels"` → **1 passed (1.6s)**，走的是有读数那一支（4 个 `.metric-item` + 四标签）。
    - DOM 探针（Playwright 直读）：`market-metrics`=1、`market-metrics-empty`=0；`market-metric-close` 文案「收盘价 3,825.50」、`market-metric-volume`「成交量 4.2亿」；默认选中 `000001.SH` 只有一期 bar ⇒ `pct`/`amount` 渲染「未读取」，与「missing≠0」契约一致（不是缺陷）。
    - **破坏验证三**：把 `MarketMetrics.vue` 的 `data-testid="market-metric-close"` 改成 `-del` ⇒ 该用例**红**；逐字节还原后 SHA256 `300F7037A37A02C889FAB33D71E7787BA9A4FC7C93F236D9A81173A92D28EF69` 与破坏前一致，复绿。
    - ⇒ ⑤③ 的「删三个组件任一新 testid 必红」今天对 `nav-item-*` / `nav-tile-*` / `market-metrics-empty` / `market-metric-close` 四类均成立；四条登记项与非空读数支都被真栈跑过。
  - **⑤④ 计数**：四条登记项的 fixme 与登记行已随 AUD-61 ① 批同笔删除；`e2e/tests` 现存 fixme **0 条**（原 4 条视觉基线已于 2026-11-10 晚随 AUD-61 ① 批视觉腿核对并重生成、整份 spec 12 passed，原「1 条缺真行情数据」已于 2026-11-10 晚在真 PG + 真引擎下清除）。
  - **边界守住**：`web/src` 两文件仅破坏验证期间临时改动且已逐字节还原（SHA256 复核）；未给其余 11 个文件铺 testid、未动 `playwright.config.ts` / `isolation.ts`、未重生成视觉基线。

---


<a id="UI-03"></a>
## UI-03 · 375 宽下侧栏不折叠，正文列被压到一两个字宽 [P2] ✅ 完成（2026-11-10）

- **① 目标**：≤768px 视口下侧栏默认收起（或按 visual.md §5.2 的 `display:none`），正文列拿到可读宽度；375 宽下不再出现「一行一两个字」的换行。
- **② 上下文**：2026-11-10 AUD-61 ① 批视觉腿逐张核对实际截图时取证（`e2e/test-results/.../dashboard-mobile-actual.png`，375×667）：`.app-sidebar` 仍占 ~215px（视口的 57%），`.main` 只剩 ~160px，市场概览与磁贴标题被压成一字一行。规范依据：`docs/design/visual.md` §5.2「`@media (max-width: 768px)` 时 `.app-sidebar` 可 `display:none` 或折叠」，当前实现只有 header 的手动汉堡开关，没有断点级默认收起。既有基线（2026-10-23）同样如此，差异仅 1%，**不是 2026-11-10 重生成引入**。
- **③ 要求**：① 在 `web/src` 的布局层加断点规则（≤768px 默认收起，≥769px 维持现状）；② 收起态要留 header 的展开入口，且展开后仍可用；③ 视觉基线随修复重生成（4 张里的 mobile 一张），并在 AUD-61 那节的偏差记录里回填撤除说明。
- **④ 约束与非目标**：不改 DESIGN.md 的 token/字号/配色；不重排桌面端布局；不动 e2e 断言与 testid。
- **⑤ 验收**：375×667 下 `dashboard-mobile.png` 更新后侧栏不再占位（正文列 ≥90% 视口宽）；`npx playwright test tests/visual-regression.spec.ts` 绿；**破坏验证**：把断点改回 0 宽 → mobile 基线必须红，还原绿。
- **⑥ 边界**：只做侧栏断点行为 + 该一张基线；其余响应式页面（回测页平板/手机）另立。

> **结案记录（2026-11-10）**：
> - **改动**：`web/src/components/layout/AppLayout.vue:22-24` —— `collapsed` 初值从 `ref(false)` 改为 `ref(window.matchMedia('(max-width: 768px)').matches)`（新增常量 `SMALL_VIEWPORT`），桌面端行为逐字节不变；`AppHeader` 的 `@toggle-sidebar` 接线未动，收起态下点汉堡仍可展开（`collapsed = !collapsed`）。
> - **取证（先看实际渲染再盖章）**：改后在 375×667 取实际截图，侧栏由 ~215px 变为 60px 图标栏，市场概览/快速回测正文列可读（不再一字一行），`运行` 按钮完整可见；768×1024 平板同样收到 60px 图标栏，回测表单两列正常。
> - **基线**：`--update-snapshots` 只重生成 `dashboard-mobile-chromium-win32.png` 与 `backtest-tablet-chromium-win32.png`（桌面两张 0 差异、未重写）；整份 `visual-regression.spec.ts` 复跑 **12 passed EXIT=0**；`npx vue-tsc --noEmit` **EXIT=0**。
> - **破坏验证**：把 `SMALL_VIEWPORT` 临时改成 `'(max-width: 0px)'` ⇒ `dashboard responsive on mobile viewport` **17052 px（7%）红 / EXIT=1**；改回 `768px` 后复跑 **2 passed / EXIT=0**。首次改回后跑红一次是 vite HMR 未及时热更（17k px 全等破坏态），隔一次复跑即绿，已如实记录。
> - **观察到但未在本单修**（不在 ⑥ 边界内，留档）：375 宽下 header 的站点名「Quant Lab」会折成两行（`AppHeader` 的标题未设 `nowrap`），以及右侧 `API: 在线` 徽标与时钟偏挤；如需处理另立单。

---


<a id="API-01"></a>
## API-01 · client.ts 把后端 4xx 原话换成通用文案（🟠 全站错误可读性）✅ 完成（2026-10-22）

- **① 目标**：任何一次 4xx 失败，界面上出现的**是后端那句话说**，而不是按状态码查表得到的「请求参数有误」。
- **② 上下文**（2026-10-14 A-08 步骤 4 浏览器实测当场抓出）：
  - 表单填非法 cron ⇒ 界面显示「请求参数有误」；同一请求 `curl` 实测后端返回
    `{"code":"bad_request","error":"invalid cron expression: expected exactly 6 fields, found 3: [99 99 99]"}`
    —— 原话**到了浏览器**，被前端丢掉。
  - 丢的位置：`web/src/api/client.ts:247` `const message = getStatusMessage(res.status, errMsg)`，
    而 `STATUS_MESSAGES`（`:62-74`）给 400/401/403/404/409/422/429/5xx 都备了中文模板，
    `getStatusMessage` **模板优先**，`errMsg`（后端原话）只在模板缺失时才用。
    `ApiError.body` 里原话仍在（`:242` 已把 body 存下来），所以是可恢复的，不是后端缺陷。
  - 后端侧口径（core 仓 `pkg/httpserver/errors.go:100-108`、`:163-176`）：4xx 透传
    `err.Error()` 到 `error` 字段；**≥500 故意只给人话 + code**，细节留服务端。
    所以本单只动 4xx 这一支，5xx 的通用文案是对的、不要改。
  - A-08 已在边界内止血：新增 `web/src/utils/apiMessage.ts`（读取顺序 **后端原话 > 通用文案 > 兜底串**），
    `stores/sync.ts` 的 13 处错误写入与排程表单统一走它 —— 本单要解的是**其余所有页面**仍在显示模板。
- **③ 要求**：
  1. `client.ts` 里把优先级反过来：**4xx 有可用原话就用原话**，否则退回模板；5xx 恒用模板。
  2. 抽掉的模板不能变成空白：body 里 `error/message/detail` 皆空时仍落模板（`apiMessage.ts` 已有这条口径，复用而不是再写一份）。
  3. 三条钉旧口径的既有测试按**行为变更**更新（不是为消红改断言）：`client.test.ts:115`（404 localized）、`:127`（418 `error: 'I am a teapot'`）、`:142`（429）。
  4. 更新后全站复核：`Screener`/`BacktestEngine`/`Dashboard`/`Copilot` 各挑一条 4xx 路径确认文案来源可质问。
  5. 透传护栏（2026-10-21 批准时追加）：只对 **4xx** 生效；`error/message/detail` 全空或全空白时回退模板；结果串超过 **500 字符**截断并以 `…` 收尾；**按纯文本渲染**（`textContent`/插值），禁止 `v-html`，防 XSS。
- **④ 约束与非目标**：不改 5xx 与 401 的会话处理链（`refreshSession`/`settleUnauthorized` 那条不变）；不改 `ApiError` 的字段与 `isClientError` 等判定；不动后端任何响应形状；不把错误文案做 i18n。
- **⑤ 验收**：
  - 单测：400 带 `body.error` ⇒ `ApiError.message` 等于后端原话；400 不带 ⇒ 等于「请求参数有误」；500 带细节 body ⇒ **仍**是模板（证明没把后端内部错误暴露出去）。
  - 破坏验证：把优先级改回模板优先 ⇒ 上述第一条红，还原绿。
  - 真请求：非法 cron 与非existent 资源各一次，屏幕文案与 `curl` 的 `error` 字段逐字一致。
- **⑥ 边界**：只改 `api/client.ts` 的 message 取值一处 + 相关测试；`apiMessage.ts` 的调用点不改语义（它自然变成透传）。

> **✅ 完成记录（2026-10-22）**
>
> **交付**：`web/src/api/client.ts` 新增 `resolveErrorMessage()`（**后端原话 > 模板 > statusText**）+ 导出的 `serverBodyText()`（`error > message > detail`，全空白 = 没有，>500 截断加 `…`）；
> `request()` 的错误分支改用它，非 JSON body 落模板而不是把 `statusText` 当原话。
> **一份实现两处用**：`utils/apiMessage.ts` 删掉自带的 `bodyText()` 改 import `serverBodyText`（③-2；那两份过去各长一角，正是口径漂移），
> 并**就地订正了 A-08 写在文件头的那段边界声明**——「不改 client.ts，另有三条测试钉着旧口径」已被本单推翻，原文改写成「止血 → 同一口径的消费侧读法」。
> 5xx 一支未动（④）；`ApiError` 字段与 `isClientError` 等判定未动；`refreshSession`/`settleUnauthorized` 链未动。
>
> **③-5 五条护栏逐条落点**：① 只对 4xx（`status >= 400 && < 500`）→ 护栏 1a 用一条带 `password=` 的 5xx body 钉住「不显示但保留在 body」；
> ② 全空白回退模板（`{error:'   ', message:'\n\t '}` → 「数据验证失败」）；③ >500 截断加 `…`，**另加一条 500 恰好不截断的边界腿**（防把 `>` 写成 `>=`）；
> ④ 键序 `error > message > detail`；⑤ 纯文本：`client.ts` 源码级断言无 `v-html|innerHTML|document.write|insertAdjacentHTML`（用 Vite `?raw` 读源码，jsdom 下 `import.meta.url` 不是 `file:` 协议，`readFileSync` 会拒）。
> 全仓 `v-html` 扫描：**0 处真实使用**（唯一命中是 `components/validation/VerdictPanel.vue:93` 的一句「不走 v-html」注释），所以「后端原话当纯文本渲染」今天整体成立，不只是这一层。
>
> **⑤ 验收逐条（真退出码）**
> 1. 单测：`npx vitest run src/api/client.test.ts` → **36 passed**（含新增 10 条 + 2 条 `serverBodyText` 口径腿）；
>    `npm test`（lint:tests + vitest run）→ **38 files / 517 tests passed**；`npm run typecheck`（vue-tsc）→ **0 error**；
>    `npx eslint` 三个改动文件 → **0 problem**，且**顺带关掉全仓唯一那条 lint error**（`preserve-caught-error`，我在 helper 里造的 symptom error 没带 `cause`）。
> 2. 三条旧口径测试按**行为变更**处理：`:115` 的 404 断言从「请求的资源不存在」改成后端原话 `gone`（并补一条空 body 仍落模板的对照腿）；
>    `:127`（418 未映射 → 原话）与 `:142`（429 空 body → 模板）**在两种口径下同结果**，未改断言、只复核了一遍它们不构成旧口径的证据。
> 3. **破坏验证（现场，真退出码）**：把 `resolveErrorMessage` 改回模板优先 → **5 条红**
>    （`404 with a server message…`、护栏 1、护栏 3、护栏 3a、护栏 4），退出码 **1** → 还原（`grep -c 破坏验证腿` = 0，`git diff --stat` 只剩本单 45 行新增）→ **36 passed**。
> 4. **③-4 全站复核：静态做完，运行时未做**。四个页面的错误文案都取 `ApiError.message`，因此随本单自动变真：
>    `pages/Screener.vue:144`、`pages/BacktestEngine.vue:375`、`pages/Dashboard.vue:148`、`pages/Copilot.vue:101`（另 `Alerts.vue:277`、`BacktestCompare.vue:298` 同形）。
> 5. **⑤-3 真请求：未执行**。`curl :8085/api/health`、`:8081`、`:5173` 全 `000`（本机栈未起，`docker ps` 无容器）。
>    ⇒ 「非法 cron 与不存在资源的屏幕文案与 `curl` 的 `error` 字段逐字一致」这条**没有实测凭据**，只有单测凭据；
>    起栈后要做的是：填非法 cron（`99 99 99`）看告警条，以及请求一个不存在的 job id。这条腿属于「mock 抓不到的缺陷」高危区，不要当成已过。
>
> **做的技术决定与代价**：
> - **401 也走透传**（它是 4xx）。会话处理链一行没动，只换了「refresh 失败最终落屏的那句话」。代价：登录过期时界面可能显示后端英文原话而不是「未授权，请重新登录」。
> - `statusText` **不再当原话候选**（旧代码 `errMsg` 会把 `Bad Request` 喂给模板兜底）。代价：没模板也没 body 的冷门 4xx（如 418 无 body）会落通用文案而不是 `statusText` —— 418 那条测试测的是带 body 的形状，不受影响。
> - 截断放在**共享提取器**里，不在展示层：`apiMessage()` 与 `client.ts` 同一条口径，面板拿 `err.body` 也不会绕过 500 上限。
> - 未做 i18n（④）；未改后端任何响应形状。


<a id="DATA-14"></a>
## DATA-14 · 空列表编码成 `null` 而不是 `[]`（🟠 契约说谎，任何客户端都会踩）✅ 执行地已闭合（core，2026-10-24）· 本仓只留指针 · **已迁 core（2026-10-21，原号 DATA-04，SPEC-R-03 换号）**

> ⚠️ **状态订正（2026-10-26 实测）**：本行原写「⬜ 待做」，而执行地 core 的同名单早已闭合——
> `tellurion:docs/TASKS.md:2076` 的标题就是「DATA-14 · 空列表编码成 `null` 而不是 `[]`…… **✅（2026-10-24）**」。
> 两仓同一单两种状态，读 ui 台账的人会以为还有活要做。本仓**不重做、不回填正文**，只把指针的状态改成与执行地一致。

> **正文已整体迁至 `tellurion:docs/TASKS.md`「七、存量任务」`DATA-14`（原 DATA-04）**（ID 换号、六字段原样不改写；归属是 core 的 `cmd/data` + `pkg/storage`——原注「等那份文件空出来应把本节整体迁过去，本仓只留指针」即此）。执行与验收在彼处，此处不镜像；改动请去彼处改，勿在此回填正文。


<a id="SPEC-R-02"></a>
## SPEC-R-02 · 五张无主表 owner 认领（不在本仓，本仓留指针）✅ 2026-10-21

> `users` 表唯一 owner = core（ADR-017 鉴权域，写者 `tellurion:pkg/auth/auth.go`）；本仓只经 `/api/auth` 只读消费。
> 正文与五表认领结论在 `tellurion:docs/TASKS.md` §九；本仓 `docs/db-schema.md` §1「鉴权 / 会话」行已同步表名。


<a id="UI-01"></a>
## UI-01 · 「研究质量读数」文案过期 + `fmtVolume/fmtAmount` 把 0 读成缺失（两处界面在撒谎）✅ 完成（2026-10-22）

> 2026-10-16 做 core 仓 DATA-03 + DATA-07 合体单时顺带实测发现，归属本仓（前端展示与文案）。
> 那两单里已改的是**契约与类型**（`StockCount` 现含 `by_status` 与 `latest_date: string | null`；
> `MarketIndex` 现含 `volume/amount`），**没改**的是下面这两处。
>
> ⚠️ **登记后已就地订正一小部分（2026-10-16，DATA-07 并入前自审）**：`DataQualityPanel.vue`
> 的 PIT 通道那句（原文「它的总数接口里声明的行情最新日实测从不返回 —— 两个形状问题登记为
> core 工单 DATA-03」）与 script 注释里同一说法，被 DATA-03 的落地**证伪**（那个键现在恒在），
> 已随自审改掉，PIT 那块也改成「DATA-03 裁决不开放 + 护栏已钉」的口径。
> **本单剩下的**是：把 `by_status` / `latest_date` 真读数接上屏（下面 ③ 第一条），以及
> `fmtVolume/fmtAmount` 的 `0` 分支 —— 这两件不是文案失真，是没做的读数与错显示。

- **① 目标**：屏幕上不再有与后端实际能力相反的说明文字，也不再有「把 0 显示成没数据」的格式化函数。
- **② 上下文**（2026-10-16 实测，`/data-sync` 页 DOM 回读 + 源码逐行）：
  - `components/sync/DataQualityPanel.vue:31-37` 的文案写着「在市 / 退市拆分**没有只读接口**：SPA 能走到的只有票池总数……已登记为 core 工单 DATA-02」。但 DATA-02 早已在 `GET /api/stocks/count` 给出 `by_status`（实测 `{"active":5569,"delisted":339}`），DATA-03 又给出 `latest_date`；类型 `types/api.ts` 也已带上这两个字段。**文案与能力相反** = 用户与下一个改前端的人都会被它带去重开一条已经存在的通道。
  - 同页 `utils/format.ts:33-43`：`fmtVolume` 与 `fmtAmount` 都以 `if (!v) return '-'` 开头 —— `0` 是 falsy，于是「成交量 0 股」被显示成 `-`（没读数）。这与 A-08/DATA-07 刚立的口径（`null` 才是没有读数，0 是 0）直接冲突。`format.test.ts` 甚至把 `fmtVolume(0) → '-'` 当成期望钉住了（:104-105），所以要改的是**断言与实现一起**，属于行为变更，得单独走。
- **③ 要求**：
  - 把 `DataQualityPanel` 的 PIT / 幸存者两块改成消费 `by_status`（在市/退市两档真读数 + 退市占比）与 `latest_date`（行情最新日），拿不到时才走显式空态；文案里"没有只读接口"整段按现状重写或删除。
  - `fmtVolume` / `fmtAmount` 改成只在 `null`/`undefined`/`NaN` 时返回占位，`0` 正常格式化；同步更新 `format.test.ts` 里钉住旧行为的那两条用例（改断言要写明理由，不许静默翻转）。
- **④ 约束与非目标**：不动后端契约（形状由 core 定，本单只是接住已给的字段）；不在前端算 `5908 - 339` 之类客户端重建（core AGENTS.md §9 禁止两处真相）；不改其他格式化函数。
- **⑤ 验收**：`npm test` + `npm run typecheck` + `npm run lint`（0 error）绿；新增/更新的 `MarketMetrics`/`DataQualityPanel` 单测钉住「0 不再显示成占位」与「空态只在 null 时出现」；浏览器实测 `/data-sync` 与 `/` 两页 DOM 回读，屏幕上的文字与 `curl` 拿到的字段集合一致；`e2e/tests/visual-regression.spec.ts` 的 `dashboard.png` 若因文案变化需 `--update-snapshots`，须在结案里写明是有意变化。**破坏验证**：把面板改回读 `count` 单一字段 ⇒ 新断言红；把 `fmtVolume` 的 null 判据改回 `!v` ⇒ 0 那条用例红。
- **⑥ 边界**：只做"文案与能力对齐 + 0 与缺失分得开"；~~`/market/index` 的参数不生效（core DATA-11）~~ **该句已于 2026-10-16 被 core DATA-11 落地证伪**：`(a1)` 参数化后 `?symbol`/`?date` 真下传（网关那层原本连 query 都不带，也一并补上），ui 侧取值改为按选中项命中 + 选中项/日期一变就重取（本仓 `f473fa9`，已在 ui main），日期框同时改成不可清空 —— 清空会让 `market.ts` 的 `if (date)` 把参数省掉，屏上仍是最新一期而框里没有日期，正是本节立的「文案与能力相反」那一族。指数 bar 数据面（core DATA-12）仍不在本单。

> **✅ 完成记录（2026-10-22）**
>
> **③ 要求逐条落点**
>
> | 要求 | 落在哪 |
> |---|---|
> | ① `by_status` 两档 + 退市占比接上屏 | `web/src/components/sync/DataQualityPanel.vue` 新增 `surv-active` / `surv-delisted` / `surv-delisted-share` 三行：在市取 `by_status.active`、退市取 `by_status.delisted`，占比 = `delisted / count`（分子分母都是 core 给的读数，前端只做一次除法；**不**拿 `count` 减退市数反推在市数 —— 那是客户端重建后端语义） |
> | ① `latest_date` 接上屏 | 同页新增 `pit-latest-date` 行「行情最新日（latest_date）」；值为 `null`（库里没行情）时走显式空态「未读取」，不显示别的日期 |
> | ① 文案按现状重写 | `surv-gap` 那段「在市 / 退市拆分**没有只读接口**…已登记为 core 工单 DATA-02」整段重写：DATA-02 已于 2026-10-14 落地，现在这段写的是**仍缺**的东西（逐只退市日期，网关不转发）；`pit-gap` 补一句「行情最新日是另一回事：它有读数」，免得把那一格也读成无通道。三个 PIT 时刻仍是「无通道」，文案与 DATA-03 的裁决一致，未动 |
> | ② `fmtVolume`/`fmtAmount` 只在缺失时占位 | `web/src/utils/format.ts` 新增 `isMissingReading()`：缺失 = `null` / `undefined` / 空串（trim 后）/ 解析不成数的串；**`0` 走正常格式化**（`0` → `0万`，`fmtAmount(0)` → `0.0`） |
> | ② 断言与实现一起改 | `format.test.ts` 里钉住旧行为的那条（`fmtVolume(0) → '-'`）**明确翻转**并在注释里写明理由（不是静默改期望）；顺带补上此前**完全没有用例**的 `fmtAmount`（3 条）。另在 `MarketMetrics.test.ts`（组件层 0 与缺失）、`DataQualityPanel.test.ts`（读数 / 空态 / 0）各加新用例 |
>
> **⑤ 验收（真退出码）**
>
> 1. `cd web && npm test` → **0**（38 个测试文件 / **538** 条；本单开工前 524 条 ⇒ **+14**：`format` +4、`MarketMetrics` +3、`DataQualityPanel` +7）。
> 2. `npm run typecheck`（`vue-tsc --noEmit`）→ **0**，无输出。
> 3. `npm run lint` → **0 errors**（943 warnings，全是既有的 `vue/max-attributes-per-line` / `singleline-html-element-content-newline` 一类；新增的四行沿用本文件既有写法，未新增 error、规则未放宽）。
> 4. **破坏验证（现场，真退出码）**：
>    - 改坏 A：`isMissingReading` 改回 `!v`（falsy 即缺失）→ **1**，**6 条红**（`format` 的 0 腿 3 条 + `MarketMetrics` 的 0 腿 3 条）；
>    - 改坏 B：面板改回只读 `count` 单一字段 → **1**，**4 条红**（在市 / 退市两档、占比、票池为空那两档、行情最新日）；
>    - 改坏 C：在市数改成前端反推（`count - delisted`）→ **1**，**1 条红**（`expected '在市（active）5908' to contain '未读取'`）—— 正是 ④ 禁止的那条客户端重建；
>    - 还原：`git diff --stat` 与改坏前逐行相同（6 files / 296 insertions / 42 deletions），`grep` 复查无改坏残留（`return !v`、`count - (` 均 0 命中），`npx vitest run` 回到 **0**（62 条）。
> 5. **浏览器实测（真 DOM 回读，本机栈起起来了）**：`docker start` 共享的 data-service / analysis-service（此前是停的）⇒ `curl :8085/api/stocks/count` → **200** `{"by_status":{"active":5569,"delisted":339},"count":5908}`；vite dev server 起在 :5173，Chromium 实读 `/data-sync` 的 DOM：
>    - 票池记录（含已退市）**5908**、在市（active）**5569**、退市（delisted）**339**、退市占比 **5.7%**（= 339/5908）—— 与 `curl` 的字段集合逐值一致；
>    - **行情最新日（latest_date）显示「未读取」**：本机跑的 data-service 是 DATA-03 之前的旧二进制，回包里**没有** `latest_date` 这个键 ⇒ 前端按「读不到」走显式空态，没有编一个日期出来（这正是本单要的「缺席不冒充读数」）；
>    - `/`（仪表盘）实读：本机 `market.index_daily` 0 行 ⇒ 四格指标**不渲染**，走 DATA-07 的显式空态（"接口对 000001.SH 回了空数组…0 行"），屏上没有 `-` 占位；控制台无报错。
> 6. **e2e**（真 Chromium，本机栈 + dev server 已起）：`e2e/tests/a08-job-console.spec.ts` 本单改动的两条**实跑绿**（`2 passed`）：
>    - 「拆分读数与行情最新日接上屏，PIT 三时刻仍明写无通道」（拦截 `/api/stocks/count` 成 core 的实测形状）；
>    - 「拆分读数缺席时走显式空态：不编占比，也不拿总数反推在市数」（`by_status: {}` + `latest_date: null` ⇒ 三格「未读取」且屏上一个百分比都没有）。
> 7. **视觉基线**：`e2e/tests/visual-regression.spec.ts` 的 `/api/stocks/count` fixture 按本仓自己的规矩补齐（"页面消费新字段时回包必须跟着补，否则基线照常绿而界面已经错"）—— 补上 `by_status` 与合规的 `latest_date`（原 fixture 是 `latest_date: ''`，而契约里这个键恒在且非空串）。
>    **基线图未改、也不需要改**：`data-sync.png` 是**视口**截图，研究质量面板在首屏之外（实测 `quality-panel` 的 top ≈ 2876px > 视口 680px）⇒ 本单文案与新行不在基线图里。
>    全套视觉用例跑下来 **4 条红**（`dashboard.png` / `backtest.png` / `dashboard-mobile.png` / `backtest-tablet.png`），**与本单无关**：把本单改动 `git stash` 掉、在原始 HEAD 上重跑，**同样这 4 条红**（本机行情表 0 行 ⇒ 仪表盘渲染与基线里的那份不同）。这 4 条属既有红，不在本单边界内，未动基线。
>
> **边界与现状**：只改 `web/src/utils/format.ts`（两个函数的缺失判据）、`web/src/components/sync/DataQualityPanel.vue`（读数接线 + 文案）、三个测试文件与两处 e2e；**未动后端契约**（形状由 core 定，本单只是接住已给的字段）、未改其他格式化函数、未做 i18n、未重建共享容器镜像（本机跑的是旧二进制，`latest_date` 那格因此走空态）。
> **口径取舍（明写，供下一个改这块的人）**：① 退市占比用 `count` 作分母（后端读数），不是前端把 `by_status` 各档加起来 —— 后者同样是客户端重建；② `fmtVolume(0)` 显示 `0万`（沿用万位刻度，不为 0 单开一档）—— `0` 是真读数，「0 万股」就是 0 股；③ `by_status` 里若有 `unknown` 档（status 为 NULL/空串折出），本页只展示在市 / 退市两档，占比分母仍是 `count`，不另造第三行。
> **未收口的既有漂移（本单不动，登记在案）**：`docs/design/visual.md` §2.3 的 `fmtVolume(1230000) // "1.23M"` 示例与实现的刻度（`123万`）对不上 —— 那是设计稿里的旧刻度示例，与本单的「0 与缺失」无关。

> **自审订正（2026-10-22，提交后通读自己的 diff 查出，不是外部反馈；上面的原始记录不改写）**
>
> 三条都是「把两件不同的事压成一句话」—— 正是本单要治的那一族，我在第一版里又犯了一次。
>
> 1. **`latest_date` 的 null 与缺席被合并成「未读取」**（原实现 `typeof v === 'string' ? v : null`，两态共用一句）。
>    core SPEC §1 明写三种形状三种含义：有日期 / **显式 null = 库里没有行情** / 键缺席或形状不对 = 没读到。
>    库里确实没行情时界面说「我没读到」= 说的与后端实际相反。**已拆成三句**：日期 / 「库里暂无行情」/ 「未读取」。
> 2. **空池的 `by_status: {}` 被当成「没读到」**。SPEC 明写空池序列化成 `{}`，GROUP BY 语义下"桶缺席 = 该档 0 行"，
>    所以 `count === 0` 且桶对象在场时两档是 **0**（读数），不是空态；只有 **桶对象整个缺席**，或 **`count ≠ 0` 却缺某一档**（契约违约）才走「未读取」。
> 3. **新用例的断言偏松**：`toContain('5569')` 这类写法既能匹配到标签、也能匹配到别处的更长的数字。已收紧成
>    `valueOf(testid)`（取该行 `.quality-value`）+ `toBe()` 精确比对；`未读取` 那几条同样收紧。
>
> **补跑的门禁（真退出码）**：`npm test` → **540** 条 / 38 files（本单净增从 +14 变 **+16**：`DataQualityPanel` 15 → 17）；
> `npm run typecheck` → 0；`npm run lint` → **0 errors / 943 warnings**。
> ⚠️ **更正上面前一条记录里的措辞**：943 不是"全是既有的"—— 开工基线是 **939**，本单在 `DataQualityPanel.vue` 新增的 4 行
> 各带 1 条 `vue/max-attributes-per-line` 一类 warning（**同一类、0 error、规则未放宽**）。第二次提交（自审订正）没有再增 warning。
>
> **破坏验证（新增三条，现场真退出码）**：
> - 把 `latestDateText` 的 null 与缺席合回一句 → **1 条红**（`后端明确回 null…说"库里暂无行情"`）；
> - 把「空池 ⇒ 0」去掉（缺档一律 null）→ **1 条红**（`空池（count 0 + by_status {}）两档是 0`）；
> - 反过来「缺档一律 0」（不看总数）→ **1 条红**（`总数不为 0 却缺某一档 = 契约违约`）—— 两条腿互为反向证明，不是同一条断言的复读。
> - 三条改坏均已还原（`git diff` 只剩本次自审订正本身；`grep` 复查 `return 0$` / `return null$` 无残留）。
>
> **e2e（真 Chromium，dev server + 本机栈）**：改动的两条**实跑绿**（`2 passed`）；DOM 回读与自审订正前一致
> （5908 / 5569 / 339 / 5.7%，`latest_date` 仍「未读取」—— 本机 data-service 是 DATA-03 之前的旧二进制，键确实缺席）。

---


<a id="UI-02"></a>
## UI-02 · 三值 status 消费与 `invalid_reasons` 展示口径（refactor-plan-review C1 传播）✅ 完成（2026-10-22）

> 2026-10-20 自 refactor 计划审查修复传播登记。三值映射规则冻结在 core `tellurion:docs/TASKS.md` QT-10 ③-④ / QT-15 ⑤ 与 `tellurion:docs/SPEC.md`（**以彼处为准，本单只落本仓展示/消费侧**）。

- **① 目标**：前端按冻结三值（`completed` / `invalid` / `failed`）展示 run 状态，并把 C1 修复后新增的 `invalid_reasons` code（`data_gap_skipped` 数据缺口跳天 / `session_terminated` session 终止）如实展示为「结果不可用但可解释」，不再与 `failed` 混为一谈、也不再把 `invalid` 装成成功。
- **② 上下文**（开工前逐一读）：
  - 冻结契约：`tellurion:docs/SPEC.md` 三值 status 与 `invalid_reasons` 字段（core `pkg/backtest/contracts` ResultSpec 冻结，`buildResponseFromState` 单一透传点）；C1 映射新增 code `data_gap_skipped` / `session_terminated`，`failed` 必带 `error`。
  - 本仓既有口径（勿倒退）：core AGENTS.md 的裁决「Backtest UI 不得用 `result.id` 存在当成功判据；`invalid` 必须显式警示 + `invalid_reasons` 列表，`failed` 必须显式呈现」；既有三值接线见 ui 仓 A-07（7 条单测钉住）。
  - 相关联动：`tellurion-agent:docs/TASKS.md` REV-01-A（agent 侧消费口径同源，不重复发明语义）。
- **③ 要求**：
  1. 状态展示只认三值：**`completed` 才是成功**；`invalid` 显示显式警示并逐条列出 `invalid_reasons`（code 可读化：`data_gap_skipped`→「数据缺口跳天，结果不可用」、`session_terminated`→「session 终止，结果不完整」，未知 code 原样展示不吞）；`failed` 显示 `error` 原文。
  2. 与 OBS-01 同族的「invalid 运行指标缺席」处理沿用现状口径：指标键缺席时走显式空态，不伪造 0（与 UI-01 的「0 与缺失分得开」口径一致）。
  3. 不新增第四值、不在前端自行改判 status（单一真相源在 core 透传点）。
- **④ 约束与非目标**：不改后端契约与映射（core QT-10/QT-15）；不放宽既有三值单测断言（A-07 那 7 条只许加强不许削弱）；不做 i18n；指标展示逻辑重构另立。
- **⑤ 验收**：`npm test` + `npm run typecheck` + `npm run lint` 绿；新增单测钉住 `data_gap_skipped` / `session_terminated` 两个 code 的展示文案与「unknown code 原样展示」；`completed`/`invalid`/`failed` 三分支各有可区分断言。**破坏验证**：把 `invalid` 误渲染成成功（或吞掉 `invalid_reasons` 列表）→ 对应用例红 → 还原绿。e2e 若涉及状态文案断言同步更新并在结案写明。
- **⑥ 边界**：只做三值 status 与 `invalid_reasons` 的展示/消费口径；`result.id` 判成功、指标缺席空态等旧账在 A-07/OPS 相关单；agent 侧消费在 REV-01-A；wire 契约落定在 core QT-50。

> **✅ 完成记录（2026-10-22）**
>
> **③ 要求逐条落点**
>
> | 要求 | 落在哪 |
> |---|---|
> | ① 两码可读化、unknown 原样 | `web/src/utils/runStatus.ts` 的 `REASON_LABELS` 补两行（措辞逐字按本单：`data_gap_skipped`→「数据缺口跳天，结果不可用」、`session_terminated`→「session 终止，结果不完整」）；未登记 code 的 `?? code` 原样分支未动 |
> | ① invalid 警示 + 列表、failed 原文 | 既有 A-07 组件接线未改（`QuickBacktest.vue` 的 invalid 分支带 warning 标签 + `invalidReasonsText`；failed 分支 `result.error` 原文；详情页 `BacktestEngine.vue` 同样走 `statusTagFor`/`invalidReasonLabel`），只补了两码的文案表 |
> | ② invalid 运行不显示指标 | 既有口径未倒退：`QuickBacktest` 的 completed 分支是显式匹配，invalid 不上指标位；新增用例对两码同时断言「不出现收益/夏普」 |
> | ③ 不新增第四值 / 不自行改判 | 未动 `RunStatus` 联合类型与 `KNOWN` 三值表；两码只进「原因翻译表」，不进状态表 |
>
> **⑤ 验收（真退出码）**
>
> 1. `cd web && npm test` → **0**（38 个测试文件 / **524** 条；新增 4 条：`runStatus.test.ts` 的两码 describe 3 条 + `QuickBacktest.test.ts` 两码渲染 1 条；另在 `backtestValidityNote` 加 1 条 Copilot 链路同表断言，合计 5 条）。
> 2. `npm run typecheck` → **0**（`vue-tsc --noEmit` 无输出）。
> 3. `npm run lint` → **0 errors**（939 条既有 warning，0 条新增 error；规则未放宽）。
> 4. **破坏验证（现场，真退出码）**：
>    - 改坏 A：把 `data_gap_skipped` 的译文改回裸 code → `npx vitest run` 两条测试文件 → **1**，**4 条红**（标签、两码拼接、Copilot 链路、QuickBacktest 渲染各一条）；
>    - 改坏 B：把 `QuickBacktest.vue` 的 `{{ invalidReasonsText }}` 改成 `{{ '' }}`（吞掉原因列表）→ **1**，**3 条红**（含 A-07 既有的「警示样式**且**列出 invalid_reasons」——证明既有断言没被削弱）；
>    - 还原：两个文件 sha256 与改坏前**逐字节一致**（`3eff21f3…` / `9bd1e68a…`）→ `npx vitest run` 回到 **0**（44 条）。
> 5. **e2e**：未同步修改。理由：既有 e2e 断言的状态文案（「无效运行」、`empty_universe`/`zero_trades` 的人话）逐字未变；两个新 code 今天没有生产者（core QT-10/QT-15 待落），e2e 若造假响应只能测 mock 自身。登记在案，等 core 有真生产者时再补 e2e 腿。
>
> **边界与现状**：只改 `runStatus.ts` 一张文案表 + 两个测试文件 + 本台账；未动后端契约、未动状态联合类型、未做 i18n、未重构指标展示。`data_gap_skipped` / `session_terminated` 在 core 源码里今天**还没有生产者**，前端消费口径先落地，生产者上线时不需要再改文案。

---


<a id="QT-61"></a>
## QT-61（ui 腿）· CI 基线归零——SchedulePanel flaky 用例 ✅ 完成（2026-10-21）

> 跨仓同号同单，完整四腿收口记录见 `tellurion:docs/TASKS.md` QT-61；此处只登记本仓腿。

- **要点（初判与破坏验证）**：该用例 4.9s 接近超时、疑似 flaky，给该文件 4 个 `describe` 传 `{ timeout: 15_000 }` 加时间余量（**不放宽任何断言**）；破坏验证：预算调到 1ms → `Test timed out in 1ms`，证明 timeout 真生效。
- **要点（首跑 CI 暴露真因）**：加 timeout 后跑到断言才发现是 **locale 依赖**（断言硬编码 `2026/10/15`，CI=en-US 渲染 `10/15/2026`）⇒ 改用组件同一 `toLocaleString` 现算期望（`1075c28`）；timeout 余量保留（双管齐下）。

---

<a id="UI-NPM-AUDIT-FIX"></a>
## UI-NPM-AUDIT-FIX · npm 依赖 5 个 high 漏洞（@vue/server-renderer XSS 等） ✅ 完成（2026-11-12）

- **① 目标**：把本仓 `web/` 与 `e2e/` 的 npm 依赖升到无 high 漏洞，`npm audit --audit-level=high` 退出码归 0。
- **② 上下文（2026-11-11 全面审查 W5-F1，证据 ODR-072 `tellurion-docs:docs/archive/odr/odr-072-audit-wave5-security-reliability-deps.md`）**：W5 实测 `npm audit` 报 **5 high**——`@vue/server-renderer`（XSS）、`nanoid`、`postcss`、`source-map-js` 等。本仓是 Vue 3 + Vite SPA，`@vue/server-renderer` 虽主要在 SSR 路径，但作为传递依赖仍在树里。冻结参照 = `web/package.json` / `e2e/package.json` 与 lockfile。
- **③ 要求**：① `npm audit fix`（必要时 `npm audit fix --force` 升 major，但须核 breaking）把 5 high 清零；② `npm run build` / `npm run lint` / `npm run typecheck` / `npm test` 全绿，确认升级无回归；③ e2e 套件复跑（原生三服务栈）不退化；④ 若某漏洞无补丁版，登记残留 + 缓解（不静默 `audit-level=critical` 绕过）。
- **④ 约束与非目标**：不放宽 audit 阈值来变绿（禁 `--audit-level=critical` 当修复）；不复制 openapi；不改后端契约；不引入新框架；major 升级须核 breaking 并在单内记录。
- **⑤ 验收**：`npm audit --audit-level=high` EXIT=0（真退出码）；`npm run build`/`lint`/`typecheck`/`test` 全绿；破坏验证 = 把某依赖降回漏洞版 ⇒ audit 复红，还原复绿。
- **⑥ 边界**：本仓 `web/` + `e2e/` 的 package.json/lockfile；Go 侧依赖漏洞归各 Go 仓（`X-DEP-BUMP-CONSUMERS` / `BROKER-DEP-BUMP` / `KIT-DEP-SECURITY-BUMP`）。
- **owner**：待定

### 施工记录（2026-11-12）

- **实测起点（与台账口径不同，以实测为准）**：`web/` 跑 `npm audit --audit-level=high` = **29 vulnerabilities (10 high / 19 moderate)，EXIT=1**——比台账记的 5 high 多（`npm audit fix` 前又新增了 `brace-expansion` / `happy-dom` / `vite` / `ws` / `js-cookie` 等条目）。`e2e/` = **found 0 vulnerabilities，EXIT=0**，本单只动 `web/`。
- **处置链（三步，全部非 `--force`）**：
  1. `npm audit fix` → 10 high 降到 2 high（`brace-expansion@2.0.3`、`happy-dom@20.14.6`），lockfile 顺带把 `vite` 抬到 6.4.6（>6.4.3 修复线）、`@vue/server-renderer`/`nanoid`/`postcss`/`source-map-js`/`ws`/`js-cookie` 全部出树。
  2. **`happy-dom` 20 → 21.0.4**（major，核 breaking：本仓只在 `vitest.config.ts:9` 当 `environment: 'happy-dom'` 用，未 import 其 API；升级后 540 条单测全绿）。**`vue-tsc` 2.2.12 → 3.3.14**（major，因 `@vue/language-core@2` 拖 `minimatch@9 → brace-expansion@2.x`；核 breaking：`vue-tsc -b` / `--noEmit` 参数语义未变，build 与 typecheck 均绿）。**`vitest` / `@vitest/coverage-v8` 4.1.9 → 4.1.12**（patch，清 `@vitest/mocker` 的路径穿越/注入两条 moderate）。
  3. `npm update brace-expansion` → 嵌套的 `2.0.3` 抬到 **`2.1.8`**（仍在 `minimatch@9` 的 `^2.0.2` 范围内，未用 override 强改 semver）。
- **终态**：`npm audit --audit-level=high` = **13 moderate / 0 high，EXIT=0**。
- **残留登记（④：不静默绕过，也不为变绿硬降级）**：13 条 moderate 全部落在 **lint/test 工具链**（`minimatch@9/10` + `glob@10` ← `eslint` / `typescript-eslint` / `@vue/test-utils → js-beautify → editorconfig`）。`npm audit fix` 给出的修法是 **`--force` 把 `eslint` 降回 9.39.5**（降级换绿，违反本单 ④ 与非目标「不引入回归」），故**不做**；上游 `minimatch` 修复版（>11.0.0）尚未被 eslint 采纳，等上游升级即可自然清掉。这些包不进生产产物（`vite build` 的 dist 不含 devDependencies）。
- **不修的理由 + 重开条件（2026-11-12 登记，对 13 条 moderate）**：
  - **不修的理由**：唯一能清掉它们的官方修法是 `npm audit fix --force`，而它会把 `eslint` 从 10.x 降回 9.39.5 —— 这是**降级换绿**，本单 ④ 明确禁止，且会让 lint 规则面与配置回退（不是安全修复，是换一个更旧的工具链）。这些包是 devDependencies，不进 `vite build` 的 dist，也不在运行时路径上；留在树里不改变生产产物的攻击面。既不放宽 `--audit-level` 也不 `--force`，故 `--audit-level=high` 口径下 EXIT=0 是**真实终态**，不是绕过。
  - **重开条件（满足任一即重开并复跑本单验收）**：① 上游 `eslint` / `typescript-eslint` 采纳 `minimatch` 修复版（>11.0.0），`npm update` 能在**不降级、不 `--force`** 的前提下让 13 条归零；② `npm audit --audit-level=moderate` 出现落进**生产依赖链**的新条目（不再只是 devDependencies）；③ 本仓升级到 `eslint` 新 major（届时重核规则面）。
- **验收（真实输出）**：
  - `npm audit --audit-level=high` → `13 moderate severity vulnerabilities` + `AUDIT_EXIT=0`。
  - `npm run build`（`vue-tsc -b && vite build`）→ `✓ built in 15.79s`，`BUILD_EXIT=0`。
  - `npm run lint` → **0 error**（既有 `vue/max-attributes-per-line` 等 warning，规则未放宽）；`npm run typecheck` → `TYPECHECK_EXIT=0`。
  - `npm test` → **Test Files 38 passed (38) / Tests 540 passed (540)**，`TEST_EXIT=0`。
- **破坏验证（现场，真退出码）**：`npm install --save-dev happy-dom@20.14.6`（降回漏洞版）→ `npm audit --audit-level=high` = **14 vulnerabilities (13 moderate, 1 high)，EXIT=1**（红）；随后用开工前留的 `package.json` / `package-lock.json` 备份**逐字节还原** → `npm install --no-audit` 对齐 node_modules（`happy-dom@21.0.4` / `vue-tsc@3.3.14` / `vitest@4.1.12`）→ audit 复回 **0 high，EXIT=0**、`npm test` 复回 **540 passed**。
- **e2e 腿**：本单未改 `e2e/`（实测 0 漏洞、无改动），故 e2e 套件不因本单退化；按 ③ 只做基线核对。视觉基线口径沿用主台账「三、已判定不重录」。
- **边界守住**：只改 `web/package.json` + `web/package-lock.json` + 本台账；未改任何源码、未动 `e2e/`、未动后端契约、未新增依赖。

---

<a id="UI-RUNBOOK-GAP"></a>
## UI-RUNBOOK-GAP · 本仓没有 runbook，托管失败与 `/api` 反代故障只有 README 零散说明 ✅ 完成（2026-11-12）

- **① 目标**：给 ui 一份最小 runbook，让「页面打不开 / 静态资源 404 / `/api` 反代失败」有固定入口，并能一句话区分「本仓问题」还是「core 问题」。
- **② 上下文**：`SERVICE.md` 落地时实测——本仓 `docs/` 无 `runbook.md`；起停与本地开发写在 `README.md`，反代配置在 `deploy/nginx-spa.conf`，但没有成文的排查顺序。六个服务仓都有 `docs/runbook.md`，core / agent / ui 三个仓没有。
- **③ 要求**：① 覆盖「静态资源不可加载」「`/api` 404 / 502」「登录态失效」「e2e 基线红」四类现象；② 每节写「现象 → 先看什么 → 怎么判定是本仓还是 core → 处置」；③ 明确本仓无自带探针，不得把 core 的 `/health` / `/readyz` 当本仓探针；④ 完成后把 `SERVICE.md` 的 `truth.runbook` 改为该文件路径。
- **④ 约束与非目标**：不写 SLO / 告警规则 / 值班表；不改 nginx 反代策略；不在 runbook 里复制 `openapi.yaml` 或端点清单。
- **⑤ 验收**：按 runbook 能在「后端正常 / 后端停掉 / 反代配置错误」三种场景里各自定位到唯一责任仓，不出现「两边都像坏了」的结论。
- **⑥ 边界**：前端托管与反代排查归本仓；`/api` 背后的业务故障归 `tellurion`，其排查入口在 core 的 runbook（缺口见 `tellurion:docs/TASKS.md` 的 `CORE-RUNBOOK-GAP`）。
- **owner**：待定
- **重开条件**：出现第二次「页面故障但无法判断是前端还是后端」的排障经历，或接手人变更。

### 施工记录（2026-11-12）

- **产出**：新增 `docs/runbook.md`（§0 边界与两种运行形态 / §1 三十秒分诊 / §2 静态资源不可加载 / §3 `/api` 404-502 / §4 登录态失效 / §5 e2e 基线红 / §6 人工 promote / §7 红线）。`docs/README.md` 的「先读哪份」「文档地图」「变更触发」三张表均挂上该文件，并更新 frontmatter。
- **③④ 的落地方式（未做的那一半，见下）**：runbook §0 明写「本仓没有自带业务探针，`/health` `/readyz` 都在 core，**不得**拿 `/api/health` 当本仓健康判据」，与 ③ 一致。**③④（改 `SERVICE.md` 的 `truth.runbook`）未执行**：本轮施工纪律是「不碰 `SERVICE.md`」（多会话共用该卡片，改它容易覆盖别人刚推的内容），故 `SERVICE.md` 的 `truth.runbook` 目前仍指向旧值 —— 已作为残留上报，待不与其它会话冲突时单独补一次。
- **实测证据（nginx 真容器，本机 2026-11-12）**：
  - 后端正常：`/` = `200`（`Server: nginx/1.27.5`，`Content-Type: text/html`）；`/api/health` = `200 {"service":"analysis-service","status":"healthy",...}`；`/api/auth/status` = `200 {"auth_enabled":false,"bootstrap_required":false}`；深链 `/copilot` = `200`（history 回退生效）；不存在的资产 `/assets/nope.js` = `404`。
  - 反代配置错误 / 后端不可达（隔离网络跑同一镜像，使 `analysis-service` 解析不到）：`/` 仍 `200`，`/api/health` = **`502 Bad Gateway`**（nginx 自吐 HTML），error log = `analysis-service could not be resolved (110: Operation timed out)`。这正是「静态页没事、坏在反代链路」的形状，写进 §3 判定表。
  - 后端路由不存在：`/api/not-exist` 经反代 = `404 page not found`（body 由 core 返回，非 nginx 的 404 页）。
- **⑤ 三种场景的定位**：后端正常 → 唯一责任仓 = 本仓（SPA 逻辑）；后端停掉 → core（反代 502 + 解析/连接失败证据）；反代配置错误 → 本仓（`direct-core=200` 而 `via-nginx=404`）。三行判据 + 依据写在 §1 分诊表，避免「两边都像坏了」。
- **⑥ 边界守住**：只新增 `docs/runbook.md` 与 `docs/README.md` 的三处导航行；未改 `deploy/nginx-spa.conf`（反代策略一行未动），未改 `SERVICE.md`，未复制端点清单（runbook 只引用现象需要的少数路径）。

---

<a id="UI-HEALTHCHECK"></a>
## UI-HEALTHCHECK · ui Dockerfile 无 HEALTHCHECK，容器编排无法判活 ✅ 完成（2026-11-12）

- **① 目标**：给本仓运行镜像一条 HEALTHCHECK，让 compose/编排能判「nginx 真在 serving SPA」而不是「容器进程还在」。
- **② 上下文（2026-11-11 全面审查 W5-F6，证据 ODR-072 `tellurion-docs:docs/archive/odr/odr-072-audit-wave5-security-reliability-deps.md`）**：本仓 `Dockerfile` **无 `HEALTHCHECK`**（grep 零命中）。本仓是 nginx 托管的 Vue SPA（宿主 8080），无自带业务探针；健康判据应是「nginx 能返回 SPA 入口 / 静态资源」。注意 W5-F6 另一处弱探针（`nc -z`）实属 strategy（见 ODR-072 订正注记），与本仓无关。
- **③ 要求**：① Dockerfile 加 `HEALTHCHECK`（用镜像内已有二进制，如 `wget -qO- http://127.0.0.1/` 或 nginx 静态入口；缺 curl/wget 则在镜像补或用 nginx 自带能力）；② 探测的是「SPA 真被 serving」，不是反代后端（后端健康归 core，不得把 core `/health` 当本仓探针——与 `UI-RUNBOOK-GAP` ③ 一致）；③ interval/timeout/retries 与兄弟仓同口径。
- **④ 约束与非目标**：不改 nginx 反代策略；不把后端 `/api/health` 当本仓健康判据；不引入新依赖库；不改 SPA 路由。
- **⑤ 验收**：`docker build` 后起容器，HEALTHCHECK 在 nginx serving 时 healthy、nginx 停时 unhealthy（破坏验证 = 去掉 HEALTHCHECK ⇒ 编排无法判活，还原复绿）；`grep -n HEALTHCHECK Dockerfile` 非空。
- **⑥ 边界**：本仓 `Dockerfile`；nginx 反代与后端健康归 core / `UI-RUNBOOK-GAP`。
- **owner**：待定

### 施工记录（2026-11-12）

- **改动**：`Dockerfile` 末尾新增
  `HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD curl -fsS -o /dev/null http://127.0.0.1:8080/ || exit 1`。
  三条设计取舍写进了注释：① 探 `/` 不探 `/api/health`（后者要穿反代，反代抖动会把「UI 没事」判成有事）；② 判据是「nginx 在 serving SPA」，不是进程存活、更不是后端健康；③ 参数与兄弟仓同口径（实测 `tellurion-data:Dockerfile:32`、`tellurion-broker:Dockerfile:32`、`tellurion-strategy:Dockerfile:43` 都是 `30s / 3s / 10s / 3`）。curl 在 stage 2 本来就装了（`:37`），未引入新依赖。
- **验收（真实输出）**：
  - `docker build -t tellurion-ui:healthprobe .` → `BUILD_EXIT=0`（镜像内重建产物，未用宿主 `web/dist`）。
  - 起容器接进 `tellurion_default`、映射 `127.0.0.1:18080` → `Up 12 seconds (healthy)`，`docker inspect .State.Health` = `{"Status":"healthy","FailingStreak":0,"ExitCode":0}`。
  - `docker inspect --format '{{json .Config.Healthcheck}}'` = `{"Test":["CMD-SHELL","curl -fsS -o /dev/null http://127.0.0.1:8080/ || exit 1"],"Interval":30000000000,"Timeout":3000000000,"StartPeriod":10000000000,"Retries":3}`。
  - 同一容器实测 serving：`/` = `200`（`nginx/1.27.5` / `text/html`）、`/api/health` 经反代 = `200`、`/assets/nope.js` = `404`、深链 `/copilot` = `200`。
- **破坏验证（现场）**：`docker exec ui-healthprobe sh -c "mv /usr/share/nginx/html/index.html /tmp/index.html"` —— nginx **进程仍活着**，但已不再 serving SPA：`/` 变 `403`，40s 后 `failing=1`，75s 后累计 `unhealthy failing=5`（`docker ps` 显示 `Up 3 minutes (unhealthy)`）。还原文件后 `/` 复 `200`，一个探测周期后回 `healthy failing=0`。即探针反映的是「真在 serving」而不是「容器没死」。
- **⑥ 边界守住**：只改 `Dockerfile`；未动 `deploy/nginx-spa.conf`、未动 SPA 路由、未改 compose（统一栈的 healthcheck 配置属 core 仓批次，本单不跨仓）。
- **残留**：探针只覆盖「本机 nginx 能吐 SPA」，不含反代链路的可用性——这是刻意的（③ 明确后端健康归 core），排障入口见 `docs/runbook.md` §1/§3。

---

<a id="UI-SCREEN-CONSUMER"></a>
## UI-SCREEN-CONSUMER · 核验 `/api/screen` `/api/stocks/count` 修复后 ui 消费面真可用 ✅ 完成（2026-11-12）

- **① 目标**：确认主任 `8c5272d` 修复 core 死反代后，本仓 Screener / DataQualityPanel / MarketMetrics 等消费方真能拿到数据或优雅处理新语义（count 派生 502），而不是静默坏掉。
- **② 上下文（2026-11-11 全面审查 W2-F8 连带，证据 ODR-069 `tellurion-docs:docs/archive/odr/odr-069-audit-wave2-core-architecture.md`）**：`web/src/api/market.ts:21` `screenStocks` → `POST /api/screen`、`:13` `getStockCount` → `/api/stocks/count`；消费方 = `web/src/pages/Screener.vue`、`web/src/components/sync/DataQualityPanel.vue`、`web/src/components/dashboard/MarketMetrics.vue`（+ `DataSync.vue`）。主任 `8c5272d` 已改 core：screen 本地供数（裁决⑰姿势）、count 派生 **502**、ingest/raw 410。core 侧核验归 `tellurion:CORE-DEAD-PROXY-SCREEN-VERIFY`；本单是 ui 消费连带——尤其 count 现在可能回 502，ui 须优雅处理而非崩。
- **③ 要求**：① 真栈（core 修复后）跑 Screener / DataQualityPanel / MarketMetrics，断言 screen 有读数、count 502 时 ui 显示「不可用」而非通用错误/空白崩；② 若 ui 把 count 502 当硬错误，改成降级提示；③ 补/改组件测试覆盖 count 502 分支；④ e2e 相关用例复跑不退化。
- **④ 约束与非目标**：不改 core 路由（主任已修，归 CORE-DEAD-PROXY-SCREEN-VERIFY 核验）；不复制 openapi；不在前端伪造 screen/count 数值；不新造端点。
- **⑤ 验收**：真栈三消费方各一条断言（screen 有读数 / count 502 降级）；组件测试覆盖 502 分支；破坏验证 = 把 502 降级改回硬错误 ⇒ 用例红，还原复绿；`npm run build`/`test` 绿。
- **⑥ 边界**：本仓 `web/src/api/market.ts` 消费方组件 + 测试；core 反代核验归 `tellurion:CORE-DEAD-PROXY-SCREEN-VERIFY`。
- **owner**：待定

### 施工记录（2026-11-12）

- **实栈核验（镜像内 nginx 起容器，`/api` 反代到运行中的 analysis-service:8085；真浏览器打开页面读数）**：
  - **DataQualityPanel**（`/data-sync`）：`票池记录（含已退市）= 5580`、`在市 = 5580 (active)`、`行情最新日 = 2025-12-31`；`已退市`/`退市占比` 显示 **未读取**（后端 `by_status` 只回了 `active`，前端按 fail-explicit 留空，符合预期）；**无红条、无降级条、页面不空白**。与 `GET /api/stocks/count` 实测一致（`count:5580`，`by_status:{active:5580}`）。
  - **MarketMetrics**（`/`）：请求被 core 的限流挡成 `429`，页面渲染的是**诚实的失败态**（红色「读数失败」标签 + 「这次请求没成功：后端不可达、回包不合形状，或没给回你点名的那一个指数，不是今天没有行情」+ 重试建议），**没有**伪装成「今天没有行情」。空数组 → 「无指数数据」的分支由 `MarketMetrics.test.ts:134` 覆盖（真栈在上一条限流下拿不到 200 空数组）。
  - **Screener**（`/screener`）：`/api/screen` 命中限流 `429`，结果区显示「未找到符合条件的股票」；`POST /api/screen` 直连实测为 `200 {"count":0,"results":[]}`（库里有行情但基本面字段空，无过滤命中）。
- **② 的落地**：`DataQualityPanel.vue` 把「5xx / 网络层失败」从**通用错误红条**改为**降级提示**（`data-testid="quality-degraded"`，文案点名 `HTTP 502` 或「网络不可达」，并说明各格保留「未读取」、不显示猜测值）；4xx 或畸形回包仍走红条（那是要人看的错）。格子形状、`未读取` 语义、`by_status` 缺键时的 fail-explicit 行为均未改。
- **③ 组件测试**：新增 2 例（`count 502` / `status 0` 网络失败），并把原来那例 500 的断言从「红条文案」改为「格子仍为未读取」+ 新增降级用例；`DataQualityPanel.test.ts` 共 19 例。
- **破坏验证（现场真输出）**：把 `catch` 里的降级分支删回「一律 `error.value = apiMessage(...)`」⇒ `Tests 2 failed | 17 passed`（`count 502：走降级提示` 与 `网络层失败` 两例红）；逐字节还原后 `Tests 19 passed (19)`。
- **④ e2e 复跑（对真容器 `BASE_URL=127.0.0.1:18080`）**：`screener.spec.ts` + `dashboard.spec.ts` = **16 passed / 1 failed**，失败项为 `dashboard.spec.ts:162` 期望「暂无历史记录」但库里有回测历史 —— **与本单改动无关**（本单只改 `DataQualityPanel`，不在 dashboard 链路上），属既有用例把「空库」当默认环境的耦合。`a08-job-console.spec.ts -g "PIT 与幸存者"` 亦失败：用例硬编码 `5908`，而真库当前 `5580`，同样与改动无关。
- **本次新发现（按「审查清单之外只登记不实现」处理，未改）**：
  1. `e2e/tests/a08-job-console.spec.ts` 把真库读数写死（`5908` / `2026-10-14`），应改为向 `/api/stocks/count` 取期望值，否则换库/补数即红。
  2. `e2e/tests/dashboard.spec.ts:162` 假定回测历史为空，应改为断言「空态或有行」二选一，或为 e2e 提供独立库。
  3. `Screener.vue:140-141` 失败（含 429 限流）时只弹一条 3 秒后消失的 toast，结果区同时落到「未找到符合条件的股票」——**失败被读成「没找到」**。与 `UI-COPILOT-GATE-SURFACE` 同类问题，但本单 ④ 只要求 count 分支，故仅登记。
- **边界守住**：只改 `web/src/components/sync/DataQualityPanel.vue` + 其测试；未改 core、未改 `market.ts` 契约、未新造端点、未伪造数值。

---

<a id="UI-LEDGER-SELF-CONSISTENCY"></a>
## UI-LEDGER-SELF-CONSISTENCY · 主台账「无开放项」自相矛盾 + 子台账过期项 + broker frontmatter 漂移 ✅ 完成（2026-11-12）

- **① 目标**：消除台账自相矛盾，让读者（含 agent）一眼判对本仓状态：主台账 boilerplate 与开放项一致、主/子台账关系写明、子台账过期项订正、broker frontmatter 不再描述已归档单。
- **② 上下文（2026-11-11 全面审查 W1-F6 + D13，证据 ODR-068 `tellurion-docs:docs/archive/odr/odr-068-audit-wave1-product-governance.md`）**：① 本仓 `docs/TASKS.md:15` 原「无开放项」与两条 ⬜（`:17`/`:28`）矛盾（**本轮立单已撤该 boilerplate**，本单核验其余一致性）；② `AGENTS.md:54`「截至 2026-11-11 无开放项」同句须订正；③ 子台账 `docs/design/stitch_quantlab_ux_redesign/` 的 B-05（因子端点过期）/ G9（镜像构建失败已被证伪）过期项须订正，主台账「无开放项」与子台账开放 B/G 项的关系须写明（D13）；④ `tellurion-broker:docs/TASKS.md` frontmatter 仍描述已归档的 `SVC-BROKER-G3`（W1-F6）。W1-F7 观察窗功能缺口已 dedup 到子台账 B-01/B-02/B-06/G1~G4（**不新立功能单**，逐行证据补在施工时）。
- **③ 要求**：① 订正 `AGENTS.md:54` 为「有开放项，见 docs/TASKS.md」；② 子台账 B-05/G9 过期项订正（B-05 因子端点已退役 410、G9 镜像构建失败前提已证伪），写明主/子台账关系（主台账装跨仓/运维单，子台账装 UX 重构功能项）；③ broker frontmatter 的 SVC-BROKER-G3 描述改指归档（跨仓，归本单同批）；④ 核验主台账不再有「无开放项」与 ⬜ 并存。
- **④ 约束与非目标**：不新立 W1-F7 观察窗功能单（已 dedup 子台账）；不改子台账 B-01/B-02/B-06/G1~G4 的功能判定（只补证据，施工时做）；不动主任 2026-11-12 ✅ 条目（`UI-VISUAL-BASELINE`）；不改代码。
- **⑤ 验收**：`grep -n "无开放项" docs/TASKS.md AGENTS.md` 不再与开放项矛盾；子台账 B-05/G9 有过期订正注记；broker frontmatter 指归档；主/子台账关系成文。
- **⑥ 边界**：本仓 `docs/TASKS.md` + `AGENTS.md` + 子台账 + `tellurion-broker:docs/TASKS.md` frontmatter（跨仓同批）；观察窗功能实现归子台账 B/G（不在本单）。
- **owner**：待定

### 施工记录（2026-11-12）

- **①（AGENTS.md）**：`§5` 台账行由「唯一；截至 2026-11-11 无开放项」改为「唯一；**有开放项，逐条见 §一**」；子台账行由「主台账仍是 `docs/TASKS.md`」改为按 D13 写明分工 ——「装 UX 重构功能项；跨仓 / 运维 / 台账一致性单在主台账 `docs/TASKS.md` §一，两处互不收录」。
- **②（子台账 `docs/design/stitch_quantlab_ux_redesign/TASKS.md`）**：
  - 抬头「定位」原写「本文件是 UI 重构的**唯一任务台账**」，与主台账的「唯一」互斥 → 改为「**UX 重构（分组 A/B 与 G 缺口）**的任务台账，装功能项；跨仓 / 运维 / 台账一致性单在主台账 §一，两处互不收录、也不互相索引开放项」，并给出下钻顺序（先读主台账 §一，再按需下钻）。版本行标注 2026-11-12 订正。
  - **B-05**：加 `⚠️ 2026-11-12 订正` 块并把原第 1 条划删除线 —— 原文「因子列表 / IC / 十分位收益 / 计算触发全部走 `core` `/api/factor/*` 5 条端点，这部分现在就能做」**前提不成立**：`/api/factors/{name}` 已退役为 **410**，其余 `/api/factor*` 读面不存在，IC / 分位收益真相源在 analytics（ADR-037）。**B-05 维持挂起**，重开条件重写为「analytics 提供因子列表 / IC / 分位收益读面，且主台账 `UI-FACTOR-CITATION-RETIRED` 收口」。
  - **G9**：「ai-service 镜像构建失败（`go mod tidy`）」标 **已证伪（2026-11-12）** —— 镜像可构建、本机全栈 `ai-service` 在 `127.0.0.1:8086` healthy；分组 B 的拦路项换成 **G7 契约缺口 + B-05 因子读面缺失 + promote 闸门 a 腿裁决**，`执行顺序建议` 那行同步改写。
  - 文末「更新记录」追加 2026-11-12 一行，记清上述三处订正与「A 组判定、B-01/B-02/B-06/G1~G4 功能判定未改」。
- **③（broker frontmatter）—— 未执行，作为残留上报**：本轮施工纪律是「不动其他仓」，`tellurion-broker:docs/TASKS.md` 的 frontmatter 仍描述已归档的 `SVC-BROKER-G3`。**重开条件**：允许跨仓改动时，把该文件 frontmatter 的描述改指归档（`docs/archive/`），并把其 `verdict` 从「已归档单」口径订正为「无开放项」。本仓台账的对应说法已在本条收口时不再引用它，不会误导本仓读者。
- **④（核验，真实输出）**：`docs/TASKS.md` 与 `AGENTS.md` 的「无开放项」命中 = **0**：
  ```
  === grep -n "无开放项" docs/TASKS.md AGENTS.md ===
  (no match)
  MATCH_COUNT=0
  ```
  全仓 md 只剩归档文件里两处**明确标注为历史结论**的引用（索引表的单标题行 + 给 2026-11-10「终扫」加的时间限定注），不是现状断言：
  ```
  docs\archive\tasks-archive-2026-11.md:24   （索引表里本单标题原文）
  docs\archive\tasks-archive-2026-11.md:35   （2026-11-12 注：那句终扫只对 2026-11-10 时点成立）
  ```
- **破坏验证（现场真输出）**：把 `AGENTS.md:54` 改回「截至 2026-11-11 无开放项」⇒ 验收 grep 立刻变红（`AGENTS.md:54: ... 无开放项 ...`，`MATCH_COUNT=1`）；改回后 `MATCH_COUNT=0`，且文件 SHA256 与改动前一致（`C28138BBB79B9B49C943444A5E502A11672AA6B354AE164912657A99AB4B19D8`，逐字节还原），`git diff --stat -- AGENTS.md` 仍只剩 `2 insertions(+), 2 deletions(-)` 这条既有改动。
- **施工中新发现并顺手订正**：`docs/ARCHITECTURE.md:4` frontmatter 也有一句「本仓台账无开放项」（与 AGENTS.md 同源同类，属 ④「核验不再与开放项并存」的范围）→ 改为「本仓仍有开放项，见 `docs/TASKS.md` §一」，`last-verified` 提到 2026-11-12。这是本单唯一超出「③ 要求」字面清单的改动，性质与本单目标完全一致（消除过期断言），已在汇报中单列。
- **④ 的落地（台账自身）**：主台账 §一 引言重写为「本节 = `UI-FACTOR-CITATION-RETIRED`（待产品裁决）+ `UI-COPILOT-GATE-SURFACE` a 腿（待角色裁决）」，并补一句「**本节有两单在等裁决（见各条重开条件），不是没人做**」，避免读者把「只剩 2 条且都带 ⬜/🔶」误读成停滞；同时新增「**主/子台账分工（D13）**」段作为两处关系的成文出处。
- **⑥ 边界守住**：只改 5 个 md（`AGENTS.md`、`docs/TASKS.md`、`docs/ARCHITECTURE.md`、本归档文件、子台账 `TASKS.md`）；**未改任何代码**，未改子台账 B-01/B-02/B-06/G1~G4 的功能判定，未动 `UI-VISUAL-BASELINE-2026-11-12` ✅ 条目，未触碰 `SERVICE.md` 与其他仓。
- **残留**：broker frontmatter（见 ③）；W1-F7 观察窗功能缺口按单要求 dedup 到子台账 B-01/B-02/B-06/G1~G4，**本单未新立功能单**。

---

<a id="UI-SCREENER-ERROR-STATE"></a>
## UI-SCREENER-ERROR-STATE · 选股请求失败被渲染成「未找到符合条件的股票」[P0] ✅ 完成（2026-11-12）

- **① 目标**：把「请求失败」与「查到了但 0 条」在界面上彻底分开——失败要能看见「请求失败 / 可重试」，只有后端明确回了 0 条才说「未找到」。
- **② 上下文（2026-11-11 全面审查连带，`UI-SCREEN-CONSUMER` 施工时真栈发现第 3 条）**：`Screener.vue` 的 `catch` 只弹一条 3 秒后消失的 `message.error`，而模板的 `n-empty` 只看 `!loading && hasSearched`，于是**任何失败**（429 限流 / 502 / 断网）都同时落成「未找到符合条件的股票」。真栈复现：core 限流回 429 时页面正是这个形状。这不是文案问题——页面在替后端断言一个它没拿到的结论。
- **③ 要求**：① 失败态独立呈现（错误条 + 重试入口），空结果文案只在请求成功且 0 条时出现；② 失败时清掉上一次的结果表，避免旧数据被当成本次结果；③ 补组件用例覆盖 5xx / 网络失败 / 200 空数组 / 先成功后失败 / 重试成功五条判据；④ 破坏验证 = 把失败分支改回旧渲染 ⇒ 用例红，逐字节还原 ⇒ 绿。
- **④ 约束与非目标**：不改 `POST /api/screen` 契约、不改 core、不在前端伪造结果条数；不把限流（429）当空结果、也不把它当致命错误页——它只是失败态的一种。
- **⑤ 验收**：`Screener.test.ts` 全绿；`vue-tsc -b` 退出码 0；破坏验证两段输出入档。
- **⑥ 边界**：`web/src/pages/Screener.vue` + 其新增测试。
- **owner**：待定

### 施工记录（2026-11-12）

- **改动**：`failure` 状态与 `results` 互斥——`runScreen()` 进入时清空、`catch` 里写 `apiMessage(e, '请求没有成功')` 并**清空上一轮结果**；模板新增 `data-testid="screen-error"` 错误条（含 `data-testid="screen-retry"` 重试按钮，复用同一套筛选条件），空结果 `n-empty` 的判据由 `!loading && hasSearched` 收紧为 `... && !failure`，末尾那句「设置筛选条件后开始选股」也加 `v-if="!failure"`，避免失败时叠一句「你还没查过」。原 `message.error(...)` toast 删除（失败不再只存在于一条会消失的提示里）。
- **用例**：新增 `web/src/pages/Screener.test.ts`，5 例——502 → 错误态含「选股请求失败」+「网关服务不可用」+ 重试按钮，且**不出现**「未找到符合条件的股票」；`status 0` 网络失败 → 错误态；200 空数组 → 才出现「未找到」且无错误条；先成功（1 条）后 429 → 旧结果被清、错误条出现；重试成功 → 错误条消失、切成空结果态。
- **破坏验证（真实输出）**：把 `catch` 改回 `message.error(...)`（不写 `failure`）、空结果判据改回 `!loading && hasSearched` ⇒
  ```
  ❯ src/pages/Screener.test.ts (5 tests | 4 failed) 512ms
       × 后端 5xx：出现错误态 + 重试，不出现「未找到符合条件的股票」
       × 网络层失败（status 0）：同样走错误态，不冒充空结果
       ✓ 后端 200 但 0 条：这才说「未找到」，且不出现错误态
       × 成功后有结果再失败：旧表格必须清掉，不能把上一次的行当这次的结果
       × 重试按钮会用同一套条件重新发请求，成功后错误态消失
  Tests  4 failed | 1 passed (5)
  ```
  逐字节还原后（`Screener.vue` SHA256 回到 `A907B003…7F8475`）⇒ `Tests 5 passed (5)`。
- **⑤ 其它门禁**：`npx vue-tsc -b` = `TSC_EXIT=0`；`npx eslint src/pages/Screener.vue src/pages/Screener.test.ts` = `0 errors`（47 条 warning 全是该文件存量的 `vue/max-attributes-per-line` 风格项，非本次新增行）。
- **⑥ 边界守住**：只改 `web/src/pages/Screener.vue` 并新增其测试；未动 `market.ts`、未动 core、未伪造条数。

---

<a id="UI-E2E-A08-HARDCODE"></a>
## UI-E2E-A08-HARDCODE · a08 用例把票池总数写死 5908，真库 5580 [P2] ✅ 完成（2026-11-12）

- **① 目标**：让「PIT 与幸存者」这条 e2e 判的是**结构不变量**（屏上显示的就是回包里的读数），而不是一组背下来的数字。
- **② 上下文（2026-11-11 全面审查连带发现，2026-11-12 复核）**：`e2e/tests/a08-job-console.spec.ts` 拦截 `**/api/stocks/count` 后把回包与期望值都写成 `count:5908 / active:5569 / delisted:339 / latest_date:2026-10-14`。真库实测已不是这组数（`GET /api/stocks/count` = `count:5580, by_status:{active:5580}, latest_date:2025-12-31`）。写死数字的两种失败方式都很难看：数字变大就假绿（断言与实现无关地通过）、变小就假红；而且它**根本没检验「屏上是不是回包里的数」**——组件若把 5908 写进模板，这条用例照样绿。
- **③ 要求**：① 期望值不再散落成字面量，全部从**同一个回包常量**派生（含退市占比用该常量现算）；② 加一条回包常量自洽校验（`active + delisted === total`，否则占比期望值本身就来自矛盾回包）；③ 新增一条「换一组读数」用例，用数量级完全不同的回包证明屏上跟着回包走、模板里没有常量；④ 拦截串改成能匹配带 query 的形式。
- **④ 约束与非目标**：不改 `GET /api/stocks/count` 契约、不改组件、不放宽任何既有断言（`含已退市` / `DATA-02` / `无通道` / 显式空态那几条逐字保留）。
- **⑤ 验收**：a08 三条用例在同一条 dev 栈（vite `:5173` + core `:8085` + data `:8081`）上全绿；破坏验证 = 把组件里的 `poolCount` 换成字面量 `5580` ⇒「换一组读数」红，逐字节还原 ⇒ 绿。
- **⑥ 边界**：`e2e/tests/a08-job-console.spec.ts`。
- **owner**：待定

### 施工记录（2026-11-12）

- **改动**：抽出 `COUNT_READING = { total: 5580, active: 5241, delisted: 339, latest: '2025-12-31' }`（注释写明这是**拦截回包**，不是真库读数），所有 `toContainText` 改为 `String(COUNT_READING.x)` / 现算的 `share`；`latest_date` 断言同样改为常量派生。拦截串从 `'**/api/stocks/count'` 改为 `/\/api\/stocks\/count(\?.*)?$/`（旧 glob 匹配不到带 query 的请求，那是另一条假绿的路）。原第二条用例（拆分读数缺席）里的 `5908` 也改为引用同一常量。
- **新增用例**：`换一组读数：屏上跟着回包走，不是模板里的常量` —— 回包换成 `{ total: 902, active: 900, delisted: 2, latest: '2020-01-02' }`，断言屏上逐字跟随、且**不得**出现 `5580`、占比 `0.2%` 由该组现算。这条是防「模板写死常量」的唯一有效判据。
- **验收（真实输出）**：
  ```
  Running 3 tests using 1 worker
  [1/3] … PIT 与幸存者两块：拆分读数与行情最新日接上屏，PIT 三时刻仍明写无通道
  [2/3] … 换一组读数：屏上跟着回包走，不是模板里的常量
  [3/3] … 拆分读数缺席时走显式空态：不编占比，也不拿总数反推在市数
    3 passed (3.8s)
  ```
- **破坏验证（真实输出）**：把 `DataQualityPanel.vue` 的 `{{ poolCount }}` 改成字面量 `{{ 5580 }}` ⇒
  ```
  Error: expect(locator).toContainText(expected) failed
  Expected substring: "902"
  Received string: "幸存者偏差票池记录（含已退市）5580在市（active）900退市（delisted）2退市占比0.2%…"
    > 518 |     await expect(block).toContainText(String(OTHER.total));
  ```
  （破坏态只定向跑这一条：EXPECTED 是 902，屏上却是写死的 5580 —— 判据命中的正是「模板里有常量」。）逐字节还原后 `DataQualityPanel.vue` SHA256 回到 `EFA765DE…B6D58C5`，复跑 `3 passed (3.7s)`。
- **⑥ 边界守住**：只改这一份 spec；组件与契约未动。

---

<a id="UI-E2E-HISTORY-EMPTY"></a>
## UI-E2E-HISTORY-EMPTY · dashboard 用例假定历史为空，而库里已有真实回测记录 [P2] ✅ 完成（2026-11-12）

- **① 目标**：把「控制台历史」这条 e2e 从「假定没有记录」改成「有记录时渲染得对」，并保留「空态不许出现」的反向断言。
- **② 上下文（2026-11-11 全面审查连带发现，2026-11-12 复核）**：`e2e/tests/dashboard.spec.ts` 的 `history card section renders` 只有一条实质断言 —— `expect(card.getByText('暂无历史记录')).toBeVisible()`。它把「隔离环境」理解成「历史为空」，但历史实际来自 `GET /api/backtest/jobs`（`stores/backtest.ts` 的 `loadHistoryFromDB`），清 localStorage 只清本地缓存。库里已有完成记录（`c31722e0`、`2e1f22e9` 等），于是这条用例长期红 —— 而它红的方式很危险：任何人「修绿」它的最省事办法就是把断言删掉。
- **③ 要求**：① 断言列表真的渲染出记录（`n-list-item` 数 > 0）；② 断言空态**不**出现；③ 断单行结构三件套 —— 标题含 `·`（票池 · 策略）、前缀有状态/方向标签、右侧有「查看」；④ 不放宽、不删除任何既有断言，不改成 `.skip`。
- **④ 约束与非目标**：不改 `ConsoleHistory.vue`、不改 store 的数据来源；不为了稳定去 mock `backtest/jobs`（那会把「读真库」这条链路也一起测掉）。若将来库被清空，这条用例会红 —— 那是**正确的**红：它说明「有记录时能渲染」这个前提不再可验，应改判据而不是删断言。
- **⑤ 验收**：同一条 dev 栈上 `1 passed`；破坏验证 = 让列表恒不渲染（`v-if="validHistory.length > 0"` → `v-if="false"`）⇒ 用例红，逐字节还原 ⇒ 绿。
- **⑥ 边界**：`e2e/tests/dashboard.spec.ts` 的这一条用例。
- **owner**：待定

### 施工记录（2026-11-12）

- **改动**：用例重命名为 `history card 渲染真实回测记录：存在记录时列表结构完整，空态不出现`；断言链改为 `rows.first()` 可见（15s 等异步读库）→ `rows.count() > 0` → `暂无历史记录` 计数为 0 → 首行 `.n-thing-header__title` 含 `·`、`.n-tag` 首个可见、「查看」按钮可见。原「卡片可见 + 标题含控制台历史」保留。
- **验收（真实输出）**：
  ```
  Running 1 test using 1 worker
  [1/1] [chromium] › tests\dashboard.spec.ts:153:7 › Dashboard Page (Vue SPA) › history card 渲染真实回测记录：存在记录时列表结构完整，空态不出现
    1 passed (1.8s)
  ```
- **破坏验证（真实输出）**：`ConsoleHistory.vue` 的 `<n-list v-if="validHistory.length > 0">` 改成 `v-if="false"` ⇒
  ```
  Error: expect(locator).toBeVisible() failed
  Locator: locator('.n-card').filter({ hasText: '控制台历史' }).first().locator('.n-list-item').first()
  Expected: visible
  ```
  逐字节还原后 `ConsoleHistory.vue` SHA256 回到 `7BB5E483…AB01DF`，复跑 `1 passed (1.8s)`。
- **⑥ 边界守住**：只改这一条用例；组件与 store 未动。

---

<a id="UI-FACTOR-CITATION-RETIRED"></a>
## UI-FACTOR-CITATION-RETIRED · 因子引用抽屉仍在调用已退役的 `GET /api/factors/:name` [P2] ✅ 完成（2026-11-12）

- **① 目标**：把 `FactorCitation.vue` 从「读取 factor_cache 行」改成显式的「能力已退役」态，避免 core 返回 410 时被渲染成通用错误。
- **② 上下文**：core 于 2026-11-11（C8 / ADR-037 §5 / ADR-041）把 `GET /api/factors/:factor_name` 显式退役为 `410 Gone` + 机器码 `factor_http_surface_retired`，不再反代 data。本仓 `web/src/api/factor.ts` 仍调用该路径，`FactorCitation.vue` 只把 404 当「无行」、其余都落 `errorMessage`，因此 410 会显示成一条含状态码的错误；`e2e/tests/evidence-probe.spec.ts` 的 `page.route('**/api/factors/**')` mock 也仍按 200/404 写。
- **③ 要求**：① `getFactorCitation` 的调用方识别 410 + `factor_http_surface_retired`，渲染「该能力当前未提供/已退役」而不是通用错误；② 视产品取舍决定是否整体下线该抽屉入口（需产品决定，不在本单自拍）；③ e2e mock 更新为 410，断言退役文案；④ 不恢复任何反代或新端点。
- **④ 约束与非目标**：不改 core 路由、不复制 openapi；不在前端伪造因子数值。
- **⑤ 验收**：`npm run build` / `npm test` 绿；组件测试覆盖 410 退役分支；e2e 不再把 404 当唯一空态。
- **⑥ 边界**：`web/src/api/factor.ts`、`web/src/components/factor/`、`e2e/tests/evidence-probe.spec.ts`。
- **owner**：待定
- **重开条件**：产品决定「因子引用抽屉是下线还是保留只读提示」后即可开工；若 core 按 ADR-041 重开因子读面，则本单作废并改指新契约。
- **审查确认（2026-11-11 W7，dedup 不新立单）**：全面审查 W2-F7 复核 `web/src/api/factor.ts:20` 仍死调已退役 `GET /api/factors/:name`（410 `factor_http_surface_retired`），与本单前提一致；证据见 ODR-069（`tellurion-docs:docs/archive/odr/odr-069-audit-wave2-core-architecture.md`）W2-F7 行。

### 裁决（2026-11-12，产品）

**保留抽屉，内容换成退役说明**：明确写「该能力已按 ADR-037 退役，因子值由 core 按需求值」，并给 ADR-037 的落点。不删抽屉——用户的解释路径需要可见落点。原「下线 vs 保留提示」的待裁项就此关闭。

### 施工记录（2026-11-12）

- **组件**：`FactorCitation.vue` 从「查询表单 + 五元组表格 + 就地抽屉」改为**说明页**（`data-testid="factor-retired-notice"`）：文案写明「该能力已按 ADR-037 退役：因子值由 core 按需求值」、core 于 2026-11-11 把 `GET /api/factors/:factor_name` 收回为 `410 Gone`（机器码 `factor_http_surface_retired`）、不再读取 factor_cache；`NDescriptions` 列出状态 / 机器码 / 裁决 / **落点 `tellurion-docs:docs/adr/adr-037-factor-value-ownership.md`** / 因子值归属；末尾指明仍然可用的回溯路径（回测报告与对比页的质问入口、`/evidence?content_hash=` 深链）。**不再展示任何因子数值**（退役后前端没有合法来源）。
- **删除死代码**：`web/src/api/factor.ts`、`web/src/api/factor.test.ts`、`web/src/types/factor.ts`（`FactorCacheEntry` / `CitationTuple` 已无消费方）。这不是"顺手清理"：留着它等于让下一个人照着它再写一次 410 调用。
- **单测**：`FactorCitation.test.ts` 重写为 6 例——退役文案含 ADR-037 与「因子值由 core 按需求值」、落点路径逐字、机器码 + 410 + 端点名、**无输入框无「查询」按钮**、**挂载即不发任何 `/api/factors` 请求**、不展示 `z-score` / `百分位` / `原始值`。原「五元组表格 / 未归档旗标 / 未命中 / 抽屉就地打开」几组断言随被测对象退役（factor_cache 读面已不存在），证据三态机仍由 `EvidenceProbe.test.ts`（11 例）与真栈 e2e 守着。
- **e2e**：`evidence-probe.spec.ts` 的两条 `**/api/factors/**` mock 用例（断言 3 / 断言 5 mock）退役——它们唯一的坐标来源就是被收回的读面，继续 mock 等于测一条不存在的产品路径；替换为一条真栈用例：`/factors` 出现退役说明、含 ADR-037 落点与机器码、**没有** `input[placeholder^="因子"]`、整段访问期间 `/api/factors` 请求数 = 0（`page.on('request')` 收集）。真栈结果 `1 passed (1.8s)`。
- **验收（真实输出）**：`npm test` = **548 passed / 39 files**（`TEST_EXIT=0`）；`npx vue-tsc -b` = `TSC_EXIT=0`。
- **破坏验证（真实输出）**：在 `FactorCitation.vue` 的 setup 里加一行 `fetch('/api/factors/probe')`（模拟"退役没退干净"）⇒
  ```
   × 挂载即不发任何 /api/factors 请求（退役后仍去撞 410 就是没退役干净）
  AssertionError: expected [ '/api/factors/probe' ] to deeply equal []
  ```
  另 5 例仍绿（缺陷只落在这一条判据上）。逐字节还原后 SHA256 回到 `B479E9CEFCCA29D3435C068B4FB62BF5E68527538842C24CF733D9FD675171FF`，复跑 `Test Files 1 passed / Tests 6 passed`。
- **文档同步（变更触发）**：`docs/api-schema.md` 消费面表把 `factor.ts` 划掉并注明退役（`last-verified: 2026-11-12`）；`docs/db-schema.md` 把「行情 / 因子值 → 经 `/api/factors`」拆成两行，因子值改为「core 按需求值（ADR-037），本仓不读」；子台账 A-06 的「因子侧只能 mock」补 2026-11-12 订正注。
- **⑥ 边界守住**：未改 core 路由、未恢复反代、未新增端点、未伪造任何因子数值；`/api/factors` 在代码里已无任何调用点。

---

<a id="UI-COPILOT-GATE-SURFACE"></a>
## UI-COPILOT-GATE-SURFACE · Copilot 把 promote 闸门拦下误报成「沙箱未启用」，且无人类 promote 操作面 [P1] ✅ 完成（2026-11-12；b 腿 + a 腿）

- **① 目标**：让主任在 Copilot 看到的终态文案**诚实**（闸门拦下 ≠ 沙箱未启用），并有一条**可操作的人工 promote 路径**，使 ADR-023「人是闸门」在产品面落地，而不是呈现为「永远失败」。
- **② 上下文（2026-11-11 全面审查 W6-F2 ★H，证据 ODR-073 `tellurion-docs:docs/archive/odr/odr-073-audit-wave6-service-repos-frontend.md`；裁决 D3=b 先行 + a 立案）**：后端闸门 fail-closed **正确**（agent `copilot.go:666-669` / `stopAtGate:708-709` 终态 `sandbox_rejected`，`api-schema.md:92/:168-172` 诚实成文四成因；`generated`/`backtest_complete` 是契约刻意保留的预留态）。缺口在 UI 与人类侧：① `web/src/pages/Copilot.vue:89-92` 对**一切** `sandbox_rejected` 追加「（沙箱未启用：需配置 copilot.working_dir…）」——对今天占主导的**闸门拦下**路径是假话；② `:71` 进度文案「生成中（LLM → 沙箱编译 → **回测**）」承诺不存在的回测跳（agent 今天不跑回测，`copilot.go:660`）；③ `:78-84` 仍处理 `backtest_complete`（白名单保留是契约要求，但进度文案撒谎）；④ 全 ui 仓 grep `promote|promote_gate|blocked_reason` **零命中**，唯一 promote 端点 = strategy `POST .../versions/{hash}/promote` 只认 `service` + `X-Actor`，主任以管理员身份调也不通。
- **③ 要求（分两腿，b 先行不依赖角色裁决）**：**b 腿（先行）**：① 订正 Copilot.vue 文案——`sandbox_rejected` 按 `build_error` 区分「闸门拦下」（提示「编译已通过，待人工 promote」）与「沙箱/资产/链故障」，不再一律说「沙箱未启用」；② 进度文案去掉「→ 回测」假跳（改为「LLM → 沙箱编译 → 人工闸门」）；③ 本仓 `docs/runbook.md`（与 `UI-RUNBOOK-GAP` 协同）写成文人工 promote 路径：主任拿 service token + `X-Actor` curl strategy promote 端点（可审计）。**a 腿（立案，须先裁角色）**：④ UI promote 按钮经 core 反代到 strategy——**前置 = 裁「人 promote 走什么身份」**（strategy 策略表今天只认 service；admin 代调还是给主任签发 service token 未定），角色裁决前不落按钮。
- **④ 约束与非目标**：不改后端闸门 fail-closed 语义（W4 A-3 ✅ 不动）；不删 `generated`/`backtest_complete` 白名单（契约刻意保留）；不在前端伪造 promote 成功；a 腿角色未裁前不擅自给 strategy 策略表加 admin 档；不复制 openapi。
- **⑤ 验收**：b 腿——组件测试断言「闸门拦下」终态文案不含「沙箱未启用」、含「待人工 promote」；runbook 有成文 curl promote 步骤且真栈跑通一次（A4 授权）；破坏验证 = 把文案改回一律「沙箱未启用」⇒ 用例红，还原复绿。a 腿——角色裁决落定后另验收（按钮经反代 promote 成功 + 审计留痕）。`npm run build`/`test` 绿。
- **⑥ 边界**：本仓 `web/src/pages/Copilot.vue` + `docs/runbook.md`；a 腿的 core 反代归 `tellurion`、strategy 角色策略归 `tellurion-strategy`（须先裁）；后端闸门行为归 agent（不动）。
- **owner**：待定

### 施工记录（b 腿，2026-11-12）

- 新增 `web/src/utils/copilot.ts` 作为终态文案的唯一口径（按 `build_error` 分 `promote_gate` / `sandbox_unavailable` / `asset_register` / `chain_trace` / `unknown`，**认不出就不补解释**），`Copilot.vue` 改用它；进度文案改为 `LLM → 静态检查 → 沙箱编译 → 资产登记 → 人工 promote 闸门（这条链不会自动跑回测）`。
- 用例 `web/src/pages/Copilot.test.ts`（真组件 + 假后端）钉住三条判据。破坏验证：把失败分支改回「一律追加沙箱未启用」⇒ 2 例红（`闸门拦下` / `认不出原因`），逐字节还原后 4 例绿。

### 裁决（a 腿，2026-11-12，产品）

**人 promote 走登录者自己的身份**：前端用当前登录用户的 JWT 调 promote，**不要 service token，也不要 admin 代调**。理由：promote 是人对某个策略版本背书，责任人必须能落回具体用户；service token 是机器身份，用它 promote 等于把人的决定洗成系统行为，审计链断掉；admin 代调则把责任从决策人身上挪走。角色门槛沿用后端既有分级（**admin / trader**），**不新增角色**。上述理由同时写进 `web/src/api/strategy.ts` 的实现注释与 `docs/runbook.md` §6。

### 施工记录（a 腿，2026-11-12）

- **API 层**：`web/src/api/strategy.ts` 新增 `PromoteTarget` / `PromotedArtifact` / `promoteStrategyVersion(target, actor)`。请求 = `POST /api/strategies/{id}/versions/{hash}/promote`，带 `X-Actor: <登录用户名>`；`Authorization` 由 `api/client.ts` 自动注入 `getAccessToken()`（**登录者本人的 token**，不读 service token、不留任何代调后门）。注释逐条写明裁决理由与 400/401/403/404/409 拒绝口径。
- **坐标来源**：job 读面不发资产字段，唯一坐标来源是 `build_error` 里 agent 写下的资产登记语（`carrier=wasm strategy_id=st_… version_hash=…`）。新增 `web/src/utils/copilot.ts:parsePromoteTarget()` 解析这一句；**取不全就返回 `null`，页面不渲染按钮**（宁可没有，也不猜一个版本去放行）。
- **组件**：新增 `web/src/components/copilot/PromoteGate.vue`。角色门 `canPromote = username && (role === 'admin' || role === 'trader')`：未登录 / 角色不足时按钮 `disabled`，不让人点出一个注定 401/403 的按钮；两段式确认（先点「放行这个版本」，再点「确认放行」）避免误触；成功文案写明「已由 `<用户名>` 放行（status=…），审计已留痕」；失败按 401/403/404/409 分别给可执行解释（404 明说「坐标过期或网关未开通」，**不**把 404 说成成功）。`Copilot.vue` 在闸门拦下且坐标可读的终态消息下挂出该组件。
- **文档**：`docs/runbook.md` §6 身份口径改为登录者自己的凭据（`Authorization: Bearer <你的 access token>` + `X-Actor: <你的用户名>`），拒绝表补 401 / 403 两行；「本机栈的已知缺口」扩为三条（无编译器 → 成功态本机不可达；core 未反代 promote → UI 会如实显示 404，不许改直连或改回 service token；strategy `policy.go` 只放 `service` → 需 strategy 仓打开 admin/trader）。`docs/api-schema.md` 的 `strategy.ts` 行补 promote 端点与拒绝口径。
- **单测（新增三份 12 例）**：`web/src/utils/copilot.test.ts`（3 例，解析坐标 / 缺一半返回 null / 半角括号逗号不被带入）；`web/src/components/copilot/PromoteGate.test.ts`（7 例，真 `api/client` + 假 `fetch`：admin 登录 → 请求头含 `Authorization: Bearer jwt-alice` 与 `X-Actor: alice`、**无 service 头**、成功文案含用户名与 promote 结果；无 token → 401 且不带 Authorization；viewer → 按钮 disabled + 零请求；未登录 → disabled；403/409/404 各一条文案）；`web/src/pages/Copilot.test.ts` 增 2 例（闸门 + 坐标 → 挂出组件且未登录时 disabled；坐标读不出 → 不渲染组件）。
- **验收（真实输出）**：`npx vitest run src/utils/copilot.test.ts src/components/copilot/PromoteGate.test.ts src/pages/Copilot.test.ts` = `Test Files 3 passed (3)` / `Tests 16 passed (16)`；全量 `npm test` = `Test Files 41 passed (41)` / `Tests 562 passed (562)`（`TEST_EXIT=0`）；`npx vue-tsc -b` = `TSC_EXIT=0`。
- **破坏验证（真实输出）**：把身份来源改回 service token——`web/src/api/strategy.ts` 的 headers 改成 `{ 'X-Actor': 'service', 'X-Service-Token': 'service-token' }` ⇒
  ```
   × 登录用户放行成功：带自己的 Bearer，X-Actor 是登录名，且不带 service 凭据
   AssertionError: expected 'service' to be 'alice'
   × 没有 token：请求不带 Authorization，界面说「需要登录」而不是假装成功
  EXIT=1
  ```
  逐字节还原后 `strategy.ts` SHA256 回到 `AC1144602D1AA71C95159E6AFF3672985512BCB3F49F214F3FE6A93B8BEA257F`，三文件复跑 `Test Files 3 passed / Tests 16 passed`。
- **⑤ 怎么算过、什么还不可达**：UI 侧要求（同源 JWT + 角色门 + 诚实错误面 + 坐标不可读不给按钮）已全部落地并被上面用例钉住。端到端「按钮真的 promote 成功」在本机**不可达**，缺的是两条跨仓前置，不在本仓施工范围：① core 未反代 `POST /api/strategies/{id}/versions/{hash}/promote`（打 `:8085` 返 404，归 `tellurion`）；② strategy `internal/httpapi/policy.go` 当前只放行 `service` 角色，用户 JWT（admin/trader）会被 403（归 `tellurion-strategy`）。两者满足后按 `docs/runbook.md` §6 ② 原样复跑即可，本仓前端无需再改。
- **⑥ 边界守住**：未改后端闸门、未改 core / strategy 任何代码、未在前端伪造 promote 成功、未直连 `:8090`、未给任何角色开后门；新增角色 = 0。

### 重开条件

以下任一成立时重开本单（只补 e2e 成功态，不重做 UI）：

1. `tellurion` 在 core 补上 promote 反代（`:8085` 可达），且
2. `tellurion-strategy` 的 `internal/httpapi/policy.go` 给 promote 打开 `admin` / `trader` 角色。

两条同时满足后，在原生三服务栈上补一条 e2e：登录用户点「放行这个版本」→ 200 → `GET .../promotions` 出现一行 `X-Actor` = 该用户名。若只想验拒绝面（401/403/409），在 dev 栈即可跑，不需要编译器。


---

<a id="X-CI-RACE-STATICCHECK-ui"></a>
### X-CI-RACE-STATICCHECK（ui 腿）· CI 补生产构建门（跨仓伞 `tellurion:X-CI-RACE-STATICCHECK`）

> **施工记录（2026-11-12）**：
> - **改了什么**：`.github/workflows/ci.yml` 的前端 job 在 `Test` 之后新增 `Build` 步（`npm run build`）。**不新增** `-race` / `staticcheck`——本仓无 Go 代码，这两门由 Go 仓各自承担；ui 腿的对应物是「打包路径真跑一遍」。
> - **为什么不靠 `typecheck`**：`typecheck` 是 `vue-tsc --noEmit`，`build` 是 `vue-tsc -b && vite build`，不是同一条路径。前者挡不住打包期才会暴露的问题（入口/别名解析、静态资源缺失、chunk 输出异常等）。
> - **验收（真实执行）**：`npm run build` 在 `web/` 下退出码 0，`vite build` 6.96s 完成，产物正常输出到 `dist/`（最大 chunk `index` 368.77 kB / gzip 115.42 kB）。
> - **边界**：只加一步构建门；不动 lint/typecheck/test 现有口径，不动 e2e job（其「无后端栈故不跑用例」的现状与注释保持原样）。

---

<a id="X-LOW-CLEANUP-ui"></a>
### X-LOW-CLEANUP（ui 腿）· `openapi` 不复制守卫（跨仓伞 `tellurion:X-LOW-CLEANUP`）

> **施工记录（2026-11-12）**：
> - **原文取证**：ODR-069 W2-F7 的低成本清理簇含「不复制守卫」要求；本仓与规格的关系是 ADR-0001：**openapi 只住 core**（`tellurion:docs/openapi.yaml`），治疗「各仓抄一份、然后各自漂移」。
> - **改了什么**：新增 `scripts/check-no-openapi.mjs`（Node，零依赖）：递归扫工作区，文件名命中 `^(openapi|swagger).*\.(ya?ml|json)$` 即红；排除 `.git` / `node_modules` / `dist` / `coverage` / `test-results` / `playwright-report` / `.vite`。CI 在前端 job 末尾加 `Guard（openapi 不复制）` 步（`working-directory: .`）。
> - **为什么扫工作区而不是 `git ls-files`**：未 commit 的副本同样会被拦下，PR 提交前本地就能发现，不依赖「已入库」这一前提。
> - **破坏验证（真做真还原）**：`node scripts/check-no-openapi.mjs` → 退出码 0；复制 `tellurion:docs/openapi.yaml` 为仓库根 `openapi.yaml` ⇒ 退出码 1 并打印命中路径；删除后复跑退出码 0。
> - **边界**：只加守卫脚本与 CI 一步；不改前端构建/测试，不引入新依赖。

---

<a id="UX-AB-CLOSEOUT-2026-11-12"></a>
### UX-AB-CLOSEOUT · UX 重构 A/B 收尾批（2026-11-12）

> **归档口径**：本批是子台账 `docs/design/stitch_quantlab_ux_redesign/TASKS.md` 的功能项，**断言原文与取证表不搬入本归档**（D13：主/子台账互不收录正文）。本段只做收口索引；判据一律回子台账对应小节。

| ID | 收口内容 | commit |
|---|---|---|
| A-09 | 纸交易观测台 `/paper-trading`：订单 / 持仓 / 账户 / 外部信号流四块；信号流接 core 新补的 `GET /api/signals`（空流与「读面未接」分开画） | `9ca2a61`、`97e934d` |
| A-10 | 合规 / 系统管理 / walkforward+batch 三缺屏；断言 3 由 5 条订正为 **4 条**（walkforward 历史读端点退役、batch CSV 501） | 五连（已推 `origin/main`） |
| A-11 | 字体自托管：`@fontsource/inter` + `jetbrains-mono` 的 latin 子集，ODR-001；woff2 增量 91.4 KiB | `01b5baa` |
| B-01 | 回放按 `seq` 升序（`orderAttemptsBySeq`）+ 反插入顺序用例；不改页面 | `416d598` |
| B-02 | 审阅台 `/review`：平台宽度 × 因果强度排序（近似，页顶标注）+ 采纳裁决写 G6 | `efc6cef` |
| B-04 | 策略库 / 编辑器 / Copilot 三页合一为 `/strategy-lab` 三 tab；旧路径保留别名 | `08e95f1` |
| B-06 | 指方向 / 追问 / 标记三干预接真端点（G2/G3/G4）；disabled 与可用两态 DOM 结构一致 | `efc6cef` |
| A-04 断言 5 | ⌘K 命令面板 + 「待审阅 N」接 `GET /api/review/pending`（`null` 显示「—」） | `319004c`、`a540f65` |

> **验收输出**：新增/改动单测（`review` 工具、`InterventionBar`、`ReviewDesk`、`review`/`execution` API、`PaperTrading`）本地全绿；`npx vue-tsc -b` 退出码 0；`eslint` 0 error；e2e 子集 `review-desk` / `command-palette` / `nav-consistency` / `dashboard` **21 passed / 1 failed**（dashboard 历史卡片依赖真库历史，属既有环境依赖，非本批引入）、`paper-trading` 4 passed。视觉基线：A-11 后重生成 10 张非 responsive 基线，连跑两轮 10/10；2 条 responsive 仍红（V-2/V-3 测试债，不在本批）。

---

<a id="UI-PLAYWRIGHT-TRIAGE-2026-11-13"></a>
## UI-PLAYWRIGHT-TRIAGE-2026-11-13 · 7 条 Playwright 失败逐条分诊 [P1] ✅ 完成（2026-11-13）

> 档 4（测试）· 来源：03-testing P1-2 · 顺序 4-10 · 依赖：无

- **① 目标**：把实测 7 条 Playwright 失败分类为"真缺陷 / 基线过期 / 环境问题"，逐条处置，并修正台账"0 open"的错误表述。
- **② 上下文**：本仓台账写"8/8 spec 全绿、0 open"，但审查实测 7 条失败且未分类——台账与实测不一致，读者会误判 UI 测试健康度。
- **③ 要求**：① 跑 `npm run test:e2e`（或仓库实际脚本），逐条记录 spec / 用例 / 错误摘要；② 三类归档：真缺陷→在本条修或在 UI 另立修复单；基线过期→按视觉基线规则逐张判定后重录，禁止一律重录；环境问题→写重开条件；③ 同步修正台账"0 open"。
- **④ 约束与非目标**：不得为变绿放松断言；不得跳过未分类用例；不改后端。
- **⑤ 验收**：7 行分诊表（用例 / 分类 / 处置 / 证据）；重跑结果 = 全部通过或显式挂起（含原因）；台账不再出现"0 open"。
- **⑥ 边界**：UI e2e + 台账；后端缺陷另立单。

### 施工记录（2026-11-13）

**原始证据**：审查引用的失败日志是 `tellurion:reports/test-2026-11-13/w5-playwright-final.log`（2026-11-12 22:24，211 passed / 7 failed / 2 skipped）。本轮先按该日志逐条提取错误摘要，再在原生三服务栈（vite :5173 / data :8081 / analysis :8085 / ai :8086）上跑本仓全量 `npx playwright test --reporter=line`（220 例，1 worker，5.9m）复验。

**7 行分诊表**

| # | 用例（spec:line） | 错误摘要（原日志） | 分类 | 判定与处置 | 修复 commit | 本轮复跑 |
|---|---|---|---|---|---|---|
| 1 | `a08-job-console.spec.ts:296` 取消走真后端 | `点取消后没等到 /api/sync/jobs/<id> 的回读` 15s 超时（3 次重试全红） | **用例陈旧**（竞态前提过期） | 从看到取消按钮到点下去之间作业可能已跑完，后端对终态作业取消返回 409，页面不会发单条回读；旧用例把"取消一定被受理"当前提。改为等**确定终态**（单条回读或 8s 轮询列表任一），仍断言界面态 == 后端终态；未放宽断言 | `120af41`（W5-1） | pass |
| 2 | `api-strategy.spec.ts:28` copilot 无 key 的错误形状 | `expect([200,202,500,503]).toContain(400)` 失败，收到 400 | **用例陈旧**（契约字段过期） | helper 发 `prompt`，agent `pkg/copilot.GenerateParams` 字段是 `description`，绑空描述后在参数校验处 400。helper 改发 `description`；断言保持（200/202 有 `code`/`job_id`，500/503 有 `error`） | `ca6f590`（W5-2） | pass |
| 3 | `backtest-engine.spec.ts:442` responsive 768 | `locator.click` 30s 超时 | **用例陈旧**（布局事实） | 768px 侧栏折叠为图标轨，`.nav-item` 文字节点不渲染，按文本点侧栏天然点不到——不是导航坏。用例改深链 `goto('/backtest')`，其余布局断言（`.bt-page`、表单卡、1280 回拉）不变 | `2c84faa`（W5-3） | pass |
| 4 | `copilot.spec.ts:73` 仪表盘导航 | `locator.click` 30s 超时 | **用例陈旧**（B-04 合并后旧磁贴已删） | 仪表盘「策略 Copilot」磁贴已并入 `nav-tile-strategy-lab`，`/copilot` 退成路由别名。改点该磁贴并断言落 `/strategy-lab` + `.strategy-lab-page` | `814e7c1`（W5-4） | pass |
| 5 | `data-sync-error.spec.ts:16` 未知 job_type | `expect(202)` 收到 400 | **用例陈旧**（受理门新增取数范围） | data 侧 `ValidateJobScope` 新增门槛：无 `symbols`/`start_date`/`end_date` 的空转请求 400；未知类型不在受理门校验，仍由 runner 失败暴露。请求补取数范围，断言仍为 202 + 30s 内 `failed` + `error_message` 非空 | `5a356f3`（W5-5） | pass |
| 6 | `data-sync-error.spec.ts:126` 重试计数 | 同上（create 400） | **用例陈旧**（同上） | 补取数范围；重试计数断言不变 | `5a356f3`（W5-5） | pass |
| 7 | `data-sync.spec.ts:146` 重试失败作业 | 同上（create 400） | **用例陈旧**（同上） | 补取数范围；重试断言不变 | `5a356f3`（W5-5） | pass |

**结论**：7 条**全部为用例陈旧**，产品缺陷 **0 条**，视觉基线过期 **0 条**（7 条均非 `visual-regression.spec.ts`，无需讨论重录），纯环境问题 **0 条**（失败均可在当前栈上稳定复现其原因并已被测试侧修正）。不存在"靠改用例掩盖产品缺陷"的情形：复原后的用例断言强度未降（取消仍比对后端终态、copilot 仍要求失败体有 `error`、data-sync 仍要求 202 + 失败终态 + 非空 `error_message`）。

**重跑结果（本轮实测）**：

```
Running 220 tests using 1 worker
  2 skipped
  218 passed (5.9m)
```

- 31 spec / 220 例；`test.fixme` = 0。
- 2 skipped 为 `auth-login-flow.spec.ts` 的「开启鉴权形态」「引导→登录→登出」两条：当前栈是 open-access 且未提供 `E2E_AUTH_USER` / `E2E_AUTH_PASSWORD`，用例内 `test.skip` 已写明跳过理由（环境条件跳过，非红）。

**台账订正**：`docs/TASKS.md` §一 顶部由"当前没有未做的单"改为**逐条列出当前开放项 ID** + 实测 e2e 健康度段；frontmatter 中 2026-11-12 的"0 张开放单"明确标注为过期时点；`AGENTS.md` §5 删除"§一 当前无开放单"，改为开放项 ID 清单并禁止引用任何时点的"0 open"结论。

**边界**：只改 `docs/TASKS.md`、`AGENTS.md`、本归档；无源码改动（7 条的测试侧修复已在 `120af41`/`ca6f590`/`2c84faa`/`814e7c1`/`5a356f3` 落地），不改后端。

---

<a id="UI-CI-COVERAGE"></a>
## UI-CI-COVERAGE · 前端覆盖率门（vitest coverage + CI 步骤）[P2] ✅ 完成（2026-11-13）

> 档 4（测试）· 来源：03-testing P2-2 · 顺序 4-11 · 依赖：core 伞 `X-COVERAGE-FLOOR`

- **① 目标**：前端也有能拦住回退的覆盖率门。
- **② 上下文**：`package.json` 无 `test:coverage` 脚本，CI 不跑覆盖率；当前只有单测与 e2e 通过性。
- **③ 要求**：① 加 `test:coverage`（vitest 内置 coverage，如缺 `@vitest/coverage-v8` 属必要依赖，需在提交说明）；② 先测实际覆盖率；③ CI 设门 = 实测 - 5 点；④ 报告输出到 CI artifact 或 `coverage/`（不入库）。
- **④ 约束与非目标**：不引入第二套测试框架；不把 e2e 计入覆盖率；不追求 100%。
- **⑤ 验收**：`npm run test:coverage` 产出摘要；CI 使用新阈值；删除一个有断言的测试文件 ⇒ 门红。
- **⑥ 边界**：UI `package.json` + CI。

### 施工记录（2026-11-13）

**事实订正（先验证再动手）**：本条 ② 的前提「package.json 无 `test:coverage` 脚本」**已过期**。`web/package.json` 已有 `test:coverage`（`vitest run --coverage`），`@vitest/coverage-v8` 已在 devDependencies，`vitest.config.ts` 已有 `coverage.include`（`components/backtest` / `composables` / `stores` / `utils` / `api`）。真正缺的是**阈值门**与 **CI 调用**，本轮只补这两项，未动依赖、未换框架。

**实测基线（52 文件 / 643 例，`npm run test:coverage`）**：

```
All files          |   65.65 |     51.6 |   61.35 |    66.5 |
                    statements | branches | functions | lines
```

**门的设计（对 ③「实测 -5 点」的偏离与理由）**：先按 -5 点设了 `61/60/46/56`，破坏验证时发现它对本仓有效的回退**完全失灵**——删掉最大的单个测试文件 `src/api/client.test.ts`（19KB）后覆盖率只掉到 statements 63.64 / branches 49.74 / functions 58.48 / lines 64.70（-2.01 / -1.86 / -2.87 / -1.80 点），门仍绿；删 `src/stores/sync.test.ts` 也只掉 3.16 / 2.49 / 3.65 / 2.70 点。也就是说 **-5 点缓冲 > 单个测试文件的全部贡献**，与本条自己的验收「删一个有断言的测试文件 ⇒ 门红」直接冲突。故改为**实测 -2 点**，取整向下：

```ts
thresholds: { lines: 64, statements: 63, branches: 49, functions: 59 }
```

-2 点仍留出约 34 条 statements 的自然漂移空间（正常小改不会假红），同时任一核心测试文件被删即红。理由已写进 `web/vitest.config.ts` 的注释，避免后人"按 -5 点修回去"。

**CI 落地**：`.github/workflows/ci.yml` 的 `frontend` job 在 `Test` 之后新增两步——`Coverage gate`（`npm run test:coverage`）与 `Upload coverage report`（`actions/upload-artifact@v4`，`web/coverage/`，7 天）。单独一步而不是塞进 `npm test`：红的时候一眼区分「用例挂了」还是「覆盖率掉了」。`coverage/` 本就在 `.gitignore`（第 11 行），不入库。

**破坏验证（真实命令 / 真实退出码）**：

| 步骤 | 命令 | 实测 |
|---|---|---|
| 绿 | `npm run test:coverage`（门 64/63/49/59） | `All files 65.65 | 51.6 | 61.35 | 66.5`，EXIT=0 |
| 红 | 移走 `src/api/client.test.ts` 后 `npm run test:coverage` | `All files 63.64 | 49.74 | 58.48 | 64.7`；`ERROR: Coverage for functions (58.48%) does not meet global threshold (59%)`；**EXIT=1** |
| 还原 | `Move-Item` 移回 | SHA256 `614B3748…79F85` 与移走前一致（`HASH_RESTORED=True`），`git status` 该文件无改动 |
| 复绿 | 还原后重跑 | EXIT=0（见上）。同轮 `sync.test.ts` 的移走/还原同样逐字节一致 |

**证据日志**（临时产物，不入库）：`tellurion-ui/test-results/coverage-run1.log`（基线）、`coverage-gate-green.log`（绿）、`coverage-gate-red.log`（红）、`coverage-destroy.log` / `coverage-destroy2.log`（-5 点下的失灵实测）。

**边界**：改 `web/vitest.config.ts`、`.github/workflows/ci.yml`、`AGENTS.md` §2、`docs/TASKS.md` + 本归档；无源码、无依赖变更。
