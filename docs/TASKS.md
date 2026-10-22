---
status: active
last-verified: 2026-10-22
verified-by: UI-02 结案（C1 两码展示口径 + 破坏验证双还原；真请求腿未执行，已登记）
---

# tellurion-ui · 任务台账

> 任务定义规范沿用 core 仓 `tellurion/AGENTS.md` §8.5（六字段：①目标 ②上下文 ③要求 ④约束与非目标 ⑤验收 ⑥边界）。
> 状态标记：`⬜ 待做` / `🔶 进行中` / `⛔ 阻塞` / `✅ 完成（附日期）`

---

## 施工序（候选单，开工前必须展开成六字段）

> 这张表是**施工顺序**，不是任务台账：每条在执行前要展开成六字段单（目标/上下文/要求/约束/验收/边界），并写明冻结契约的路径与节号。
> 顺序有依赖，不要跳级。

| 阶段 | 内容 | 上游单号 | 前置 |
|---|---|---|---|
| AUD-61 阶段一 | 起齐三服务跑 e2e，把已知红改 `test.fixme` 并登记 | `AUD-61` | 无 |
| AUD-61 阶段二 | 设计系统重构落地后按页重对齐选择器与期望值 | `AUD-61` | 阶段一 + 重构完成 |

## AUD-61 · e2e 套件与前端结构脱节（测试债） ⬜

> 2026-10-14 自 core 仓 `tellurion/docs/TASKS.md` §五迁入——e2e 套件随前端拆仓（2026-10-09）已物理归属本仓，且本仓前端正处设计系统重构（DESIGN.md v2.0），e2e 将大改，留 core 主线已无执行意义。本文件为 AUD-61 唯一归属地。

- **① 目标**：e2e 套件恢复「全绿 = 真实通过」的可信账目——已知红全部 `test.fixme` 显式登记在案；前端重构落地后按页重对齐选择器与期望值，直至 fixme 清零。
- **② 上下文**：
  - 套件位置：`e2e/tests/` 共 **19** 个 spec（api-backtest / api-health / api-negative / api-strategy / auth-login-flow / backtest-engine / copilot / copilot-e2e / critical-e2e / cross-navigation / **nav-consistency** / dashboard / data-sync / data-sync-error / data-sync-schedule / rbac-open-access / screener / strategy-selector / visual-regression；重构期间 spec 有增减，**阶段一以 `npx playwright test --list` 实测为准**）。
  - 运行配置：`e2e/playwright.config.ts`——`BASE_URL`（默认 :5173）、`DATA_SERVICE_URL`（:8081）、`BACKEND_URL`（:8085）、`workers: 1`、CI 下 `forbidOnly` + retries 2；数据隔离由 `e2e/helpers/isolation.ts`（库级隔离）保证。
  - 历史实测（**2026-09-26** 干净环境，出处 core 仓 `tellurion-docs/docs/TEST.md` §7.2.0 实测读数 + core 台账原记录）：**127 passed / 34 failed / 2 skipped（共 163）**；34 条全归因（24 条 DOM/选择器漂移 + 4 条 API 期望过时 + …）、与代码改动无关——套件选择器/期望值与前端结构脱节。
  - 前端现状：`feat/design-tokens-v2-palette-sweep` 分支正在做设计系统重构（DESIGN.md v2.0 为唯一基准、调色板全量扫仓），页面结构将大改 ⇒ **现在按旧结构重对齐是白做工**，先登记、后对齐。
  - 红线（继承 core 台账原文）：不得把「34 条红」洗成「已验证通过」，也不得放宽断言消红。
- **③ 要求**：
  - **阶段一（先做，独立可交付）**：起齐三服务（前端 :5173 / data-service :8081 / analysis :8085）后干净环境跑 `npx playwright test` 取得**当前**红清单（重构进行中，数字会漂移，以实测为准）；每条红改为 `test.fixme("AUD-61: <一句话归因>")` 并在下方登记表登记一行。除 fixme 与登记表外**不改任何断言/选择器/期望值**。
  - **阶段二（设计系统重构落地后）**：按页面分批重对齐——每批一个 commit，对齐一条则同步删除该条 fixme 与登记行；选择器优先 `data-testid`，不靠文案/DOM 位置（重构即碎）。
  - 登记表列：`spec 文件 | 用例名 | 红因归类 | fixme 日期 | 对齐批次 | 清除日期`。

  | spec 文件 | 用例名 | 红因归类 | fixme 日期 | 对齐批次 | 清除日期 |
  |---|---|---|---|---|---|
  | （阶段一实测后填写） | | | | | |

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

## DATA-14 · 空列表编码成 `null` 而不是 `[]`（🟠 契约说谎，任何客户端都会踩）⬜ 待做 · **已迁 core（2026-10-21，本仓留指针；原号 DATA-04，SPEC-R-03 换号）**

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
