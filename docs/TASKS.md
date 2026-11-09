---
status: active
last-verified: 2026-11-10
verified-by: 2026-11-10 AUD-63 收口补充——core `/api/market/index` 改为本地供数（原生栈 + 真 PG 播 4 行指数日线）后，「有读数」支真栈跑通（`metrics cards render with labels` 1 passed），`market-metric-close` 破坏验证红→逐字节还原复绿，AUD-63 由 🔶 翻 ✅。此前：AUD-61 ① 批清 11 条 fixme（14 passed / EXIT=0）；AUD-63 真栈轨与两条破坏验证；全量 135 passed / 44 failed / 7 skipped，44 条红全部归因「库内零行情行 + 无 orchestration + 同步作业无外网」。
---

# tellurion-ui · 任务台账

> 任务定义规范沿用 core 仓 `tellurion/AGENTS.md` §8.5（六字段：①目标 ②上下文 ③要求 ④约束与非目标 ⑤验收 ⑥边界）。
> 状态标记：`⬜ 待做` / `🔶 进行中` / `⛔ 阻塞` / `✅ 完成（附日期）`

> **第三轮裁决指针（2026-10-25）**：⑥ e2e 走两轨——无栈的 `typecheck/lint/vitest` 现在做；真栈 e2e 等 Docker Desktop / CI；**视觉基线在本机重生成**（playwright 无 `webServer`）。⑳ AUD-61 ④ 允许**窄例外**：只给 `NavTiles.vue` / `MarketMetrics.vue` / `AppSidebar.vue` 加 `data-testid`（纯增量属性，不改类/结构/文案），**单独 commit**。正文见 `tellurion:docs/design/qt-decoupling/cross-repo-decision-record-2026-10-25.md` §五。

---

## 施工序（候选单，开工前必须展开成六字段）

> 这张表是**施工顺序**，不是任务台账：每条在执行前要展开成六字段单（目标/上下文/要求/约束/验收/边界），并写明冻结契约的路径与节号。
> 顺序有依赖，不要跳级。

| 阶段 | 内容 | 上游单号 | 前置 |
|---|---|---|---|
| AUD-61 阶段一（✅ 2026-10-23） | 起齐三服务跑 e2e，把已知红改 `test.fixme` 并登记 | `AUD-61` | 无 |
| AUD-61 阶段二 ③/④（✅ 2026-10-23） | 先做不依赖 DOM 的 API 期望与共享限流两类，逐条清 fixme 与登记 | `AUD-61` | 阶段一 |
| AUD-61 阶段二 ①（🔶 2026-11-10：11/16 已对齐清表，余 5 条列明阻塞） | 结构漂移/视觉基线 16 条；原「等 `feat/design-tokens-v2-palette-sweep` 合并」的阻塞已于 2026-10-25 解除；2026-11-10 用**无 Docker 的原生三服务栈**跑通并清 11 条，余 1 条缺真行情数据 + 4 条视觉基线待人工核对 | `AUD-61` | ③/④ ✅ + 重构合并 ✅ + 三服务与 PG 起齐 ✅（2026-11-10 原生栈） |

## AUD-61 · e2e 套件与前端结构脱节（测试债） 🔶（阶段一 ✅ 2026-10-23；阶段二 ③/④ 批 ✅ 2026-10-23；① 批 🔶 2026-11-10：清 11 / 余 5）

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
  | backtest-engine.spec.ts | backtest history shows completed jobs with correct data | ① + 缺真行情数据 | 2026-10-23 | 阶段二 ①（数据阻塞） | |
  | visual-regression.spec.ts | dashboard renders correctly | ① 视觉基线待重生成 | 2026-10-23 | 阶段二 ①（视觉腿） | |
  | visual-regression.spec.ts | backtest page renders correctly | ① 视觉基线待重生成 | 2026-10-23 | 阶段二 ①（视觉腿） | |
  | visual-regression.spec.ts | dashboard responsive on mobile viewport | ① 视觉基线待重生成 | 2026-10-23 | 阶段二 ①（视觉腿） | |
  | visual-regression.spec.ts | backtest responsive on tablet viewport | ① 视觉基线待重生成 | 2026-10-23 | 阶段二 ①（视觉腿） | |

- **阶段二 · ① 批（2026-11-10，无 Docker 起原生三服务栈；16 → 5 行）**：
  - **栈怎么起的（本机无 Docker，全部原生进程）**：真 PostgreSQL 16.15 `127.0.0.1:5432`，新建库 `tellurion_ui_e2e`（analysis-service 启动自动迁移 core 面；data-service 启动自动迁移 `market`/`ingest` 面）；`data-service :8081`（`tellurion-data` 仓 `cmd/dataservice`）；`analysis-service :8085`（core 仓 `cmd/analysis`，`CONFIG_PATH=<core>/config/analysis-service.yaml`，env：`DATABASE_HOST/PORT/USER/PASSWORD/DATABASE`、`AUTH_INSECURE=true`、`AUTH_INSECURE_EXPOSURE=loopback-published`、`RATE_LIMIT_PER_MINUTE=100000`、`DATA_SERVICE_URL=http://127.0.0.1:8081`、`RISK_SERVICE_RESOLVE_ENABLED=false`、`SERVER_HOST=127.0.0.1`）；`vite :5173`（`web` 下 `npm run dev`）。
    - 坑（下一个人会踩）：vite 5 在 Windows 只监听 `::1`，`curl 127.0.0.1:5173` 连不上、`localhost:5173` 才行；`RISK_SERVICE_RESOLVE_ENABLED=false` 是必须的——analysis 出厂 `risk_service.resolve_enabled=true`，取不到 risk 快照会**拒绝启动**；`:8081`/`:8085` 的 `/health` 与经 vite 代理的 `GET /api/strategies` 均实测 200。
  - **基线（临时去 16 条 fixme 的真栈复跑）**：**16 failed**，逐条读 Expected/Received 后分三档：11 条选择器/期望过期（本批清）、1 条缺真行情数据（留）、4 条视觉基线（留）。
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
  - **留下的 5 条（不洗绿）**：
    - `backtest-engine: backtest history shows completed jobs with correct data`：需要 600519.SH 的真 OHLCV。本机 PG **零行情行**（`market.ohlcv_daily_qfq` / `public.ohlcv_daily_qfq` / `ingest.raw` 实测均 0），`POST /api/backtest` 只能得 invalid，等不到 `.metrics-grid`。fixme 理由已改写为这条。
    - `visual-regression` 4 条：`--update-snapshots` 重生成 = 用新截图当真相（AUD-63 ⑥ 的另一腿，本单 ⑥ 亦不许），且当前库无行情数据，重生成只会把「空态页面」固化成基线。4 条 fixme 理由已改写为「须人工按 DESIGN.md 核对后重生成」。
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
  - **⑤④ 计数**：四条登记项的 fixme 与登记行已随 AUD-61 ① 批同笔删除；`e2e/tests` 现存 fixme 5 条（1 条缺真行情数据 + 4 条视觉基线），与 ① 批清 11 条的口径一致。
  - **边界守住**：`web/src` 两文件仅破坏验证期间临时改动且已逐字节还原（SHA256 复核）；未给其余 11 个文件铺 testid、未动 `playwright.config.ts` / `isolation.ts`、未重生成视觉基线。

---

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

## DATA-14 · 空列表编码成 `null` 而不是 `[]`（🟠 契约说谎，任何客户端都会踩）✅ 执行地已闭合（core，2026-10-24）· 本仓只留指针 · **已迁 core（2026-10-21，原号 DATA-04，SPEC-R-03 换号）**

> ⚠️ **状态订正（2026-10-26 实测）**：本行原写「⬜ 待做」，而执行地 core 的同名单早已闭合——
> `tellurion:docs/TASKS.md:2076` 的标题就是「DATA-14 · 空列表编码成 `null` 而不是 `[]`…… **✅（2026-10-24）**」。
> 两仓同一单两种状态，读 ui 台账的人会以为还有活要做。本仓**不重做、不回填正文**，只把指针的状态改成与执行地一致。

> **正文已整体迁至 `tellurion:docs/TASKS.md`「七、存量任务」`DATA-14`（原 DATA-04）**（ID 换号、六字段原样不改写；归属是 core 的 `cmd/data` + `pkg/storage`——原注「等那份文件空出来应把本节整体迁过去，本仓只留指针」即此）。执行与验收在彼处，此处不镜像；改动请去彼处改，勿在此回填正文。

## SPEC-R-02 · 五张无主表 owner 认领（不在本仓，本仓留指针）✅ 2026-10-21

> `users` 表唯一 owner = core（ADR-017 鉴权域，写者 `tellurion:pkg/auth/auth.go`）；本仓只经 `/api/auth` 只读消费。
> 正文与五表认领结论在 `tellurion:docs/TASKS.md` §九；本仓 `docs/db-schema.md` §1「鉴权 / 会话」行已同步表名。

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

## QT-61（ui 腿）· CI 基线归零——SchedulePanel flaky 用例 ✅ 完成（2026-10-21）

> 跨仓同号同单，完整四腿收口记录见 `tellurion:docs/TASKS.md` QT-61；此处只登记本仓腿。

- **要点（初判与破坏验证）**：该用例 4.9s 接近超时、疑似 flaky，给该文件 4 个 `describe` 传 `{ timeout: 15_000 }` 加时间余量（**不放宽任何断言**）；破坏验证：预算调到 1ms → `Test timed out in 1ms`，证明 timeout 真生效。
- **要点（首跑 CI 暴露真因）**：加 timeout 后跑到断言才发现是 **locale 依赖**（断言硬编码 `2026/10/15`，CI=en-US 渲染 `10/15/2026`）⇒ 改用组件同一 `toLocaleString` 现算期望（`1075c28`）；timeout 余量保留（双管齐下）。
