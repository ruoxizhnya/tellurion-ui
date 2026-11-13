# 重构任务清单（TASKS）— Quant Lab UI

> **版本**: 1.0（2026-10-13；2026-11-12 订正台账关系与两处过期缺口，见文末「更新记录」）
> **定位**: 本文件是 **UX 重构（分组 A/B 与 G 缺口）** 的任务台账，装的是功能项；**跨仓 / 运维 / 台账一致性**类单子在主台账 [`../../TASKS.md`](../../TASKS.md) §一，两处**互不收录正文**。**主台账 §一 末尾只列本文件开放项的 ID（不搬正文），本文件不反向复制主账内容** —— 这样主账能看见开放项，又不产生两份会漂移的正文。判「本仓现在在做什么」只读主台账 §一 + 该开放项清单，再按需下钻本文件。每个任务用 **6 条可判定断言**描述（AGENTS.md §8.5.2 六字段的断言化：一条断言 = 一个可独立判真伪的事实，不是动作描述）。
> **依据**: [ANNOTATIONS.md](ANNOTATIONS.md)（逐控件处置）· [../user-flows.md](../user-flows.md) v1.1（需求基线）· [obsidian_precision_quant/DESIGN.md](obsidian_precision_quant/DESIGN.md) v2.0（token 真相源）· [ODR-066](../../../../tellurion-docs/docs/archive/odr/odr-066-stitch-design-review-and-boundary-ruling.md)（裁决）
> **不双写**: 本清单**不**复制进 core 仓 `tellurion/docs/TASKS.md`。core 侧只登记后端缺口（G1–G8）自己的修复任务。

---

## 图例

| 标记 | 含义 |
|---|---|
| 🟢 **可做** | 依赖端点全部存在（`core` openapi / `sync` `/api/sync/*`），无契约冲突 |
| 🟡 **部分** | 主体可做，个别控件依赖缺失端点 → 该控件画 disabled + "待后端" |
| 🔴 **延后** | 依赖 `ai-service`（:8086）或 G1–G6 后端缺口。**主任裁决 2026-10-13：后端会做但目前没有 ⇒ 相应前端先不做，挂计划** |

**断言的用法**：任务完成 = 6 条断言全部为真且**有取证方式**。任一为假则任务未完成，不得标 done。

---

# 分组 A · 🟢 立即可做（不依赖 ai-service）

## A-01 旧调色板扫页：`BacktestCompare.vue`（8 处）　✅ **已完成 2026-10-13**

| # | 断言 | 取证 |
|---|---|---|
| 1 | 该文件内 `#58a6ff / #f97583 / #85e89d / #ffab70 / #b392f0 / #79b8ff / #ff7b72 / #e1e4e8 / rgba(133,…)` 出现次数为 **0** | `grep -c` = 0 ✅ |
| 2 | 其颜色全部来自 `@/styles/palette` 的 `chartPalette` 或 `--q-*` CSS 变量，二者之一可在源码内被 grep 证明 | 系列色 `chartPalette.seriesCycle`；网格/刻度/图例 `chartPalette.grid/tick/legend/axisTitle`；高亮底 `var(--q-success-soft)` ✅ |
| 3 | `npm run typecheck` 退出码 0，`npm test` 全绿 | 0 错；**257 passed / 21 files** ✅ |
| 4 | 该页 canvas 像素采样中，旧主色 `rgb(88,166,255)` 计数为 **0**，新主色 `rgb(180,197,255)` 计数 **> 0** | 实测 3 条序列 `894 / 838 / 836` px，旧主色 `0` px ✅ |
| 5 | visual 基线已显式重生成（**不是删断言、不是放宽阈值**），diff 只含颜色变化 | ➖ **N/A**（原判"待办"是标错）：`compare` 不在 `visual-regression.spec.ts-snapshots/` 的 12 张基线内，该 spec 也无对应用例 ⇒ **无基线可重生成** |
| 6 | 本任务 diff 内不含逻辑/接口改动 | 纯颜色与配置项替换，无 API/类型变更 ✅ |

**扫页时撞出的新断言（已并入 A-02 / A-03，勿再漏）**

> **7. 该页图表不得残留 Chart.js 库默认色。** 取证方式：canvas 采样中 `rgb(102,102,102)`（默认 tick 色 `#666`）计数须 **≤ 若干像素级噪声**，不得是画布上占比最高的颜色。
> 起因：`BacktestCompare` 原先只设了 `legend/tooltip`，**`scales` 的 grid 与 ticks 完全没设色**，用的是库默认 `#666` —— 它在旧底色上勉强能看，在新 `#090a0c` 上只有约 3.3:1。扫页第一轮我只换了系列色就以为完成，是像素采样把 `102,102,102` 以 1397 px 排到第一位才暴露的。**"grep 到 0 命中"不等于"主题化完成"** —— 库默认值是第三类颜色来源。补完后实测该色 `1397 px → 1 px`，网格转为 `#2a3449`（5706 px）。

**取证纪律补记**：断言 5 一开始被我标成"⏳ 待办"，实际是 **N/A** —— 写台账时我默认了"每页都有 visual 基线"，没去数。基线只有 12 张（`ai-evolution / ai-factor-lab / ai-strategy-workshop / backtest / backtest-form / backtest-tablet / dashboard / dashboard-metric-card / dashboard-mobile / dashboard-sidebar / data-sync / stock-screener`），**不含 compare 与 login**。**"没有基线"和"基线待更新"是两件不同的事**，混标会让 A-03 的收尾判断出错。

## A-02 旧调色板扫页：`Login.vue`（7 处）　✅ **已完成 2026-10-13**

| # | 断言 | 取证 |
|---|---|---|
| 1 | 旧调色板 hex（`#58a6ff/#0d1117/#161b22/#30363d/#e6edf3/#8b949e`）出现次数为 0 | `grep -c` = 0 ✅ |
| 2 | 登录页渲染结果与扫页前**逐节点一致**（只换色，不增减 DOM） | `git diff` 14+/9-；非颜色改动只有两件事：**删掉图标上的 `color="#58a6ff"` 呈现属性** + **新增一条 `.login-brand svg` CSS 规则**。DOM 节点零增减 ✅ |
| 3 | 表单文字与背景对比度 ≥4.5:1 | 该页取色对为 `--q-text` / `--q-text2` 压 `--q-surface`，即 **14.04:1 / 10.68:1**，由 `palette.test.ts` 不变量守；另机械核验该页 8 个 `var(--q-*)` 引用**全部有定义**（见 A-02 附注） ✅ |
| 4 | `/login?redirect=/screener` 重定向防护行为不变 | ⚠️ **部分取证**：`auth-login-flow.spec.ts` 3 条中 **1 passed / 2 skipped** —— skip 原因是运行中的栈是开放访问（`auth_enabled:false`），authGuard 把 `/login` 弹回 `/`（**这是 ADR-026 的正确行为，不是退化**）。重定向参数逻辑的实际覆盖在 `src/router/authGuard.test.ts`（含 `/screener` 用例），已随 257 条单测通过。要跑那 2 条 e2e 需给 analysis-service 配 `JWT_SECRET` 重启，**未擅自改运行栈** |
| 5 | typecheck / test / build 三项全绿 | 0 错 / **257 passed** / build 成功；`palette.test.ts`、`palette.ts`、`App.vue` 三文件 `eslint` **0 warning**（Login 的 3 条 warning 在 129/208/219 行，均为存量属性换行风格，非本次改动行） ✅ |
| 6 | visual 基线重生成且 diff 仅颜色 | ➖ **N/A**：12 张基线不含 login，spec 内 `grep -i login` = 0 命中 |
| 7 | 图表库默认色 | ➖ **N/A**：该页无 canvas（`grep -c canvas\|new Chart` = 0） |

**A-02 附注：图标颜色为什么不能写 `color="var(--q-primary)"`**
SVG 呈现属性**不解析 CSS 自定义属性**，直接把 `var()` 塞进 `color` 属性会得到无效值、图标静默回落到继承色。正确做法是删掉属性、用 CSS 规则 `.login-brand svg { color: var(--q-primary) }` 让 `currentColor` 生效。这条坑对 A-03 的 `NavTiles.vue`（5 处图标色）同样适用。

**A-02 的额外产出：把"引用是否解析得到"升级成全仓机器守卫**
本条取证过程中发现逐页人眼检查不可持续，于是在 `palette.test.ts` 新增 `CSS 变量引用完整性` 两组断言（悬空引用 + 旧值兜底），并配 **棘轮基线**（集合相等 ⇒ 新增欠债红、偷偷修好不记账也红）。**破坏验证已做**：临时注入一条悬空引用 + 一条兜底写法 → 两组断言同时红；还原后 35/35 绿，`git diff` 证明 `global.css` 与 HEAD 字节一致。

守卫上线即抓到 **6 条存量悬空引用**（见 A-03 工作清单）—— 这类缺陷此前不可见，因为浏览器对未知 `var()` 的处理是静默失效，不报错。

## A-03 旧调色板扫页：`NavTiles.vue`(5) · `EmergencyFlatten.vue`(4) · `StrategyBuilder.vue`(4) · `BacktestHistory.vue`(4) · `Alerts.vue`(1) · `DataSourcePanel.vue`(1) · `AppHeader.vue`(1) · `AppSidebar.vue`(1)

1. 全仓 `grep -rE "#58a6ff|#3fb950|#f85149|#8b949e|#21262d|#484f58|#e6edf3|#30363d" web/src --include=*.vue --include=*.ts` 结果为**空**（`palette.test.ts` 的废弃值清单除外）。
2. `dist/assets/*.js` 内旧主色 `#58a6ff` 出现次数为 **0**（当前基线：4）。
3. `EmergencyFlatten.vue` 的紧急平仓仍满足 F16：红色 + 二次确认 + 独立确认码，三者缺一即断言为假。
4. `AppSidebar.vue` 的 9 项导航标签与 A-04 定稿的一套标签**逐字相同**。
5. typecheck / test / build 全绿；visual 基线**仅对 12 张既有快照**重生成（`backtest*` / `dashboard*` / `data-sync` / `stock-screener` / `ai-*`），diff 仅颜色。
6. 扫页**不得为变绿而放宽** `palette.test.ts` 的两组棘轮基线；每修好一条悬空引用或兜底写法，**必须同步删掉对应条目**（不删会让断言红 —— 这是刻意的双向记账要求）。
7. **（承 A-01 第 7 条）** `grep -rn "new Chart(" web/src` 列出的**每一处**都要检查 `scales.grid/ticks` 与 `plugins.legend.labels.color` 是否显式设色；canvas 采样中库默认色 `rgb(102,102,102)` 不得占高占比。
8. **`rgba()` 形式的旧调色板与 `palette.test.ts` 的 `RETIRED_RGBA_BASELINE` 集合相等，且该基线为空。** 取证方式：`npx vitest run src/styles/palette.test.ts` 该条断言绿 —— 它把废弃 hex 表转成 RGB 三元组后匹配任意 `rgba?(r,g,b,…)`，**不依赖人记得去 grep**。破坏验证已做双向：注入 `rgba(31,111,235,.5)` 与 `rgb(88,166,255)` → 红；删掉一条基线却不改代码 → 红；还原后 36/36 绿。

### A-03 取证结果　✅ **已完成 2026-10-14**（断言 4 除外，见下）

| # | 取证 |
|---|---|
| 1 | 废弃 hex 表扩到 **33 条**（扫页时新登 `#f78166`/`#ffa657`/`#db61a2` —— `#f78166` 是 NavTiles 的策略实验室磁贴色，**原清单根本没覆盖它**，说明"按清单 grep"本身不完整）。扩表后全仓命中 **0 行**（含注释；`variables.css` 里那处提及旧值的注释已改为引用 §0.1） ✅ |
| 2 | `npm run build` 后 `dist/assets/*.js` 内 `58a6ff` 计数 **4 → 0** ✅。全量扫 dist：唯一残留是 `d03050:1`，上下文实测为 **Naive UI 自带的 light-theme 内部常量**（`errorHover:"#de576d",errorDefault:"#d03050",…`），不在我们的 darkTheme+overrides 路径上 —— 不是欠债 |
| 3 | 浏览器 computed style 实测：`border-left: 3px rgb(239,68,68)` = `--q-danger`、图标 `rgb(239,68,68)`、`strong` 文字 `rgb(248,113,113)` = `--q-danger-text`、卡片边界 `rgb(90,96,112)` = `--q-border`。F16 三要件（红色 / 二次确认 / 独立确认码）未被颜色改动削弱 ✅。**未点真按钮**（Kill Switch 是危险操作，armed 态的 `--q-danger-soft` 只做了 token 解析核验） |
| 4 | ➖ **不适用（依赖未完成的 A-04）**：侧栏当前实测 **12 项**（`/`、`/backtest`、`/backtest/compare`、`/screener`、`/copilot`、`/explore`、`/strategy-lab`、`/strategy-builder`、`/data-sync`、`/evidence`、`/factors`、`/alerts`），而"定稿的 9 项标签集"要 A-04 才存在。本条留待 A-04 一并收口，**不在此处判真** |
| 5 | typecheck 0 错 / **258 passed (21 files)** / build ✅；12 张 visual 基线**全部显式重生成**（未删断言、未放宽阈值）。**但只有 10/12 可复现**，根因见下"重生成时撞出的三个存量测试缺陷" |
| 6 | 三组棘轮基线**全部收缩为空数组**（悬空 6→0、兜底 8→0、rgba 7→0），且是**集合相等**断言 ⇒ 从此这三类静默失败是永久门禁。`DANGLING_BASELINE: string[] = []` 等三处注释记录了清零时点 ✅ |
| 7 | `grep -rln "new Chart("` 全仓只有 3 处（`EquityChart` / `useBacktestChart` / `BacktestCompare`），均为 A-01 已主题化文件；三处 `chartPalette` 显式设色计数 6/3/5，A-03 未新增图表 ✅ |
| 8 | `RETIRED_RGBA_BASELINE = []` 且断言绿 ⇒ 7 处全部清零 ✅。alpha **逐条重算**（合成后 ΔL 相等）而非照搬：过程与结果记在 DESIGN.md §0.2.2 |

**扫页时撞出的三个"看不见"缺陷（都是真缺陷，不是风格问题）**

> **9. scoped 样式对 `h()` 创建的 VNode 不生效 —— 整条规则静默失效。** `NavTiles.vue` 的 `.tile-icon { font-size: 24px; color: var(--accent) }` **从来没生效过**：`tile.icon` 是 setup 里 `h(NIcon, …)` 造出来的，拿不到本组件的 `data-v-*` 属性，而 scoped CSS 编译成 `.tile-icon[data-v-*]`。实测图标色是继承的 `--q-text`、字号也不是 24px。**这条缺陷早于本次扫页**（旧代码写 hex 时同样是死规则），改 token 只是让它显形。修法：`.nav-tile :deep(.tile-icon)`。修后实测 5 枚图标分别解析为 `#b4c5ff / #7fb0b8 / #d9b98a / #d0bcff / #9aa7d6` ✅
>
> **10. `class-name` 不是 NIcon 的 prop，会被当成字面 HTML 属性落进 DOM。** 我第一次把侧栏图标色改成 CSS 变量时写 `<n-icon class-name="brand-icon">`，结果 DOM 里是 `class-name="brand-icon"` 而 `class="n-icon"` —— 规则永不匹配，且**不报任何错**。是 computed style 查不到该元素才暴露的。正确写法：`class="brand-icon"`（Vue 会合并到组件根，且模板内的元素拿得到 scope 属性）。
>
> 这两条合起来的教训：**颜色改动的验收不能只看 grep，必须看渲染结果。** 断言 1/2/8 全是静态的，三个缺陷里有两个静态断言永远抓不到。

**重生成基线时撞出的三个存量测试缺陷**

| # | 症状 | 根因（实测） | 处置 |
|---|---|---|---|
| V-1 | 12 张基线里 5 张**刚生成完立刻重跑就红**，diff 图唯一差异像素在页头时间 | `AppHeader` 有 `setInterval(updateClock, 1000)`，全页快照把秒级时钟烙进基线 | ✅ **已修**：`beforeEach` 里 `page.clock.setFixedTime(2026-05-06T10:30:00)`。**用 setFixedTime 不用 clock.install** —— 后者会冻结待触发的 setTimeout，把依赖轮询的页面打成空态（那是为了变绿而破坏被测行为）。响应式两例自造 context，拿不到 `beforeEach({ page })` 的注入，必须各自调用（第一版就漏在这里，基线里烙进了 `00:28:42`） |
| V-2 | `backtest-tablet` 偶发：基线有"20 条记录"，实跑渲染"暂无回测历史" | 测试用 `waitForTimeout(500)` **盲等**，异步历史在慢的那次没落地就截图 | ⏳ 待办：改成等终态（`条记录` 或 `暂无回测历史` 二选一出现），别加延时 |
| V-3 | `data-sync` 不可复现 | 该页渲染的是**活的后台状态**：作业 ID 带纳秒时间戳（`ohlcv_all_aud49_17919266933509689000`）、近期任务列表随状态变、数据源限流告警"请求过于频繁"时有时无 | ⏳ 待办：要么 mask 掉同步状态卡 + 告警条，要么给视觉测试一套 fixture 后端。**这是测试设计决策，不在扫页里顺手改** |

**顺带生效的一处**：`--q-warning` 从"零消费"变为 **1 处真实消费**（`StrategyBuilder` 权重校验的 `.weight-summary.invalid` → `var(--q-warning)` + `--q-warning-soft`）。**这不等于 A-07 完成** —— A-07 要的是 K9 运行结果的 `invalid` 态三处同口径，那里仍是 0。DESIGN.md §0.1 的措辞已按"色值修正 + 语义预留"如实改写。

### A-03 工作清单（历史）：守卫上线时抓到的 6 条存量悬空引用 —— ✅ 已全部清零

这些是**真缺陷**，不是风格问题：组件引用了从未定义的变量，浏览器对未知 `var()` **静默失效不报错**，所以此前没人看见。逐条要么改用已有 token，要么在 DESIGN.md 正式立该 token 后再定义进 `variables.css`。

| # | 悬空 token | 位置 | 判断要点 |
|---|---|---|---|
| 1 | `--q-radius-md` | `components/dashboard/NavTiles.vue` | 大概率想要 `--q-radius`(8px) 或 `--q-radius-sm`(4px)，**先读上下文再定**，不要猜 |
| 2 | `--q-text-muted` | `components/paper/EmergencyFlatten.vue` | 语义即 `--q-text3`；该处还带 `#888` 兜底 ⇒ 实际一直在吃兜底值 |
| 3 | `--q-text-muted` | `pages/Alerts.vue` | 同上 |
| 4 | `--q-surface-muted` | `pages/Alerts.vue` | 疑似想要次级背景 ⇒ `--q-surface2`？读上下文定 |
| 5 | `--q-card-bg2` | `pages/StrategyBuilder.vue` | 同上；若确需"卡片次级底"则**先回 DESIGN.md 立 token** |
| 6 | `--q-divider` | `pages/StrategyBuilder.vue` | 语义即 `--q-border-light`（装饰 hairline） |

另有 **8 处 `var(--q-x, 旧值)` 兜底写法**（`EmergencyFlatten` 2 / `Alerts` 3 / `StrategyBuilder` 3）：兜底永不生效（变量总有定义），却把旧调色板留在仓库里 —— 一并删。

### A-03 工作清单补录（历史）：**7 处 `rgba()` 形式的旧色** —— ✅ 已全部清零（2026-10-13 审查时抓到，第 8 条断言守）

这是我自己的扫页判据留下的盲点：**前两条断言只按 hex 抓，而半透明旧色一个 hex 都不含**。最严重的正是**每页都渲染**的侧栏激活态。清单由脚本枚举 `src` 得到（我第一版手抄 grep 成 6 条，实际 7 条，漏了 `EmergencyFlatten` —— 所以清单本身也必须机器生成）。

| # | 位置 | 现值 | 换成 |
|---|---|---|---|
| 1 | `components/layout/AppSidebar.vue` | `rgba(88,166,255,0.12)` 激活态底 | `var(--q-primary)` 的低透明底（新主色 `#b4c5ff` 同透明度）—— **每页都渲染，优先级最高** |
| 2 | `components/layout/AppSidebar.vue` | `rgba(88,166,255,0.2)` 激活态 hover/边框 | 同上 |
| 3 | `pages/StrategyBuilder.vue` | `rgba(88, 166, 255, 0.06)` | 同 |
| 4 | `pages/StrategyBuilder.vue` | `rgba(133, 232, 157, 0.08)`（旧 success 半透明） | `--q-success` 半透明 |
| 5 | `components/backtest/BacktestHistory.vue` | `rgba(63, 185, 80, 0.04)`（旧 success） | `--q-success-soft` 语义 |
| 6 | `components/backtest/BacktestHistory.vue` | `rgba(248, 81, 73, 0.04)`（旧 danger） | `--q-danger` 半透明 |
| 7 | `components/paper/EmergencyFlatten.vue` | `rgba(245, 108, 108, 0.04)`（Naive danger 色半透明） | 同 |

> 这 7 处**不宜简单替换成 `rgba(新hex, a)`**：新主色 `#b4c5ff` 明度远高于旧 `#58a6ff`，沿用 0.12 透明度会得到明显更亮的底。A-03 执行时**逐条重算透明度**，用 canvas/像素采样复核对比度，别机械照搬 alpha。

## A-04 侧栏与顶栏统一（ANNOTATIONS §13 第 1–2 项）

🔶 **部分完成** —— 断言 1/3/4/6/7 于 2026-10-14 收口；**断言 5 于 2026-11-12 收口**（`319004c` 命令面板 + `a540f65` 输入锚点修复，角标接 G1 读面）；**2/8 仍是主任 2026-10-14 裁决的暂缓项**（理由见取证表末）。

### A-04 取证结果

| # | 状态 | 取证 |
|---|---|---|
| 1 | ✅ | `e2e/tests/nav-consistency.spec.ts` 遍历 12 条路由比对 `.nav-item .nav-label` 数组，逐字相同。首跑即暴露本测试自己的缺陷：`goto` 后直接读会拿到 **0 个**（Vue 尚未渲染），改成等条件 `expect(locator).not.toHaveCount(0)` —— 不是加延时 |
| 2 | ✅ **已拍板 2026-10-14：暂不收敛**（主任裁决："等 F11/A-06 落地后再动"）。§3.2 的树实际有 **15 个条目**，而 ANNOTATIONS §13-1 写"9 项一套标签" —— 两个数对不上，"9 项"没有权威清单；且收敛必然摘掉 3 个入口，其归宿（F11 三库合一、A-06 证据内嵌）都还没做，现在摘就是孤儿路由。**在此之前侧栏保持 12 项** |
| 3 | ✅ | 5 个漂移别名作为**标签**出现 0 次（`nav-labels.test.ts` 断言；注释里列举历史别名不算，见该测试的匹配范围）。顺带发现标签其实散在**四处**：侧栏 label、路由 `meta.title`、页面 H1/卡片标题、**首页磁贴标题**（`因子选股 / 策略实验室 / AI Copilot` 与侧栏三套叫法）—— 已全部收敛到 §3.2 词表，并由 `nav-labels.test.ts` 7 条断言钉住（含"磁贴标题须与侧栏同源"，破坏验证：把磁贴改回 `因子选股` 即红） |
| 4 | ✅ | `components/layout/` 内 `\bSSE\b / L2 / probe\/h / iter\/h / HERMES / QUEUE` 命中 0；e2e 有一条顶栏文字断言。注：`stores/sync.ts` 里的 SSE 是**单作业进度流**，A-08 断言 4 明确允许，不在此禁 |
| 5 | ✅ **2026-11-12 收口** | `⌘K` 命令面板已落地（`319004c`；`e2e/tests/command-palette.spec.ts` 5 条，含过滤 + Enter 跳转 + Esc 关闭）；"待审阅 N"接 core `GET /api/review/pending`（G1，`openapi.yaml:3331`），**`pending === null`（任一源不可用）显示「—」，绝不画恒 0 的假数**；角标两条断言在 `command-palette.spec.ts` 与 `review-desk.spec.ts` |
| 6 | ✅ | 键盘 Tab 实测：焦点环计算值 `solid 2px rgb(180, 197, 255)` = `--q-focus`，压画布 **11.67:1**（≥3:1）。**排查过程本身是个教训**：先用 `el.focus()` 程序化聚焦测，读到的是 `3px currentColor`，一度以为规则没生效 —— `:focus-visible` 按**交互方式**判定，程序化聚焦不触发；且 `.nav-item` 上有 `transition: all`，`outline-color/width` 可动画、`outline-style` 离散，聚焦瞬间读到的是动画起点。最终用真键盘事件 + `expect.poll` 等条件才测对，写进 e2e 而不是靠一次性手工探针 |
| 7 | ✅ | 侧栏 Redis/Postgres 常绿点**已删除**（含 `.sys-dot` 三条规则）。裁决依据：`/api/health` 实测只返回 `{service,status,timestamp}`，**没有 redis/postgres 分项**；接真值要后端加字段 = 前端驱动后端设计，违反主任 2026-10-13 的边界裁决 ⇒ 按断言 7 的第二选项删掉，不留常绿点 |
| 8 |  **随断言 2 挂起**（触发条件已明确：F11 + A-06 落地） | 2026-11-12 实测侧栏 **15 项**（分组：总览 1 / 研究主线 3 / 仪器房 8 / 监控 3）；比原文的 12 项新增 A-09 纸交易、A-10 合规 + 系统管理、B-02 审阅台。归并到 9 项的决定**未变**（仍待主任拍板） |

**顺带修掉的一个真 bug**：旧 `isActive` 用 `route.path.startsWith(item.path)`，在 `/backtest/compare` 上「回测引擎」与「多策略对比」**同时高亮**（后者是前者的字符串前缀）。改为最长匹配。破坏验证：把模板退回旧判定 → e2e 断言在 `/backtest/compare` 报 `Expected: 1, Received: 2`，还原后 4/4 绿。

**9 项提案（主任 2026-10-14 裁决：❌ 暂不执行，等 F11 / A-06 落地后再动）**：`控制台 · 探索观察 · 回测引擎 · 多策略对比 · 策略库 · 因子研究 · 选股与市场 · 数据管理 · 风险告警`。摘除的 3 项去向：策略编辑器 + 策略 Copilot → 策略库（F11）；证据质问 → 数字旁内嵌侧滑（A-06），路由保留作深链兜底。**在此之前侧栏保持 12 项**（标签已统一，条目数不动）。

**改名连带打破的 e2e（已一并修）**：`选股器 / 数据同步 / 策略实验室 / 因子证据 / 探索观察台 / 证据查询` 在 6 个 spec 里被当文案选择器用，改名即断。导航点击一律改 `[data-nav-path="/xxx"]`（新加的稳定钩子），文字断言改新标签。**这正是 AUD-61 记的那笔债的现场复现** —— 靠文案的选择器重构即碎。

**未修的 7 条红**（`dashboard.spec.ts` ×5 / `cross-navigation.spec.ts` ×1 / `strategy-selector.spec.ts` ×1）：实测均为**存量结构脱节**，与本次改动无关 —— 例：断言侧栏 5 项（实际 12）、磁贴 4 枚（实际 5）、等 `.metric-card`（该 class 只在 `BacktestCompare.vue` 存在，Dashboard 根本没有）、点 `.nav-tile` 的 `因子分析`（**从未存在过**）。归 **AUD-61** 阶段一登记，不在本任务顺手改。

1. 12 个页面渲染出的侧栏条目集合完全相同，可用一条 Playwright 断言遍历全部路由比对 `nav` 文本数组。
2. 条目集合等于 `user-flows.md` §3.2 目标 IA 的 9 项，**含"数据管道 Data Sync"**（当前 `review_desk` 稿缺它）。
3. 标签只有一套：不存在 `回测分析 / 探索观测 / 因子工厂 / 全市场选股 / 数据通道` 这 5 个漂移别名（grep 全仓为 0）。
4. 顶栏不再出现 `SSE`、`L2`、`probe/h`、`iter/h` 字样（ODR-066 B3 判删项），grep 为 0。
5. 顶栏保留 `⌘K` 入口与"待审阅 N"计数，二者各有对应测试。
6. 键盘 Tab 顺序与视觉顺序一致（skill 检查项 `keyboard-nav`），焦点环使用 `--q-focus` 且 ≥3:1。
7. **侧栏底部的 Redis / Postgres 状态点必须反映真实健康**（A-03 复查时抓到的**谎报**，2026-10-14）。当前 `AppSidebar.vue:25,29` 把两处都写死成 `class="sys-dot online"`，`.sys-dot.offline` 那条规则**永不匹配** —— 于是界面恒久宣称两个基础设施在线，而它并没有查过任何东西。这违反愿景原则 4（每个数字可被当场质问），与本仓已删的"谎言兜底文案"同类。**做法二选一并说明理由**：接真实健康（`AppHeader` 已有 `apiOnline` 先例；`store.dataSourceHealth` 亦已在数据页使用），或**删掉这两行**不显示。禁止保留常绿点。
8. 侧栏条目数与 A-04 断言 2 的 9 项集合同时成立：当前实测 **12 项**（多出的 `/backtest/compare`、`/evidence`、`/factors` 三项按 ANNOTATIONS §13 归并），归并后每项标签与 §3.2 逐字相同。

## A-05 六维验证器组件（F5，横切）

1. 组件渲染的维度条目数恒为 **6**（统计/经济/稳健/偏差/冗余/因果），不是 5。
2. 任一维度 `unassessed` 时渲染文字"未评估"，且该用例存在一条断言：**若实现把 unassessed 折叠或省略，测试必须红**（F5 验收原文）。
3. `probability` 显示值等于**已评估维度的最小值**，且有单用例用非最小值输入验证其不取平均、不取最大。
4. 最弱一环维度被高亮，高亮是**非颜色单义**的（同时有文字标注），满足无障碍"颜色不是唯一线索"。
5. 失败的尝试（无回测结果）**不渲染裁决**，不出现 0 分或"未通过"。
6. 组件内不出现 `VALIDATED / VERIFIED / 校验通过 / 未通过` 四个词（S1 二值违例），grep 为 0。

## A-05 六维验证器组件（F5，横切）　✅ **已完成 2026-10-14**（含浏览器真实数据实测，证据见下）

落点：`web/src/components/validation/VerdictPanel.vue` + `VerdictPanel.test.ts`（23 条），
`Explore.vue` 原来内联的裁决渲染整段换成该组件（Explore 的 102 条 lint warning 降到 81，
未新增 error）。规范六维顺序由 `api/explore.ts` 的 `DIMENSION_ORDER` 固定。

| # | 断言 | 取证 |
|---|---|---|
| 1 | 维度条目数恒为 6 | 三条用例：六维齐全 → 6 行；**后端只给 5 维 → 仍 6 行**，缺的那行显示"未评估"；标签顺序等于 `DIMENSION_ORDER` 而非对象键序。**另加一条防"只渲染白名单"**：喂入第七维 `liquidity` 必须渲染成第 7 行 —— 否则将来后端加维度会静默不见 |
| 2 | `unassessed` 显示"未评估"，折叠即红 | 三条用例 + **破坏验证已做**：把实现改成"只渲染有数值的维度" → **4 条测试红**（断言 1 的"5 维仍 6 行" + 断言 2 的全部三条），还原后 19/19 绿。核心那条不查样式，查的是**每一维都必须携带可质问的结论**（数值或"未评估"），留空或整行省略都红 |
| 3 | `probability` = 已评估维度的最小值 | 用例故意把 `verdict.probability` 设成 0.9（≈最大）、`geometric_mean` 设成 0.68，断言屏幕显示 **0.42**（真最小值）。**综合概率由屏幕上的六个数当场算出，不读后端聚合字段** —— 理由是可质问性（原则 4）：显示一个来路不同的聚合值，它就成了不能质问的数字。**破坏验证**：改成读 `verdict.probability` → 3 条红，报 `expected '0.90' to be '0.42'` 与 `expected '0.00' to be '无已评估维度'` |
| 4 | 最弱一环高亮非颜色单义 | 最弱行带文字标注"最弱一环"，且**只有一行**有它；另有一条用例喂入指错的 `weakest:'statistical'`，断言组件仍按数值标出 `economic` —— 最弱一环同样从数里推，不采信聚合字段 |
| 5 | 失败的尝试不渲染裁决 | `verdict:null` → 概率元素与维度列表**都不存在**，只有"没有可被证伪的东西"，且全文 `not.toMatch(/0\.00|\d+%/)`（不出现 0 分）。一维都没评估时显示"无已评估维度"而不是 0.00 —— 0 会被读成"零可信"，那是另一种谎报 |
| 6 | 四个二值措辞为 0 | 两条用例：组件**源码**内 `VALIDATED / VERIFIED / 校验通过 / 未通过` 命中 0；**渲染出的文本**里也为 0（措辞可能来自拼接） |

**两处契约判断（写下来以免被当成随手改的）**

1. **`unassessed` 有否决权**：一维若被列为未评估，即使 `dimensions` 里混进了数也不显示它，也不参与最小值。契约上二者不该同时出现；真冲突时只能往"没查"那侧失败安全 —— 把一个未评估维度标成概率，等于替 AI 编造可信度。有用例专门喂这个矛盾输入。
2. **F5 的其余契约一并落地**：因果维显示机制 + `可证伪预测 N 条 · 应验 · 被证伪`（"讲得出但验不了的不算数"）；质疑按 `blocking / warning / note` 分组并带条数，**阻断级排最前**（不按后端数组顺序，避免被 note 埋掉）；无质疑条目时如实写"本轮没有提出质疑条目"，不留白。
3. **配色走概率性通道**：整块用 `--q-ai-text` 且带"AI 评估"文字标注 —— DESIGN.md §3 硬规则，颜色不是唯一线索。

**浏览器真实数据实测已补做（2026-10-14，本地栈全绿后）**

栈：原生 PostgreSQL 17.5（`quant_trading`，5908 stocks / 3,926,510 根日线）+ Redis 7.4.11 +
容器 data/strategy/analysis/ai 四服务 `local-stack.sh status` 全 healthy，Vite :5173。
在 `/explore` 用「做一个动量策略 / 最多试 2 次」真跑了一轮（run `c46fa2ad`），
两次尝试都成功落库并带裁决（`experiments` id 1117/1118），页面渲染的就是那份 JSON。

屏幕上逐项核对通过（不是测试跑绿，是人看见）：

| 断言 | 实测到的真数据表现 |
|---|---|
| 1 六行 | 统计/经济/稳健/偏差/冗余/因果 六行齐全，顺序正确 |
| 2 未评估 | 后端 `unassessed` 给了 4 维 → 屏幕上 4 个「未评估」+ 一行「4 个维度未评估 —— 未评估不等于没问题」 |
| 3 最小值 | `dimensions={bias:0.1304, robustness:0}` → 综合概率 **0.00**；结果流上的 chip 同为 `P 0.00`，**两处同一个数**（这正是审查轮抽公共函数要保的东西） |
| 4 最弱一环 | 「最弱一环」标在 稳健 那一行（0 < 0.13），文字标注而非仅颜色 |
| 5 失败无裁决 | 同一轮里 `b7ddde81` run 的尝试全部 `failed`（YAML 非表达式被拒），页面显示「这一条没有裁决 —— 失败的尝试没有可被证伪的东西」，没有 0 分 |
| 6 无二值措辞 | 全文无「校验通过 / 未通过」 |
| 质疑分级 | 阻断级（2）排在备注（6）前面，每条带维度标签 |

**实测抓出并当场修掉的三个前端缺陷**（各一个 commit，破坏验证已做）：

1. **一次 429 永久打死观察循环** —— 页面 1 秒一跳，把 analysis-service 每人 100 次/分钟
   的预算吃掉 60 次，实测约 3 分钟后弹「请求过于频繁」，而 catch 里跟着 `stopTimer()`：
   窗口从此冻在最后一帧。改 `POLL_MS=2500` + 连续 6 次失败才认断线，停下时明说
   "屏幕上的是最后一次成功拿到的进展"。护栏：`MAX_POLL_FAILS` 调回 1 → e2e 红。
2. **模型写的 markdown 星号直接上屏**（`股票池按**今天**的上市名单取`）。切片段渲染，
   **不走 v-html**；护栏：换成 v-html → "消息里的 HTML 只是字" 那条红。
3. 说明句源码换行被折成空格（"最弱的 那一环"）。

新增 `e2e/tests/explore-verdict.spec.ts`（3 条，fixture 逐字段抄自真实落库的 verdict）
把上面这份现场钉成回归；`/explore` 仍不在 12 张 visual 基线内。

**实测同时暴露的后端问题（前端不动它们，按"前端不干预后端设计"登记待裁决）**：

- **探索主链路只能产出无效回测**：两次尝试的回测都是
  `universe_max_size=0 / zero_trades / garbage_metric` → `Status=invalid`，
  也就是 `/explore` 现在**只能产出无效回测**，六维里四维因此永远未评估。
  这不是渲染问题，是探索主链路拿不到有效结果 —— 归 G 组后端缺口（OBS-01，
  core 仓已跟踪；根因与本轮补的机制更正见 core 仓 `docs/TASKS.md` §八）。
  ⚠️ **登记时我犯过一个错，留在这里以免被当成没自查**：裁决里那句
  「股票池按**今天**的上市名单取（0 只）」我第一反应当成引擎量出来的票池规模，
  逐字读码后确认那个 `0` 是 `PoolSize` 的 **Go 零值**（探索链路只设 `PoolSource`
  不设 `PoolSize`），它和 `universe_max_size=0` 只是碰巧同为 0。
  **一个显示出来却没人量过的数字**本身就是缺陷，core 侧已另立 OBS-01-R1。
- **限流豁免表要不要纳入状态轮询**：**已裁决：不进**。`IsRateLimitExempt` 是
  **逐字相等**匹配（明写不做前缀匹配，因为前缀会让 `/api/auth/status/../login`
  这类写法绕过限流），而这条路径带 run_id 动态段，逐字表**永远匹配不上** ——
  要放开就得拿一条有安全理由的不变量换便利。真解是 SSE 化（本仓已有
  `/api/sync/stream` 先例）或给只读状态端点单列预算，两者都是后端的事。
  前端已在自己那层自救完毕（2.5s + 连续失败才停 + 停下时明说进展可能过期）。
- **ai-service 的构建/运行缺口**（拆仓阶段 2 遗留，共 4 条）已在本轮拉起时修掉，
  分别提交在 `tellurion-agent` 的 `fix/a05-env-ai-service-image`
  （go.mod 缺 15 条 indirect、镜像缺 wait-for-deps.sh 与 config/ai-service.yaml）
  与 core 的 `fix/a05-env-stack-startup`（`Dockerfile.service` 末行多余的 `\\` 让三个镜像
  全建不出来、compose 缺 `AI_SERVICE_URL` 让四族 AI 路由在容器形态下全 503）。
  前两条尤其值得注意：`docker compose ps` 显示三个服务 healthy，跑的却是那个 typo
  落地**之前**构建的旧镜像 —— "起得来"和"是新的"是两件事。

## A-06 证据质问内嵌（F6，横切）

1. 回测报告、因子 IC、多策略对比三处的可质问数字**各自**至少有一个质问入口（这三处正是设计稿缺失的）。
2. 点击入口打开侧滑/浮层，**页面 URL 不变**（不跳页），可用 Playwright 断言 `page.url()` 前后相等。
3. 从数字到原始记录的点击次数 ≤2，用测试步骤数佐证。
4. 无 `content_hash` 的数字显示"无法回溯"，且存在一条用例专门喂无 hash 数据断言该文案出现（诚实 > 好看）。
5. `GET /api/evidence/{content_hash}` 返回 404 时呈现"未摄取"警示态而非错误态（沿用 ODR-060 的三态渲染）。
6. `/evidence` 独立页保留为深链兜底且支持 `?content_hash=`，现有测试不退化。

## A-06 证据质问内嵌（F6，横切）　✅ **已完成 2026-10-14**（浏览器真实数据实测）

落点：`components/evidence/EvidenceProbe.vue`（质问入口 + 抽屉，8 条单测）
+ `composables/useEvidenceLookup.ts`（三态机，从 `EvidenceLookup.vue` 抽出）
+ `components/evidence/EvidenceRecord.vue`（记录展示，同样抽出共用）；
三处接线 = `MetricsCards.vue`（回测报告）、`BacktestCompare.vue`、
`FactorCitation.vue`。新增 `e2e/tests/evidence-probe.spec.ts`（6 条）。

| # | 断言 | 取证 |
|---|---|---|
| 1 | 三处各有质问入口 | 浏览器实测：回测报告 5 张指标卡各 1 个入口（真数据 `?id=76a00397…`，Sharpe −27.43）；对比页 12 行 × 1 个（实测 `probes=12 / rowCount=12`）；因子侧每条 citation 1 个 |
| 2 | 打开抽屉 **URL 不变** | 单元 1 条（断言 `push` 未被调用 + `location.href` 前后相等）+ e2e 1 条（真后端，`expect(page.url()).toBe(before)`）。**并撤掉一处既有违例**：`FactorCitation` 原先 `router.push('/evidence?…')`，点一下就被送出当前页 |
| 3 | ≤2 次点击到原始记录 | 实测 1 次：点入口即开抽屉**并自动解析**，记录直接出现。e2e 用步骤数佐证（一次 `click()` 后 `[data-testid="evidence-record"]` 即可见） |
| 4 | 无 hash 显示"无法回溯" | 该文案是**渲染出来的可见文字**，不是 hover/title；单元 + e2e 各有一条专门喂无 hash 数据。e2e 逐个数 5 个入口都写着"无法回溯" |
| 5 | 404 = "未摄取"警示态 | 与 `/evidence` 页**共用同一份三态机**（`useEvidenceLookup`），三态名逐一对上 [ODR-060](../../../../tellurion-docs/docs/archive/odr/odr-060-p5-1-frontend-evidence-api.md) 定义的 命中 / 未摄取(warning) / 其他失败(error)。破坏验证：把 404 当故障 → 新单测 2 条 + **一条原有** `EvidenceLookup` 测试 + e2e 2 条同时红 |
| 6 | `/evidence` 深链兜底不退化 | 抽屉内"在证据页打开"仍在（那是用户**主动**要的跳转）；`/evidence?content_hash=` 用真记录验：取回 `akshare / akshare.stock_financial_abstract / 600519.SH/2024Q1`。<br>⚠️ **本行原先还写着"全量 playwright 116 passed / 2 skipped / 0 failed"，那是错的读数，A-07 当日证伪并更正**：命令是 `npx playwright test \| tail -30`，**管道把退出码换成了 `tail` 的 0**，而截断只剩最后 30 行，红清单整体被切掉了。A-07 用不截断的重跑实测：**61 failed / 116 passed / 2 skipped**（共 179）。**这 61 条不是 A-06/A-07 引入的**，归因见 [AUD-61](../../TASKS.md) 的 2026-10-14 实测登记（死选择器、async 默认态导致的 strict-mode、纯 API 用例的数据期望、共享限流 429）。A-06 自己的 6 条在本轮改成"只对 429 退避"后**逐条绿** |

**三处接线的现实差别（实测，不是设计假设）**

- **回测报告**：`GET /api/backtest/:id/report` 响应里**零个** hash/citation
  （逐字段遍历过，2026-10-14 实测）⇒ 五个指标一律"无法回溯"。原因写具体：
  质问一个**派生数**的正确问法不是"哪条原始记录"，而是"这组输入下能否重算出同一个数"。
- **多策略对比**：同上；入口挂在**行标签**而非每格 —— 每格一个会糊出
  N 策略 × 12 行个按钮，而被质问的是同一个量，一次质问覆盖整行。
- **因子侧**：唯一真带坐标的一路（citation 五元组）。但 `factor_cache` 今天
  **0 行**（`GET /api/factors/momentum?…` → 404），所以抽屉的命中态只能用 mock 验。
  **没有为了取证往那张表塞假行** —— 引擎启动即 warm 它（日志
  `factor cache warming enabled`），一条假因子可能悄悄进真回测。
  **⚠️ 2026-11-12 订正**：该读面已被 core 收为 `410 factor_http_surface_retired`
  （ADR-037），`/factors` 按产品裁决改为退役说明页；本节那两条 mock 用例随之退役
  （见 `e2e/tests/evidence-probe.spec.ts` 文件头与主台账归档 `UI-FACTOR-CITATION-RETIRED`）。

**两处自查记录**

1. 写 `reason` 字符串时我用了 `**派生结果**`，实测原样露出星号 —— 与 A-05 刚修的
   同一类缺陷，隔一天在**自己新写的**字符串上复发。修法是别在用户可见字符串里
   夹 markdown，而不是给 `reason` 加一套解析器。
2. 登记断言 5 时调研一度报"ODR-060 不存在"（它只搜了 core 与 ui 两个仓）。
   核对后确认该 ODR 在 `tellurion-docs` 仓，三态定义与实现一致 ——
   差点把"引用是死链"写进台账，那会是本轮第二次犯"没核实就下结论"。

**复查（同日第二轮）又抓出三件，都已处置**

| 发现 | 处置 |
|---|---|
| `useEvidenceLookup` 导出 `resolvedHash`，两个调用方**都不读** | 删。我当初还给它写了句理由（"用于判断换了一个数字要重查"），但 EvidenceProbe 是直接 `reset()+lookup()` 的 —— 那个理由是我替它编的 |
| 给 `DetailMetrics.vue` 也加了质问入口 | 撤。实测它是**死组件**：`GET /api/backtest/:id/report` 响应里**没有 `metrics` 这个键**（逐字段核过），前端也从不赋值 ⇒ `v-if` 恒假、整块永不渲染。给不存在的场景写代码不是"顺手做全" |
| 为防窄屏溢出加了两条 CSS（`.metric-label{min-width:0}`、`.ev-probe{flex-shrink:0}`） | 撤。把网格压到 260px 实测：两条都**不改变任何结果** —— 标签自带 `overflow:hidden`，其自动最小尺寸本来就是 0，我防的那个溢出压根不发生。**死 CSS 配一段讲风险多严重的注释，比没有更糟** |

> **`DetailMetrics` 是死组件**这件事登记给 **A-07**（状态三值全站收口）：它和
> "用 `result.id` 是否存在判成功"同一族 —— TS 类型里写了个 `metrics?`，于是代码
> 假设了一个后端并不发的形状，而 `v-if` 让这种假设**静默失效**，既不报错也不显示。
> A-07 正是收这一类的。

## A-07 状态三值全站收口（K9 横切）

1. 全站不存在以 `result.id` 存在判成功的代码路径（grep `result.id` 相关判定为 0）。
2. `completed / invalid / failed` 三态在 API 类型、组件、文案三处同口径，类型层为三值联合（已在 b28d5b6 落）。
3. `invalid` 态渲染警示样式**且**列出 `invalid_reasons`，缺一即断言为假。
4. 含 `invalid` 的混合结果集进入对比页时，被排除项与其原因被显式呈现（抄 `compare` 稿的 `GATE EXCLUDED` 画法）。
5. 三值各有独立单测用例（3 条用例，不是 1 条参数化打天下）。
6. `--q-warning` 在实现中被 `invalid` 态实际消费（当前该 token 历史消费数为 0）。

## A-07 状态三值全站收口（K9 横切）　✅ **已完成 2026-10-14**（真后端 + **真无效运行**实测）

落点：新增 `utils/runStatus.ts` —— 三值的**唯一**展示口径（`statusTagFor` 详情视角、
`runStatusTag` 列表视角、`invalidReasonLabel`/`invalidReasonsText` 原因人话、
`backtestValidityNote` 流水线产物措辞）。接线 6 处：`QuickBacktest.vue`、
`ConsoleHistory.vue`、`BacktestHistory.vue`、`BacktestEngine.vue`、
`BacktestCompare.vue`、`Copilot.vue`；另删掉 `Dashboard.vue` 与 `QuickBacktest.vue`
各自那份 `interface QuickResult`（投影把 `status` 丢了，见断言 1）。
新增单测 `runStatus.test.ts`(26) + `QuickBacktest.test.ts`(11) +
`ConsoleHistory.test.ts`(6)，新增 `e2e/tests/status-tristate.spec.ts`(2)。

| # | 断言 | 取证 |
|---|---|---|
| 1 | 不存在以 `result.id` 存在判成功的代码路径 | 全部 7 处 `*.id` 判定逐条读过：`BacktestEngine.vue:46`（只是把 id 印在标签后）、`:165`（是否已在对比集 —— 没 id 就**不能**加入对比）、`:403`（报告缺 id 时用路由参数回填）、`Dashboard.vue:117`（缺 id 抛错：id 是**身份**不是结论）、`stores/backtest.ts:69`（id 是历史条目的主键）、`BacktestCompare.vue:134`（最佳标记）、`StrategyBuilder.vue:262`（拖拽载荷）。**没有一处**是"有 id ⇒ 成功"。机械腿见断言 5 下的源码扫描 |
| 2 | 三态在类型 / 组件 / 文案三处同口径 | 类型层 `RunStatus = 'completed'\|'invalid'\|'failed'`（`types/api.ts:44`，b28d5b6）；组件层六处全部 import 同一个 `utils/runStatus`；文案层由一条单测**钉住不漂移**：`statusTagFor('invalid')` 与 `runStatusTag('invalid')` 必须 `toEqual`（两个视角读同一张表，措辞不可能各自跑开） |
| 3 | `invalid` 渲染警示样式**且**列出 `invalid_reasons` | 单测各一条断 `NTag` 的 `type` prop（断 class 是**空断言** —— naive-ui 不加 type 修饰类，走 CSS 变量）；真实数据：控制台卡片跑 `stock_pool=["csi300"]` ⇒ 屏幕上是「无效运行」+「股票池为空 · 一次成交都没有 · 指标是不可用值」，**一个指标都不显示** |
| 4 | 混合结果集进对比页时被排除项与原因可见 | `e2e/tests/status-tristate.spec.ts` 两条：真后端走 `missing` 通道（用不存在的 id，理由见该文件注记）、mock 走 `invalid` 通道（本地库 **0 条 invalid 作业**，见下方"实测边界"）。两条都断"策略名 + 原因"，不只看 id |
| 5 | 三值各有独立单测用例（不是 1 条参数化） | `QuickBacktest.test.ts` 三个独立 `describe`（completed / invalid / failed）+ 一个"status 缺失或第四种值"；`runStatus.test.ts` 同样分态。参数化写法看不出**默认落在哪一支**，而"缺 status 就当成功"正是本轮修的 bug 形状 |
| 6 | `--q-warning` 被 `invalid` 态实际消费 | 断的是浏览器里的**计算色**：`toHaveCSS('color', 'rgb(245, 158, 11)')`（对比页原因行）+ 实测 `getComputedStyle` 读回同一值（快速回测卡的无效原因行）。措辞老实一点：那枚标签的色**早就**是这个值 —— `palette.ts` 的 `warning:'#f59e0b'` 经 `App.vue:67` 的 themeOverrides 喂给 naive-ui；本轮真正补上的是**原因文本**（原先是次级灰 `--q-text2`） |

**另有一处扫描器现在能机械抓住的东西**：`QuickBacktest.vue` 与 `Dashboard.vue`
原先各写一份 `interface QuickResult { id; total_return?; sharpe_ratio? }`。
投影丢掉 `status` 的代价不是少个标签，而是一次 `status=invalid` 的运行会带着
0 / 垃圾值进到这个卡片，被渲染成一枚绿色「收益 +0.00%」，与一次真成功的回测
**逐像素相同**。现在 props 就是 `BacktestResult`。

**断言 1 的机械腿（源码扫描，fail-closed 白名单）**：`runStatus.test.ts` 里
「凡渲染 `total_return` 的文件必须**真的读 status**」，两条腿都做过破坏验证 ——
① 探针文件不进清单 ⇒ 「清单本身没漏」红；② 探针进了清单但只在**注释**里写
`status` ⇒ 逐文件断言红。第二条是本轮加固的：第一版正则写的是 `\bstatus\b`，
那是**假护栏**（一句 `// 见 K9 status 口径` 就能骗绿），现在要求出现比较、
`switch(...status)` 或口径 helper。`Copilot.vue` 就是这条扫描器当场抓出来的
第三处现场。

**实测边界（哪些是真数据、哪些只能 mock，写清楚）**

- **真数据 · 真无效运行**：`POST /api/backtest` 用 `["csi300"]` 当票池（core 侧
  `docs/TASKS.md` §八 5 号条目查清的机制：字面量进 `StockPool` 而非 `IndexCode`
  ⇒ 展开分支不可达 ⇒ 票池归零）。浏览器实测三处：快速回测卡（无效标签 + 人话原因，
  指标一位不露）、控制台历史（该行标签是「无效运行」而不是方向「多」）、
  回测报告页（状态标签 + 警示条 + 5 张指标卡全 `-`）。**这就是断言 3 的正证据**。
- **实测顺手抓到的后端实情**（已写进 `ConsoleHistory.vue` 的注释，别再当假设）：
  无效响应的指标键是**缺席**的 —— 返回 JSON 里没有 `total_return` / `sharpe_ratio`，
  却带着 `sortino_ratio: 1.7976931348623157e+308`（MaxFloat64，正是 `garbage_metric`
  那条 Code 的来由）。所以"invalid 保留数字"这句原先的说法**不准确**，
  实际渲染是「收益: - | 夏普: -」。目前没有任何在渲染的界面会显示那个垃圾
  `sortino_ratio`（唯一会显示它的 `DetailMetrics` 是死组件，A-06 已登记）。
- **只能 mock**：对比页的 `invalid` 通道 —— 本地 `backtest_jobs` 里
  **0 条 invalid**（`GET /api/backtest` 只回 completed），而 `limit` 顶到 100
  也捞不到那 17 条 failed（它们比最新 100 条更老，接口没有 offset）。
  **没有为取证往库里塞假行**（同 A-06 对 `factor_cache` 的裁决）。

**自查记录（本轮自己犯的 / 自己抓的，都留档）**

1. **破坏验证时我把组件改坏了**：为验证"unknown 不默认成成功"，把
   `v-else-if="status==='completed'"` 改成 `v-else` —— 那与后面那支未知态
   构成**两个兄弟 v-else**，Vue 模板直接编译失败，测试跑出 `no tests`；
   还原时 Edit 又匹配到 2 处而失败。当时最危险的念头是 `git checkout` 该文件，
   而那会把整个三值模板一起丢掉（A-07 全部未提交）。**教训**：变异要选
   **不改变模板结构**的等价写法（最终用 `status !== 'invalid' && status !== 'failed'`，
   两条未知态用例干净转红），还原锚点用分支上方那段唯一注释。
2. **假护栏一处**：见上，`\bstatus\b` 换成"真的读 status"。
   判据是"改坏能不能变红"，不是"看起来像在检查"。
3. **复查自己的 A-07 代码又抓到两处二口径**：`BacktestCompare.vue` 把
   `invalid_reasons` 原样 `join(' / ')` 贴给用户（同一份原因在快速回测卡是
   「股票池为空」），`BacktestEngine.vue` 自带一份 `statusTagType`/`statusTagLabel`
   switch（措辞与 `runStatus` 逐字相同但各改各的）。两处都收进 `utils/runStatus`。
   为此改了**一条既有断言**：`BacktestEngine.test.ts` 原先断 `empty_universe`
   原样出现在屏幕上 —— 那是行为被本任务**故意**改掉的那一种，按 §规范记为
   "改测试因为需求变了"，不是为了让测试变绿。
4. **e2e 的 429 不是代码问题，但红在无关处一样有毒**：`pickJob` 连打
   `GET /api/backtest` 被**共享限流**打中，两条用例在与本次改动无关的地方红
   （实测两轮）。只给 **429** 加退避重试，其他状态码照旧响 —— 500 是真坏了。
   写第一版重试时我先 `dispose()` 再 `json()`，得到 `Response has been disposed`，
   自己踩自己挖的坑；已在注释里留这句。**同类 flake 大概率遍布 e2e 套件**，
   已按归属登记给 AUD-61，不在这里全仓铺开。
5. **一条被我写歪的理由及时改准**：CSS 注释初稿说"naive-ui 的 warning 是它自己的
   琥珀、外部覆盖不动"。实测 `getComputedStyle` 读回 `rgb(245,158,11)` —— 因为
   `palette.ts` 早把 `warning` 映射成同一个值了。所以本轮补的**不是**"接上 token"，
   而是"原因文本别再用次级灰"。注释与本文都已按实情改写。

**门禁读数（A-07 收口时，如实分开写）**

- 单测：`npx vitest run` **354 passed / 28 files**（本轮 +31）。
- `npm run typecheck` **0 错**；`eslint` 对改动文件 **0 error**（warning 是全站存量的
  属性换行风格，非本轮引入的写法问题）。
- 本轮自己的 e2e：`status-tristate`（2）+ `evidence-probe`（6）**逐条绿**。
- **全量 e2e 不是绿的**：`61 failed / 116 passed / 2 skipped`（179 条，退出码 1）。
  这 61 条**不是 A-07 引入的**（归因与逐条证据见 [AUD-61](../../TASKS.md) 的
  2026-10-14 实测登记）。我此前两次报"全量 0 failed"是把
  `npx playwright test | tail -30` 的输出当成结论 —— **管道给的是 `tail` 的退出码**，
  而截断切掉了红清单。判据只能是不截断重跑并读 playwright 自己的退出码。

## A-08 `data_sync` 整屏重做为作业控制台（F13）

1. 页面主区是作业队列（列表 / 详情 / 取消 / 重试），对应 `sync` 端点 `GET /api/sync/jobs`、`GET /jobs/{id}`、`POST /jobs/{id}/cancel`、`POST /jobs/{id}/retry` 各有一次真实调用。
2. 排程管理 CRUD + toggle + run-now 可达，对应 7 条 `/api/sync/schedules*` 端点。
3. worker 与 scheduler 统计有展示位（`GET /api/sync/workers`、`GET /api/sync/scheduler/stats`）。
4. 页面内**唯一**允许出现 "SSE" 字样的地方是单作业进度流，且其订阅走 `GET /api/sync/jobs/{id}/progress`；其余位置 grep 为 0。
5. 稿上的湖仓/集群/L2 元素（Parquet、Iceberg、DuckDB、GPU、SLA、Level2 逐笔）**一个都不实现**，grep 为 0。
6. PIT 时间轴与幸存者偏差两块**保留**（ANNOTATIONS 判为唯一精华），各有一条用例。

### A-08 实施计划（六字段，2026-10-14 起草 → 同日批准开工：若曦指示「先 sync01 再 A08」）

**① 目标**：`/data-sync` 成为作业控制台 —— 一条可筛可续的队列、一块排程管理、一组真实的
worker/scheduler 读数，且**屏幕上每个数都能指到一条端点或明写"未摄取"**。

**② 上下文（2026-10-14 当场实测，不是引用断言）**

| 端点 | 状态 | 前端现状 |
|---|---|---|
| `GET /api/sync/jobs` / `GET /jobs/{id}` / `POST /jobs/{id}/cancel` / `POST /jobs/{id}/retry` | 实测 200（`count:20`，内含 `aud49_…` 纳秒 ID 作业） | ✅ 已有：`api/sync.ts` 四函数 + `stores/sync.ts` 的 `cancelJob`/`retryJob`/`watchJob`/`unwatchJob`，消费在 `SyncStatusPanel.vue`(146 行) |
| `GET /api/sync/jobs/{id}/progress`（SSE） | 已有 | ✅ `syncJobProgressStreamPath` + store 的 watch/unwatch（全站唯一 SSE 腿） |
| `/api/sync/schedules` 系 **7 条**（list/get/create/update/delete/toggle/run-now） | 实测 200；后端在 `tellurion/cmd/data/main.go:149-155`，经 analysis 网关代理可达 | ❌ **`web/src` 对 `schedules` 零命中** ⇒ 这一整块是**纯新增**，不是改造 |
| `GET /api/sync/workers` | 实测 200（`num_workers:3` + 7 类 registered_types） | ❌ 无消费点 |
| `GET /api/sync/scheduler/stats` | 起草时实测恒 `{"active_schedules":0,"total_entries":0}` | ❌ 无消费点。**根因见 core 仓工单 SYNC-01，已于同日修掉**（`tellurion` commit `65a31a7`）：`pkg/sync/scheduler.go:47` 的 `Scheduler.Start()` 全仓**零调用方（生产与测试都是 0）** ⇒ cron 从未启动。修后实测：toggle on → `total_entries:1` + `next_runs` 有值；toggle off → `0/0`（见步骤 0 结论 (a)）。⚠️ **0/0 有两种成因（启动失败 vs 确实无 active 排程），后端不区分** —— 已登记，前端不得编诊断文案（§三 跨仓指针 A-08 行） |

页面现状：`pages/DataSync.vue`(34 行) 只是三块拼装 —— `DataSourcePanel`(139) /
`SyncStatusPanel`(146) / `DataImportForm`(93)；`api/sync.ts` 另有 datasource
`status`/`health` 两个消费点。**改造不是从零，是把已有的队列层重排 + 补齐三块空白。**

**③ 要求（六步，每步一个可独立测试通过的 commit）**

0. **前置归因（不写 UI）**：三件事各自出结论后才开工 —— (a) SYNC-01 是否在本轮修（不修则下述措辞约束生效）；(b) V-3 的基线策略二选一（本任务会**动掉 `data-sync` 这张视觉基线**，而它本来就因渲染活后台状态而不可复现 —— 不先定策略就等于改完没有回归网）；(c) 实测幸存者偏差的数据前提：`stocks.delist_date` 有多少非空行（代码路径已在：`pkg/data/tushare.go:217` 请求列含该字段、`:276` 注明修复、`pkg/domain/market/types.go:40`、`pkg/storage/postgres.go:389-394`，**但行数为 0 还是几百，直接决定那块显示什么**）。
1. **API 层补齐**：`api/sync.ts` 加排程 7 函数 + `workers` + `scheduler/stats`（命名与既有 `listSyncJobs`/`cancelSyncJob` 同风格；类型落 `types/api.ts`，**不在组件里就地声明**。
2. **store 层**：`stores/sync.ts` 增加排程切片与统计切片；SSE 仍**只有** `watchJob/unwatchJob` 一条腿，不得为排程另开轮询以外的第二条推送。
3. **队列区**（断言 1）：列表 + 筛选（状态/类型）+ 详情抽屉 + cancel/retry 动作，动作后必须回到"这条作业的最新状态"，不靠乐观更新。
4. **排程区**（断言 2）：CRUD + toggle + run-now；run-now 后跳去队列看那条新作业（不是弹一句"已触发"就算）。表单侧 cron 表达式**原样透传后端校验**（`ErrInvalidCron` → 400 的措辞要显示出来，不在前端猜合法性）。
5. **读数区**（断言 3）+ **PIT / 幸存者**（断言 6）：读数是 `workers`/`stats` 的真值；PIT 三时刻（财务期末 / 公告披露 `ann_date` / 因子可交易起始）从 `GET :8081/fundamentals/:symbol/history` 取 —— **今天它返回 `{"history":null}`**，故这块渲染**显式空态**（"未摄取"，同 ODR-060 三态口径），**不造行**（与 A-06 对 `factor_cache` 的裁决同规则：摄取缺口是 core 的 EQD-P1-2，不是前端可以填的空）。

**④ 约束与非目标**

- **措辞硬约束（SYNC-01 未修前生效）**：排程面板与 stats 读数**不得**出现「调度运行中」「下次执行 …」这类暗示 cron 会在后台触发的文案或字段位。可以显示"已注册 N 条 / 已排定"吗？—— 不行，"排定"就是那个暗示。只允许显示后端**确实量到**的东西：条目数、`is_active` 状态、以及"本环境的调度器未启动（见 core SYNC-01）"这句事实。
  > ⚠️ **本条已被步骤 0 结论 (a) 改判（2026-10-14，SYNC-01 已修并落 commit `65a31a7`）**：前提「cron 永不触发」不再成立，故「下次执行」这类文案**可以用**——但只在 `is_active=true` 时；替换生效的是步骤 0 (a) 里那条新规则（inactive 不显示 `next_run_at`，因 core SYNC-03 未修）。原文保留是为可追溯：这条约束当初为什么会存在。
- **不做**：稿上湖仓/集群/L2 全部（Parquet、Iceberg、DuckDB、GPU、SLA 99.999%、Level2 逐笔）—— 断言 5 以 grep 判定；不引入 `Tailwind`/新依赖；不加新端点假设（每条请求都能指到 `cmd/data/main.go` 的注册行或 openapi）；不碰 `docker-compose.yml`；不在前端改 `stats` 字段语义来"让它好看"。
- **不退化**：`DataSourcePanel` / `DataImportForm` 的现有能力（数据源状态与创建作业）在新 IA 里必须仍有落点，删除任一功能要在本台账写明理由，不静默丢弃。
- 每条用户可见字符串**不夹 markdown**（A-05/A-06 两次复发的老坑）；大对象用 `shallowRef`；DOM 访问前 `await nextTick()`。

**⑤ 验收（断言 → 取证方式，写清哪条用真数据、哪条只能 mock）**

| 断言 | 取证 |
|---|---|
| 1 队列四操作各一次真实调用 | e2e（真后端）：列表可见、点开详情、cancel 与 retry 后状态变化 —— 用 `GET /api/sync/jobs` 里的真作业；**cancel/retry 需要一条非终态作业**，取不到则造一条 `POST /api/sync/jobs` 真作业（这是真实 API 调用，不是往库里塞假行） |
| 2 排程 7 条端点可达 | 单测（api 层 mock 逐条断 URL/方法）+ e2e 用 route 拦截走一遍 CRUD 序列；**toggle 的真后端用例受 SYNC-01 影响，见下方"实测边界"** |
| 3 worker/stats 有展示位 | e2e 真后端读 `num_workers:3` 断渲染一致；`total_entries` 恒 0 的处置：显示 0 并附"调度器未启动"的事实句，**不美化** |
| 4 SSE 只出现在单作业进度 | 源码扫描守卫（fail-closed 白名单，同 A-07 断言 1 那条机械腿的写法）：全 `src/` 里 `EventSource` 命中文件必须等于登记集 |
| 5 湖仓/集群/L2 零实现 | grep 判据（用例断 0 命中），列出被 grep 的 6 个词 |
| 6 PIT + 幸存者各一条用例 | 各一条单测断"数据缺席时走显式空态、有数据时三时刻齐全"，空态那条是**今天唯一能真跑的** |

**⑥ 边界**：只做 `/data-sync` 一屏 + 其 api/store/组件；core 侧 SYNC-01、EQD-P1-2 归 core；V-3 的策略决定若需要测试基础设施改动，落 AUD-61 而不是夹在本任务里。

### A-08 步骤 0 结论（2026-10-14 实测，三件事各自的落笔前结论）

**(a) SYNC-01 已在 A-08 开工前修掉** —— core 仓 commit `65a31a7`（`fix(sync): 调度器接上装配点`）。
活进程正证据：重建重启 data-service 后日志齐 `scheduler.go:48/:254/:56` 三行；`POST /schedules/1/toggle {active:true}` → `scheduler/stats` 的 `total_entries` **0→1** 且 `next_runs` 出现，toggle 回 `false` → `0/0`（现场已还原，未触发真同步）。

⇒ **原「措辞硬约束」解除**（那条约束的前提「cron 永远不会跑」已不成立）。但实测顶出**一条新的、方向相反的约束**：

> **SYNC-03 实测（同一批 curl）**：toggle 回 `false` 后 `GET /api/sync/schedules/1` 仍返回
> `is_active:false` **且** `next_run_at:"2026-10-15T09:00:00Z"` —— 停用路径只 `cron.Remove`，不清字段。
> ⇒ **A-08 前端规则：`is_active=false` 的排程一律不显示 `next_run_at`**（显示它就是把一个不会发生的未来当事实，违愿景原则 4）。
> 后端真解登记为 core 工单 **SYNC-03**（`tellurion:docs/TASKS.md` §二·补），前端防御**不代替**它修好后的口径。

**(b) V-3 基线策略：选 (a) mask，不选 (b) 固定 fixture 后端。**

- 理由：`scheduler/stats` 从今天起是**活状态**（排程一注册就变），全页基线原理上不可能复现；(b) 要新搭一套测试后端，属**测试基础设施**，按 §⑥ 归 AUD-61，且无法与本屏改造原子提交。
- 代价（明写）：被遮的区域**不再有任何像素覆盖** —— 排程卡/队列/告警条三块的颜色回归只剩 A-08 的功能断言（断言 1–3）兜，视觉回归网在这些地方是**主动放弃**的，不是通过。
- 依赖顺序：mask 需要稳定选择器 ⇒ 步骤 3–5 先落 `data-testid`，再回来遮；遮哪几块、连跑三轮的登记**落 AUD-61 表**，本文件不重复记账（两处各记必漂移）。

**(c) 幸存者偏差块的数据前提：库里真有，HTTP 面上没有。**

| 实测（`stocks` 表，psql `ON_ERROR_STOP=1`） | 读数 |
|---|---|
| 总行数 | **5908** |
| `delist_date IS NOT NULL` | **339**（跨度 `1999-07-12` → `2026-07-30`） |
| 按 `status` 分组 | `active` 5569 行 / `delist_date` 非空 **0** 条；`delisted` 339 行 / `delist_date` 非空 **339** 条 |
| 不一致行（有摘牌日却仍标 active） | **0** |

⇒ 数据侧干净可用（列存在且类型是 `date`，`pkg/storage/stocks.go:15 stockColumns` 已把 `delist_date` 读出来，`pkg/domain/market/types.go:49` 用指针区分「未知」与「仍在市」）。

**但**：SPA 唯一的票池读数腿是 `GET /api/stocks/count` → `{count, latest_date}`（`cmd/data/handlers_stocks.go:84-104`，count 是**含已退市**的 5908），analysis 网关**没有**代理带 `status`/`delist_date` 的 `/api/stocks` 列表（`cmd/analysis/handlers_proxy.go` 只登记了 count 一条）。

⇒ 结论两条：
1. 幸存者块**这次不显示任何拆分数**，只显示「后端未暴露按状态拆分的读数」这一事实 + 指向 core 需求单；**不**在前端偷偷 `5908 - 339` 之类自算（那是在客户端重建后端语义，两处真相）。
2. 现有 `count` 若出现在界面上，标签必须写「全部记录（含已退市）」——把 5908 叫「在市股票数」就是假数字。
3. 需求以**只登记不指挥**的方式提给 core（工单 **DATA-02**，见本节末「向 core 提的需求」）：要一条按状态拆分/含摘牌日的只读腿。**具体形状由 core 定**，前端不干预后端设计（若曦 2026-10-14 准则原文）。

> **后记（2026-10-22，本节结论已被后续工单关闭，别照着它重开 DATA-02）**：
> core **DATA-02 已于 2026-10-14 落地**（形状由 core 定：`GET /api/stocks/count` 加 `by_status` 分组字段，
> 逐值等于 `GROUP BY status`），**DATA-03** 又给出 `latest_date`。所以上面第 1 条
> 「不显示任何拆分数」**只在本节写作时成立**；本仓 **UI-01（2026-10-22）** 已把拆分读数与
> 行情最新日接上屏（`web/src/components/sync/DataQualityPanel.vue`），屏上显示在市 / 退市两档与
> 退市占比（占比 = 两个后端读数相除，仍**不**拿 `count` 减退市数反推在市数）。
> 逐只的退市日期与 PIT 三时刻仍无通道，见 `docs/TASKS.md` 的 UI-01 条目与完成记录。

**实测边界（提前声明，避免事后写假结论）**：排程 toggle 之后 `scheduler/stats` 的
`active_schedules` **会变 1**（`ToggleSchedule` 真的把条目加进了 cron），但因为没有
`cron.Start()`，那一格**永远不会跑**。所以 A-08 若用"stats 计数变化"当验收，会在缺陷状态下
照样变绿 —— 验收必须落在「**是否出现了由排程产生的作业行**」这种可证伪的事实上，这条正是
core SYNC-01 的验收第 1、2 条要防的形状，本任务不能替它绕过。

> **改判后的形状（2026-10-14，步骤 0 结论 (a)）**：`cron.Start()` 现在有调用方了，所以这条**不再是缺陷**
> —— 但它作为**方法论**保留，且对 A-08 依然生效，只是方向变了：
> toggle 之后 `total_entries` 变 1 只证明「注册进了 cron」，**不证明「会跑」**（cron 表达式指向的未来时刻
> 在测试窗口内不会到）。⇒ A-08 断言 2 里「排程真的产生作业」这一腿必须走 **`POST /schedules/:id/run`（run-now）**
> ——它同步创建作业行（实测返回 `202 {message, job_id, status}`），是唯一能在测试窗口内证伪的判据；
> 用「等 toggle 后出现作业行」当判据是把验收挂在一条 09:00 的时间上，等于没有判据。
>
> ✅ **run-now 那条已经当场量过，不是读码推测**（2026-10-14 17:41Z，经网关 :8085）：
> `POST /api/sync/schedules/1/run` → `202 {"job_id":"scheduled-1791999687307345938","message":"schedule triggered","status":"pending"}`；
> 1.6 秒后 `GET /api/sync/jobs/{id}` → `status:"completed"`、`progress_percent:100`、`result:{count:242, symbols:1}`。
> **副作用留痕（明写不藏）**：这次真取数向 `ohlcv_daily_qfq` 写入 000001.SZ 2024 年 **242** 行真实日线；
> 作业行 `scheduled-1791999687307345938` 留在 `sync_jobs` 里，**正好充当 A-08 队列区 e2e 的真作业 fixture**。

## A-08 `data_sync` 整屏重做为作业控制台（F13）　✅ **已完成 2026-10-14**（真后端 + 真 cancel 实测；V-3 基线在收口时改判，见步骤 6 ④）

### A-08 步骤 6 收口（门禁与台账，2026-10-14）

**① 三条机械腿**（`web/src/a08-boundaries.test.ts`，8 条用例）

| 腿 | 判据 | 为什么是源码扫描而不是行为测试 |
|---|---|---|
| 断言 4 | `new EventSource(` 的构造点集合 **等于登记集** `['stores/sync.ts']`；那条构造打的是 `syncJobProgressStreamPath(...)`，其形状是 `/api/sync/jobs/${id}/progress`；`.vue` 剥掉注释后不出现 `SSE`/`EventSource` 字样 | 新开一条推送在行为测试里长得完全正常（请求发得出去、界面渲染得挺好）；只有读源码看得出"多了一条腿" |
| 断言 5 | 六个词（Parquet / Iceberg / DuckDB / GPU / SLA / Level2）带**词边界**扫全 `src/` 非测试源码，命中 0；另有两条"不空跑"腿（违例样本必须被同一套规则抓到、扫描面文件数 > 60） | 湖仓元素是"不许实现"，实现进来就是新代码，行为测试只会去测它工作得好不好 |
| 约束 | 剥掉注释后全仓实现源码不含 `**加粗**`（A-05/A-06/A-08 三连复发的同一个坑） | 违例的表现是"用户看见星号"，而收益是零 —— 全站判据，不只本屏 |

判据用 `\bSLA\b` 而不是子串：`translateY` 里含 `sla`，子串 grep 会把 CSS 判成违规（假红），而假红会把人训练成忽略红灯。

**破坏验证（新增护栏必验，四条腿各自点名）**

| 编号 | 改坏 | 结果 |
|---|---|---|
| MUT-13 | 撤掉 store 里 `schedulesLoaded.value = true` | **5 红**（store 3 条 + 读数区"0 条/未读取"两条） |
| MUT-14 | 把重复的 `fetchStats()` 加回排程面板挂载 | **1 红**，正是那条"一个数据集一个自动触发点"守卫 |
| MUT-15/16 | 临时探针文件里放第二条 `new EventSource(` + `SSE` 文案；再放 Parquet/SLA/Level2 + `**加粗**` | 两轮分别 **2 红 / 2 红**，消息点名到文件与词 |
| MUT-19 | 撤掉 `jobsLoaded.value = true` | **3 红**（store 1 条 + 队列空态 2 条） |

探针一律用**新建临时文件**而不是改真组件（改完 `rm`，`git status` 只剩该留下的文件）；MUT-13/14/19 用 node 写 `.bak` 再逐字节还原，还原后断言 `restored identical: true` + 全文无 `MUT-` 残留。

**② 本轮修掉的三处同族口径缺陷**（"读到空"与"没读到"是一句话的两副面孔）

1. **空队列的真回包是 `{"count":0,"jobs":null}`**（2026-10-14 curl `?status=pending` 实测，Go 侧 nil slice 编成 `null`），而前端类型写 `SyncJob[]`。按 null 存进 store，`queueLength` 的 `.filter` 当场 TypeError ⇒ 整块队列白屏，而这恰恰是最常见的空态。修法：`resp.jobs ?? []`（与 `schedules` 同一 fail-closed 口径）。**先红后绿**：单测拿真形状写 → `expected null to deeply equal []` → 修 → 484 全绿。后端侧的编码问题登记为 core **DATA-14**（原 DATA-04，2026-10-21 SPEC-R-03 换号；只登记不指挥）。
2. `schedulesLoaded` / `jobsLoaded` 两面旗标：读数区不再拿 `schedules.length` 当"读到了没有"的代理（空表会被说成"未读取"），队列空态分三句（未读取 / 确实没有 / 被类型筛掉），排程空态分两句。
3. **一个数据集一个自动触发点**：浏览器实测（页面加载的网络面板）`schedules`/`workers`/`scheduler/stats` 各被打通**两遍**（排程面板与读数面板各自挂载各取一遍）。single-flight 挡不住错开的 await，所以按归属收口（排程行归排程面板、两条读数归读数区，读数区的刷新按钮是唯一"拉全"入口），并给 `fetchSchedules`/`fetchStats` 加 single-flight 覆盖变更动作后的并发重读。收口后网络面板实测：**三条各一次**。共享限流桶是进程级的（core OPS-01），空耗预算会把真实请求挤成 429 —— 这不是洁癖，是本轮 e2e 自己被 429 打死过两次之后收回来的结论。

**③ A-08 自己的 e2e**（`e2e/tests/a08-job-console.spec.ts`，6 条，逐条绿，退出码 0）

| 用例 | 真后端 / 拦截 | 钉住的东西 |
|---|---|---|
| 队列列表 + 详情回读 + worker 读数 | **真后端**（只读） | 界面那格 == 页面自己吃下的那条响应；详情抽屉必须是刚点的那条 |
| 空队列 `jobs:null` 走空态 | 拦截（要的是**真形状**） | 上面第 ②-1 条缺陷的回归腿 |
| 取消/重试按钮三态 | 拦截 | `canCancel`/`canRetry` 镜像后端规则（`cancelled` 不可重试、`pending` 可 —— 与直觉相反） |
| 取消走真后端 | **真后端（写一次）** | 点完之后界面 == 后端回读的状态，不是前端猜的"已取消" |
| CRUD + toggle + run-now | 拦截（理由写在文件头） | 六条写端点各命中一次、run-now 之后**队列里出现那条作业**、停用行不显示残留 `next_run_at`、全站唯一那条推送只开在 run-now 的作业上 |
| PIT + 幸存者 | 拦截 + 真后端 | 缺通道就明写缺通道，不造数、不在前端自算退市占比 |

真 cancel 这条落了库的正证据（不是读码推测）：`aud49_1792010807809070700` → `cancelled @ 20:55:12Z`、`aud49_1792010807381222300` → `cancelled @ 20:56:35Z`，两条都由这条用例点出来的。
**未现场跑过的腿明写**：库里没有非终态作业时的兜底分支（`POST /api/sync/jobs {type:'stocks'}` 造一条真作业再取消）逻辑就位但本轮没走到——本地栈里一直有 stale `running` 行；retry 只走拦截（真 retry 会重跑一次真取数，代价大于这条腿能证的东西）。

**④ V-3 基线：改判，从「遮」换成「fixture」**（这一步的结论反转，写在最前面）

步骤 0 选的是 (a) 遮罩。本轮先按 (a) 落地并**连跑三轮全绿**——随后在全量套件里同一条用例**红了**，所以那个绿是假的：

- 根因：**遮罩只糊像素，不改布局**。被遮那块（队列面板）行数一变就变高，下面每一块整体下移；单独跑三轮时库里行数恰好没变，位移没发生，于是"绿"什么也没证明。全量套件里 A-08 的真 cancel 腿先改了库，位移进视口 → diff。
- 改判：这一屏请求的 8 条端点全部由测试给出固定回包（`DATA_SYNC_FIXTURE`），**不加遮罩**。副作用是这四块**重新有了像素覆盖**（遮罩版是主动放弃覆盖）。
- 双向取证：① 不敏感——先跑 A-08 那 6 条（含改真库的 cancel），再跑这条基线，仍绿；② 不空跑——临时脚手架实测"换 fixture 时五块区域像素全变"（`responds_to_fixture=[queue,schedule,readout,quality,datasource]`），且同一 fixture 两次整页逐字节相同（`page_reproducible=true`）。脚手架跑完即删，不进提交。
- 代价明写：视觉网**不再覆盖真数据渲染**（真队列的深度、真数字的宽度都不在这张图上）；页面将来消费新字段时回包必须跟着补，补漏了就是"基线照常绿而界面已经错"——那层兜底交给 A-08 的真后端功能断言与组件单测。
- 三条刻意的 fixture 选择写进注释：作业全给终态（非终态会开 SSE + 起 8s 轮询，"实时连接"那颗芯片是时间函数）；`failed` 那条保留 重试 按钮、`active` 那条保留 下次执行（按钮与三态排版仍在图上）；停用行故意带着残留 `next_run_at`，让「显示 —」这条 SYNC-03 防御也进这张图。

**⑤ 门禁读数（A-08 收口时，如实分开写）**

- 单测：`npx vitest run` **484 passed / 36 files**（本轮 +14），退出码 0。
- `npm run typecheck` 退出码 **0**；`npm run lint` 退出码 **0**（0 error，945 warning 是全站存量的属性换行风格）。
- 本轮自己的 e2e：`a08-job-console`（6）**逐条绿**，退出码 0；`visual-regression` 的 data-sync 那条在 fixture 版下绿，且对真库变化不敏感。
- **全量 e2e 不是绿的**（两次跑，读数如实并排）：
  - 遮罩版基线那次：`79 failed / 104 passed / 2 skipped`（185 条，退出码 1），其中 data-sync 基线**红**。
  - 改走 fixture 之后复跑：同样 `79 failed / 104 passed / 2 skipped`，但 data-sync 基线**绿**、`a08-job-console` 6 条**全绿**。红总数没变，变的是"哪几条红"。
  - 与 AUD-61 登记的 61 红基线相比涨了 18 条，涨的全部在纯 API spec：`api-negative` 2→11、`api-backtest` 2→5、`api-health` 0→3、`api-strategy` 0→2、`backtest-engine` 9→11；`visual-regression` 3→**2**（本轮把 data-sync 那条收进来了）。抽样点名核对：`api-negative.spec.ts:15` 的失败是 `Expected: 400 / Received: 429` —— 就是 AUD-61 的第 ④ 类（共享限流），不是新缺陷；`api-backtest.spec.ts:186` 是第 ③ 类（`win_rate` 在 invalid 运行里缺席，与 OBS-01 同源）。
  - **本轮引入的断言级红：0 条** —— 我自己那 7 条（A-08 e2e 6 + data-sync 基线）在全量运行里全绿。但**不把话说满**：这几条也往同一个限流桶里投了约 25 次请求（两次真页面加载 + 真 cancel 的写），涨的 18 条红不能排除被它推过顶。"谁贡献了几次 429"这种归因要 AUD-61 阶段一的逐条登记 + 单跑复验才做得起，本轮不下那个结论。


## A-09 `execution` 重画为纸交易观测台（F16）　✅ **2026-11-12 完成**（`9ca2a61` 页面 + `97e934d` 信号读面）

1. 页面四块齐备：订单 / 持仓 / 账户 / 外部信号流，对应 `core` 的 `orders`、`positions`、`account`、`signals` 端点（稿上后三块缺失）。**2026-11-12：`GET /api/signals` 读面补齐，第四块从 disabled 占位转为真实列表**（空数组=合法空流；503/取数失败显示「读面未接通」，不画成「没有信号」）。
2. 全站文案 grep 不出现 `实盘`、`FIX`、`Colocation`、`DMA`、`TWAP`、`VWAP`、`100 FPS`、`亚毫秒`（F16「UI 文案不得暗示实盘」）。
3. 紧急平仓按钮满足红色 + 二次确认 + 独立确认码三条件，且有一条用例断言缺确认码时不可提交。
4. 所有数值来自 `MockTrader` 真实响应，无写死的机构级布景（担保品金额、保证金占用率等虚构值 grep 为 0）。
5. 页面明确标注"纸交易 / Mock"身份，与 `/api/execution/*` 的实际能力一致。
6. 不引入任何新的执行端点假设（`grep` 请求路径全部命中 openapi 已有 **6 条 execution 路径 + `GET /api/signals`**，共 7 条）。

## A-10 缺屏补设计：合规 F17 / 系统管理 F18 / walkforward+batch　✅ **2026-11-12 完成**（`b82f4ac` / `bf23eb3` / `b9db1e7` / `8f68af4` / `88d3a3a`）

1. 合规页覆盖 `core` `/api/compliance/*` 全部 **9** 条端点，逐条有调用点。
2. 系统管理页覆盖 `/api/auth/admin/users`、`/audit`、`/status`、`/bootstrap` 与 `/api/plugins*` **9** 条。
3. walk-forward 与批量回测有承载页，覆盖 `/api/walkforward*`、`/api/batch*` 共 **4** 条（2026-11-12 订正：原写 5 条；walkforward 的历史读端点已退役，batch 的 CSV 导出如实 501，故只承载 4 条。证据：`tellurion:cmd/analysis/handlers_walkforward.go:15`、`handlers_batch.go:126-129`、`openapi.yaml:622/660/685/706`）。
4. 三个新页均登记进 `core` 侧 `docs/ARCHITECTURE.md` 前端章节（AGENTS.md Rule 1 触发器）。
5. 每页有对应 Playwright spec，且新增路由后 `authGuard` 分支行为不变（开放访问/鉴权两态各一条）。
6. 三页都不引入后端没有的控件（每个控件可指到一条端点或标 ⏳）。

## A-11 字体加载决策落地　✅ **2026-11-12 完成**（`01b5baa`，ODR `docs/odr/001-font-self-hosting-latin-subset.md`）

1. 决策二选一并有 ODR 记录：自托管 woff2（需主任批准二进制）或外部 CDN（需说明与"自托管"定位的冲突如何化解）。
2. 若加载：`document.fonts.check('12px Inter')` 在真实页面返回 `true`。
3. 若不加载：`DESIGN.md §5.1`、`variables.css` 注释、本任务三处的"未加载"标注被更新为明确结论，不留悬置。
4. 中文实际命中 `Noto Sans SC` 族（可用 `document.fonts` 或像素比对验证，不靠"看起来对"）。
5. 等宽数字在表格中不横向跳动：`font-variant-numeric: tabular-nums` 在数据单元上生效，有一条计算样式断言。
6. 字体变更不使 `npm run build` 产物体积无谓膨胀 >200KB（若自托管需报告实际增量）。**实测 woff2 合计 93,556 B ≈ 91.4 KiB**（Inter 400/500/600 + JetBrains Mono 400，latin 子集），未超预算。

## A-12 校准驾驶舱：审阅台第二 tab（设计报告 S2，G6 消费面）　✅ 已收口（2026-11-13）

> 来源：2026-11-13 UI/UX 改进报告（会话可视化 artifact `quantlab-ui-ux-improvement-plan-r1.html` 样图 B）·
> 依赖：G6 已落地（无阻塞）· 与 B-03 共用 `/review` tab 骨架，先落本单、B-03 后加第三 tab。
> **放置裁决（2026-11-13，起草时定）**：报告原稿写「独立 `/calibration` 页 + ⌘K 直达」，**不采用** ——
> `CommandPalette.vue:63` 只读 `NAV_ITEMS`（A-04 断言 5），独立页必须新增导航项，与 A-13 收敛方向矛盾。
> 改为审阅台第二 tab + 深链 `/review?tab=calibration`，同 §3.2「研究日志可并入审阅台 tab」模式。
> 代价明写：偏离已交付报告的独立页放置；校准入口藏在 tab 里，靠 A-15 晨间简报的链接保可达。

1. `/review` 出现「候选审阅 / 校准驾驶舱」双 tab，深链 `/review?tab=calibration` 直达第二 tab；`NAV_ITEMS` 数量不变（**不新增导航项、不新增路由**），⌘K 与侧栏同源的 A-04 断言 5 守卫不退化。
2. 校准面板消费真端点 `GET /api/pipeline/calibration`（`api/pipeline.ts:56`），渲染 `sample_size / hit_rate / claimed_rate / calibration_error / brier_score` 五数；`entries` 为空数组时显示**显式空态**（「还没有采纳记录」），不画假图、不把空样本渲染成 0%。
3. 可靠性图：横轴声称置信度分箱、纵轴实际命中率，带对角参考线与每箱样本数 n；`is_holdout=true` 的条目单独成列，不与主样本混算。
4. 三态如实：`outcome_hit=null` → 「待回填」（不计入命中率分母、不画成未命中）；`pending=null` → 「—」（不画成 0）；小样本（n<30）显式标注「样本不足，仅供参考」。
5. 二值措辞守卫：本面板组件源码 grep `VALIDATED|VERIFIED|已验证|已认证` 为 0（校准 ≠ 认证，B-05 断言 5 同源）；每条用户可见字符串不夹 markdown。
6. B-02 候选审阅 tab 不退化（`review-desk.spec.ts` 现有用例全绿）；破坏验证：把空态分支改成渲染 0% → 断言 2 用例红，还原 → 绿。

### A-12 实施计划（六字段，2026-11-13 起草）

**① 目标**：主任在审阅台看见「当时声称的把握，后来实际命中多少」—— 校准误差 + 可靠性图 + holdout 分离的真实读面，屏幕上每个数都能指到 `getCalibration` 的一个字段或明写「待回填 / —」。

**② 上下文（2026-11-13 当场实测，不是引用断言）**

| 事实 | 证据 |
|---|---|
| G6 端点已落地 | agent `docs/api-schema.md` §1.3：`POST /api/pipeline/adoption` + `GET /api/pipeline/calibration`；ai-service 本机 `127.0.0.1:8086` healthy（B-01 关账记录） |
| 前端 API 层已就绪、**零渲染消费** | `api/pipeline.ts:56 getCalibration` / `:45 Calibration` / `:32 CalibrationEntry`（含 `is_holdout` / `outcome_hit: boolean\|null` / `claimed_confidence`）；grep `getCalibration` 在 `web/src` 只命中 api 层 |
| 宿主页无 tab 结构 | `pages/ReviewDesk.vue` 单屏：approx-banner(:5) / controls(:11–24) / ranked-list(:30–89) / adopt modal(:92–130)；`router/index.ts:81–82` review 路由不解析 query |
| 放置矛盾 | `CommandPalette.vue:63` `filterNavItems` 只读 `NAV_ITEMS` ⇒ 独立页必增导航项，与 A-13 收敛矛盾（见上方放置裁决） |
| 空态是今天唯一真态（**实测**） | 2026-11-13 curl `GET :8085/api/pipeline/calibration` → `{"sample_size":0,…,"pending":0,"entries":[]}`（EXIT=0）⇒ 真后端 e2e 只能验空态；注意 `pending` 今天是数字 0 不是 null，「—」态必须走 fixture。非空态走 route 拦截 fixture 并**显式标 mock** |

**③ 要求（五步，每步一个可独立测试通过的 commit）**

1. **tab 骨架**：`ReviewDesk.vue` 加 `n-tabs`（候选审阅 / 校准驾驶舱），解析 route query `tab`（缺省 = 候选审阅）；现有 ranked-list 的 DOM 结构与 `data-testid` **一个不动**（B-02 e2e 选择器不变）。
2. **面板组件**：新建 `components/review/CalibrationPanel.vue`，消费 `getCalibration`：五数摘要 + 可靠性图（Chart.js，复用现有图表封装，**不引新依赖**）+ entries 表（claimed / hit / 待回填三态）。分箱是纯函数，落 `utils/calibration.ts` 并带单测。
3. **三态与空态**（断言 2/4）：`entries=[]` → 显式空态；`pending=null` → 「—」；`outcome_hit=null` → 待回填徽标；n<30 → 「样本不足」标注。
4. **e2e**：真后端空态一条 + route 拦截 fixture 非空态一条（分箱 / holdout 分离 / 待回填各断言一次）；fixture 数据形状逐字段对齐 `Calibration` 类型，不造后端没有的字段。
5. **破坏验证 + 基线**：断言 6 的改坏腿真跑；审阅台视觉基线因 tab 新增重录（V-1 `setFixedTime` 纪律，逐张看 diff 再录）。

**④ 约束与非目标**

- **不做**：不新增 `NAV_ITEMS` 项、不新增 `/calibration` 路由（深链是 query 不是路由）；不做写操作（采纳写入归 B-02 弹窗 / B-03 台账）；不改 `getCalibration` 契约；不引入新图表库。
- **措辞硬约束**：无 `VALIDATED` / `VERIFIED` / 「已验证」/「已认证」；`calibration_error` 不得包装成「评分」或「等级」；小样本必须标注，不得只画漂亮图。
- **不退化**：B-02 候选审阅的排序 / 采纳 / 四干预 e2e 全绿；`InterventionBar` 不动。
- 大对象 `shallowRef`；DOM 访问前 `await nextTick()`；字符串不夹 markdown（A-05/A-06 老坑）。

**⑤ 验收（断言 → 取证方式，写清哪条用真数据、哪条只能 mock）**

| 断言 | 取证 |
|---|---|
| 1 双 tab + 深链 + 导航不变 | e2e 真后端：`/review?tab=calibration` 直达；守卫 = 本单 commit 的 diff 不触 `navItems.ts`（与 A-13 并行时不依赖对方的项数） |
| 2 真端点 + 空态 | e2e **真后端**（今天 entries 恒空 ⇒ 空态是唯一能真跑的态）；非空态走 route 拦截 fixture，**显式标 mock** |
| 3 可靠性图 + holdout | 单测（分箱纯函数：claimed 分箱 × 命中率 × n，反例：holdout 混入主样本 → 红）+ fixture e2e |
| 4 待回填 / — / 小样本 | 单测三态渲染各一条；`pending=null` 与 `outcome_hit=null` 用 fixture |
| 5 措辞 grep | 守卫用例：面板组件源码 grep 四词 0 命中（破坏验证：注入一个 VERIFIED → 红） |
| 6 不退化 + 破坏验证 | `review-desk.spec.ts` 全绿；空态分支改渲染 0% → 断言 2 红 → 还原绿 |

**⑥ 边界**：只做 `ReviewDesk.vue` tab 骨架 + `CalibrationPanel.vue` + `utils/calibration.ts` + api 消费层；采纳写面与台账归 B-03；晨间简报的校准链接归 A-15。

**落地（2026-11-13）**
- **tab 骨架**：`ReviewDesk.vue` 加 `n-tabs`（候选审阅 / 校准驾驶舱），tab 状态住 URL query（`?tab=calibration` 深链，`router.replace` 只改 query，**未新增路由、未动 `navItems.ts`**）；原 ranked-list / adopt modal 的 DOM 与 `data-testid` 一个未改，只整体挪进第一个 pane。
- **面板**：新建 `components/review/CalibrationPanel.vue`，消费 `getCalibration`：五数摘要（`sample_size / hit_rate / claimed_rate / calibration_error / brier_score`，误差单位写「个百分点」，无「评分/等级」包装）、可靠性散点图（Chart.js，复用 `chartPalette`，主样本 + holdout 两条线 + 对角参考线，tooltip 带 n）、分箱表、entries 表（命中 / 未命中 / 待回填三态）。取不到 2d 上下文（happy-dom）时跳过绘图，读数与表格照常，不吞错。
- **纯函数**：`utils/calibration.ts`：`binIndex` / `splitHoldout` / `binCalibration`（10 等分箱，1.0 归末箱；`outcome_hit=null` 只计 pending、不进分母；只返回非空箱；`CALIBRATION_MIN_SAMPLE = 30`）。
- **三态**：`entries=[]` → 「还没有采纳记录」显式空态 + 「还没有已回填条目」图表说明；`pending=null` → 「待回填：—」；`outcome_hit=null` → 「待回填」徽标；`n<30` → 「样本不足（n=… < 30），仅供参考」；`holdout` 为空 → 「—」。
- **测试**：`utils/calibration.test.ts`（6 例）、`components/review/CalibrationPanel.test.ts`（11 例，含源码措辞守卫四词零命中）、`pages/ReviewDesk.test.ts` 补 router 注入 + 2 例深链/回写 query，原 5 例断言未放宽。e2e `review-desk.spec.ts` 新增 4 例：深链直达、读数或失败态二选一、点 tab 写 query、fixture 非空态（分箱 50% / holdout 0% 分离 / 待回填 1 条 / 样本不足）。**真后端当前台账为空，非空态只能 fixture 取证，测试注释已显式标 mock。**
- **破坏验证**：把空态分支改成恒渲染空表 ⇒ `CalibrationPanel.test.ts` 1 failed（空态用例），逐字还原 ⇒ 11 passed。措辞守卫注入未做（组件里未出现四词，改源码需另造词，按同一断言可直接观察到红）→ **审查时已补做，见下方「审查订正」**。
- **验证**：`npx vitest run src/utils/calibration.test.ts src/components/review/CalibrationPanel.test.ts src/pages/ReviewDesk.test.ts` → 24 passed；`src/styles/palette.test.ts` 38 passed（新组件首版 `var(--q-hairline, …)` 兜底被棘轮守卫抓住，已改为既有 token `--q-text3 / --q-border-light / --q-mono`）；`npm run typecheck` EXIT=0；`npx eslint`（触及文件）0 error。
- **偏离说明**：条目 ⑤ 要求「审阅台视觉基线重录」——`visual-regression.spec.ts` **本来就没有 `/review` 基线**，无图可录，故本次未新增/重录任何基线（新增基线属扩范围，不在此单）。

**审查订正（2026-11-13，五角审查 task #9，直接 fix）**
- **tab 标签对齐工单**：实施时写成「候选排序 / 校准」，与断言 ①「候选审阅 / 校准驾驶舱」不符（收口记录又写成「候选审阅 / 校准」，三处三个样）。已把 `ReviewDesk.vue` 两个 tab 标签改为「候选审阅」「校准驾驶舱」，面板空态文案与 `docs/ARCHITECTURE.md` 页面清单同步；e2e `hasText: '校准'` 与单测 `.includes('校准')` 是子串匹配，改名后仍绿。
- **空样本不画 0%（断言 2 补牙）**：后端空台账把四个派生量回成数值 0（curl 实测），原实现照渲染成「0.0% 命中率」= 假测量。新增 `noSamples`（`sample_size === 0`）守卫：四个派生量渲染「—」，`sample_size` 本身照实显示 0；补 2 条单测断言 + 1 条「只有待回填条目」边界用例。
- **其余订正**：`CalibrationPanel.vue` 的 `data` 由 `ref` 改 `shallowRef`（entries 是嵌套数组，AGENTS.md 大对象规则）；「已回填 N 条」补「（不含 holdout）」限定（`sample_size` 口径不含 holdout 已回填行）；剥掉该文件独有的 UTF-8 BOM（全仓其余 .vue 无 BOM）。
- **破坏验证（审查时真跑，记录退出码）**：① 措辞守卫注入 `VERIFIED` ⇒ 1 failed / EXIT=1，逐字还原（cmp 一致）⇒ 12 passed / EXIT=0；② 去掉四处 `noSamples` 守卫（空样本渲染 0%）⇒ 恰 2 failed（两条空态用例）/ EXIT=1，还原 ⇒ 12 passed / EXIT=0；③ A-13 同批补做：`user-flows.md` §3.2 注入幽灵入口 ⇒ `nav-labels.test.ts` 1 failed / EXIT=1，还原 ⇒ 9 passed / EXIT=0。
- **台账订正**：A-15 节标题 ⛔ 阻塞 → ✅ 已收口（实施已完成，标题漏改）；`docs/ARCHITECTURE.md` 页面清单 `/review` 用途补「校准驾驶舱（第二 tab）」、`/` 用途补「晨间简报」。
- **晨间简报空台账不画「0.0 个百分点」**：真栈浏览器复核发现同一类假测量也出现在仪表盘简报的校准行（空台账后端回 `calibration_error: 0`，行上照渲染「0.0 个百分点」）。`MorningBriefing.vue` 的 `calibrationValue` 补 `sample_size === 0` 守卫（与面板同口径，值写「—」，note 仍如实写 `n=0` 并标样本不足）；补 1 条空台账单测。破坏验证：去掉该守卫 ⇒ 新用例恰 1 failed / EXIT=1，逐字还原（cmp 一致）⇒ 10 passed / EXIT=0。真栈复验：行显示「—」+「n=0 · 样本不足，仅供参考」，深链 `/review?tab=calibration` 不变。
- **`dashboard-metric-card` 视觉基线重录**：A-15 断言 6 要求重录仪表盘基线，但元素截图（`.nav-tile` 首块）不在 A-15 改动的整页基线覆盖里，首跑 55/56 红。核查：该基线录于 A-11（`01b5baa`）之后从未随布局改动重录；浏览器实测首块 `y=792.90625`（分数偏移）⇒ 子像素栅格化差异，diff 图仅顶部描边 + 标题加粗，无实质视觉变更（V-1 纪律：先看 diff 再重录）。只重录这一张 `dashboard-metric-card-chromium-win32.png`，其余基线未动；重录后定向 e2e 56 passed / EXIT=0，视觉回归二轮 10 passed / EXIT=0。

## A-13 导航 IA 收敛：15 项 4 组 → 14 项 5 组（设计报告 S3，解除 A-04 断言 2/8 暂缓）　✅ 已收口（2026-11-13）

> 来源：2026-11-13 UI/UX 改进报告 S3 · 依赖：无（F11=B-04 ✅ / A-06 ✅，A-04 暂缓条件已满足）。
> **前提订正（2026-11-13，起草时实测）**：报告原稿写「15→9」，引的是 A-04 旧提案 ——
> A-04 记录自己写明「'9 项'没有权威清单」，且该清单早于审阅台 / 走向与批量 / 纸交易 / 合规 /
> 系统管理五个新页、还用着已退役标签「因子研究」。**照抄 9 会孤儿化审阅台（P0 中枢）**。
> 本单改按 `user-flows.md` §3.2 目标 IA 收敛为 **14 项 5 组**（15 − 证据质问独立入口）。
> **治理**：A-04 断言 2/8 的暂缓理由「等 F11/A-06 落地后再动」两条前置均已 ✅（B-04 `08e95f1` /
> A-06 因子证据降级），主任 2026-11-13 派工细化设计 = 批准解除暂缓，本单即实施载体。

1. `NAV_ITEMS` 由 15 → **14**：删「证据质问」独立入口（页面已按 A-06 降级为内嵌侧滑，`/evidence` 路由与页面**保留**作深链兜底）；分组改为 **总览 1 / 研究主线 2（探索观察、审阅台）/ 仪器房 7（回测引擎、多策略对比、走向与批量、策略库、因子证据（已退役）、选股与市场、数据管理）/ 监控 1（风险告警）/ 系统 3（纸交易、合规、系统管理）** —— 纸交易从仪器房移入系统（§3.2「执行与账户」域）。
2. 三处标签同源守卫全绿：14 项的侧栏 label == 路由 `meta.title` == 页面 H1 逐字相同；`nav-labels.test.ts` 的 `titleFile` 表同步删 `/evidence` 行（注释写明深链保留）；五个漂移别名（回测分析 / 探索观测 / 因子工厂 / 全市场选股 / 数据通道）仍为 0。
3. ⌘K 命令面板与侧栏读同一份 `NAV_ITEMS`（14 项），`command-palette.spec.ts` 的数量断言同步更新；A-04 断言 5 不变式不退化。
4. `user-flows.md` §3.2 同步登记：**走向与批量**补进仪器房、**纸交易**补进系统（执行与账户）、证据质问注明「独立入口移除，深链保留」；新增守卫用例断「§3.2 树 ↔ `navItems.ts` 逐项一致」（解析失败必须红，不许静默绿）。
5. 导航三 spec（`nav-consistency` / `command-palette` / `cross-navigation`）更新后全绿；含侧栏的 5 张视觉基线逐张核对 diff 仅在侧栏区域后重录（V-1 `setFixedTime` 纪律）。
6. 破坏验证双向：任一 label 改一个字 → `nav-labels.test.ts` 红，还原 → 绿；§3.2 守卫用例注入一个不存在的条目 → 红，还原 → 绿。

### A-13 实施计划（六字段，2026-11-13 起草）

**① 目标**：侧栏按 §3.2 目标 IA 收敛为 14 项 5 组，证据质问降为深链，⌘K 同源不变，三处标签守卫与 §3.2 一致性守卫全绿 —— 「导航是任务组织不是工具清单」落到机器可核对。

**② 上下文（2026-11-13 当场实测）**

| 事实 | 证据 |
|---|---|
| 现状 15 项 4 组 | `navItems.ts:43–78`：总览 1 / 研究主线 3（含证据质问 :50）/ 仪器房 8 / 监控 3；`/factors` 标签已是「因子证据（已退役）」(:65)，**不是**旧提案的「因子研究」 |
| ⌘K 只读 NAV_ITEMS | `CommandPalette.vue:63` `filterNavItems` ⇒ 删条目自动从 ⌘K 消失，无需第二处改动 |
| 守卫现状 | `nav-labels.test.ts`：`titleFile` 15 行、`items.length ≥ 9` 下限、别名零、NavTiles 同源；`navTestId`/`commandItemTestId` 命名规则(:97–106)不动 |
| §3.2 目标树 | `user-flows.md:119–140`：研究主线含「研究日志（可并入审阅台 tab）」⇒ 不入侧栏（A-12/B-03 承载）；监控含「策略健康（P2 未建）」、系统含「行业与宏观（2026-11-13 裁决 B 仅 API）」⇒ 均不入侧栏 |
| 暂缓前置已满足 | A-04 断言 2/8 暂缓理由「等 F11/A-06」：B-04 ✅ `08e95f1`（2026-11-12）、A-06 ✅（因子证据降级）；主台账子台账开放项表同步改判 |
| 受影响的 e2e | `nav-consistency.spec.ts` / `command-palette.spec.ts` / `cross-navigation.spec.ts` 存在；`visual-regression.spec.ts` 5 张含侧栏 |

**③ 要求（五步，每步一个可独立测试通过的 commit）**

1. **navItems.ts**：删证据质问项、按 ① 的 5 组重排（纸交易移入系统组）；`NAV_GROUPS`/`NAV_ITEMS` 导出形状与 `navTestId` 规则不动；分组注释「四段」改「五段」。
2. **守卫同步**：`nav-labels.test.ts` `titleFile` 删 `/evidence` 行、数量下限由 `≥9` 改 **`≥14`（绝对值，不从现状推导）**；`/evidence` 路由保留的事实写进注释。
3. **e2e 三 spec 更新**：14 项断言、⌘K 14 项、cross-navigation 不再从侧栏点证据质问（深链用例保留）。
4. **§3.2 登记 + 一致性守卫**：`user-flows.md` 补走向与批量 / 纸交易、注明证据质问深链；新守卫用例解析 §3.2 树与 `navItems.ts` 逐项比对（解析失败 = 红）。
5. **基线重录 + 破坏验证**：5 张含侧栏基线逐张看 diff（只允许侧栏区域变化）后重录；断言 6 双向破坏腿真跑。

**④ 约束与非目标**

- **不做**：不删 `/evidence` 路由与页面（A-06 侧滑的深链兜底）；不新增任何导航项（策略健康未建 / 行业与宏观仅 API / 研究日志并入 tab，三者都不进侧栏）；不改任何页面 H1 文案（三处同源是既有事实，本单只动分组与删一项）；不动 `NAV_ITEMS` 导出形状。
- **措辞**：14 个 label 一字不改（除删除证据质问）；五个漂移别名保持 0。
- **不退化**：`NavTiles` 同源守卫、`authGuard` 路由行为、B-02/B-04 页面 e2e 全绿。
- 视觉基线**不得**整批 `--update-snapshots` 盲录 —— 逐张核对 diff 区域（UI-VISUAL-BASELINE-2026-11-12 的判定纪律）。

**⑤ 验收（断言 → 取证方式）**

| 断言 | 取证 |
|---|---|
| 1 14 项 5 组 | 单测断 `NAV_ITEMS.length === 14` 与分组计数 `[1,2,7,1,3]`（绝对值）；`/evidence` 路由仍可达（e2e 深链） |
| 2 三处同源 | `npx vitest run nav-labels` 全绿（真源码解析，非 mock） |
| 3 ⌘K 同源 | `command-palette.spec.ts` 真浏览器 14 项 |
| 4 §3.2 一致 | 新守卫用例真跑；注入不存在条目 → 红 → 还原绿 |
| 5 三 spec + 基线 | 三 spec 全绿（真栈）；5 张基线重录后连跑两轮绿 |
| 6 破坏验证 | label 改一字 → 红 → 还原绿（真跑，记录退出码） |

**⑥ 边界**：只做 `navItems.ts` + `nav-labels.test.ts` + 三 e2e spec + `user-flows.md` §3.2 + 基线；页面内容不动；A-04 断言 2/8 的台账改判同步落主台账开放项表（本单 commit 内）。

**落地（2026-11-13）**
- **navItems.ts**：删除「证据质问」独立入口，重排为 **5 组 14 项**（总览 1 / 研究主线 2 / 仪器房 7 / 监控 1 / 系统 3），纸交易从仪器房移入系统；`NAV_GROUPS`/`NAV_ITEMS` 导出形状、`navTestId`/`commandItemTestId` 命名规则与其余 13 个 label 一字未动（共 14 个 label，仅删 1 项）。
- **守卫同步**：`nav-labels.test.ts` 新增「14 项 5 组、分组计数 `[1,2,7,1,3]`、组名数组」绝对值断言；数量下限由 `≥9` 改 `≥14`；`titleFile` 删 `/evidence` 行并注释「路由与页面保留作深链兜底」；新增 `navTreeFromDoc()` 解析 §3.2 代码块（解析失败 throw，**不静默返回空数组**）与「§3.2 ↔ navItems.ts 组/序/label/path 逐项一致」用例。
- **§3.2 文档**：重写为目标 IA 的 14 项 5 组 ASCII 树，抬头声明它是「机器可核对真相源」；补「未入侧栏」表（证据质问深链保留 / 研究日志并入审阅台 tab / 策略健康 P2 未建 / 行业与宏观仅 API / copilot 与 strategy-builder 为别名）。**格式订正**：`因子证据（已退役） Factors` 补一个空格，与其余「中文 English」行一致 —— 否则按空白切 label 会把英文词粘进中文标签（首跑即因此红）。
- **e2e 四 spec**：`nav-consistency` 的 ROUTES 去掉 `/evidence`、条目数断言由 `≥9` 改 **`=14`（绝对值）**、新增「`/evidence` 深链可达 + 侧栏无该入口」独立用例；`command-palette` 15 → 14（含抬头注释）；`dashboard.spec` 的侧栏条目清单 15 → 14（**收口自查补漏**：条目只点了三个 spec，但控制台用例也钉了 15 项，实跑 1 failed 后同步）；`cross-navigation` 复核未从侧栏点证据质问，未改。
- **视觉基线**：只重录 **5 张桌面基线**（dashboard / dashboard-sidebar / backtest / stock-screener / data-sync）。逐张用像素坐标核算：差异 bbox 全部落在侧栏（`x≤210`、`y≥219`），主内容区 0 px；重录后连跑两轮 **5 passed**。
- **未重录的两张（如实登记）**：`dashboard-mobile` / `backtest-tablet` 的 diff 含页头区域。把 `navItems.ts` 临时还原到 HEAD 后仍红（**767 / 1003 px**），证明页头差异是 **V-2 既存测试债**（盲等 race + 页头内容漂移），与 A-13 无关；按约束不借重录消除，也不放宽断言，留给 V-2。本次改动贡献的部分（侧栏图标/条目）约 1050 / 1139 px。
- **验证**：`npx vitest run src/components/layout/nav-labels.test.ts` → **9 passed**；四 e2e spec 真栈实跑 → **26 passed**（nav-consistency 5 / command-palette 5 / cross-navigation 7 / dashboard 9）；5 张重录基线连续两轮 → **5 passed ×2**；`npm run typecheck` **EXIT=0**；`npx eslint`（触及文件）**EXIT=0**。
- **破坏验证（真跑，记录退出码）**：① `策略库` → `策略库X` ⇒ **4 failed / EXIT=1**（§3.2 一致性 + 三处同源全红），逐字还原 ⇒ **9 passed / EXIT=0**；② §3.2 注入 `幽灵页 Ghost ← /ghost` ⇒ **1 failed / EXIT=1**，还原 ⇒ **9 passed / EXIT=0**。

## A-14 候选卡三要素补齐：六维微条 + 质疑分级 + 证据质问（设计报告 S5）　✅ 已收口（2026-11-13）

> 来源：2026-11-13 UI/UX 改进报告样图 C · 依赖：无（G2/G3/G4 已落地，verdict 契约已在 `api/explore.ts`）。
> **前提订正（2026-11-13，起草时实测）**：报告样图 C 含「路径缩略图（PathSparkline）」，
> **本单不做** —— `AttemptView`（UI 类型与 agent wire `docs/api-schema.md:89` 双侧核对）
> **没有权益路径字段**，G1 缺口表明确列「路径缩略图数据」未提供。画它只能造假数据，
> 违愿景原则 4。**该项归 G1**：后端补字段后另立单，不在本单夹带。
> 本单只做**今天数据支撑得起**的三要素：六维微条、质疑分级、Sharpe 证据质问。

1. 候选卡渲染六维微条：按 `DIMENSION_ORDER` 固定六维顺序（`api/explore.ts`），每维显示 assessed 值；`unassessed` 维显式标「未评估」并触发一票否决提示，**不画成 0 分**；综合概率用 `assessedProbability`（min 口径），与卡片现有 `P` 标签同值。
2. 质疑清单按 severity 分组：**blocking 在前**、warning 次之、note 最后，组内保持原序；空清单显示「无质疑」而不是空白；分级标签与 `InterventionBar` 现有措辞一致。
3. Sharpe 数字旁挂 `EvidenceProbe`（`components/evidence/EvidenceProbe.vue`）：`hash=null`（今天恒 null，`AttemptView` 无证据坐标字段）→ 点击前屏幕上就显示「无法回溯」，同 `MetricsCards.vue:6–14` 先例（如实标注，不是占位）；**不造假 hash**。
4. 失败尝试（`ok=false`）不渲染裁决微条与概率（K9/B-01 断言 5 同源），只显示失败原因；`verdict` 缺席的成功尝试显示「无裁决」而不是 0 分。
5. 现有排序 / 采纳 / 四干预不退化：`rankAttempts`（`utils/review.ts`）不动，`review-desk.spec.ts` 与 `ReviewDesk.test.ts` 全绿。
6. 破坏验证：把 `unassessed` 维渲染成 0 → 断言 1 用例红，还原 → 绿；把 blocking 排到 note 后 → 断言 2 用例红，还原 → 绿。

### A-14 实施计划（六字段，2026-11-13 起草）

**① 目标**：审阅台候选卡从「一个 P 值 + 平铺质疑」升级为「六维微条 + 分级质疑 + 可质问的 Sharpe」，每个视觉元素都能指到 verdict 契约的一个字段或明写「无法回溯 / 无裁决」。

**② 上下文（2026-11-13 当场实测）**

| 事实 | 证据 |
|---|---|
| verdict 契约已就绪 | `api/explore.ts`：`Verdict{dimensions,unassessed?,probability,weakest?,geometric_mean,blocking,challenges,causal?}`；`DIMENSION_ORDER` 固定六维；`assessedProbability`(:81) min 口径 + unassessed 否决；`weakestDimension`(:91) |
| 路径数据**不存在** | `AttemptView{seq,hypothesis,params,experiment_id,sharpe,ok,error?,verdict?}` 无权益路径；agent wire（`tellurion-agent:docs/api-schema.md:89`）同样没有 ⇒ PathSparkline 归 G1，本单不做 |
| 证据坐标**不存在** | `AttemptView` 无 evidence hash 字段 ⇒ `EvidenceProbe :hash="null"` 恒「无法回溯」；先例 `MetricsCards.vue:6–14`（注释：「回测指标今天一律没有坐标…那是如实标注，不是占位」） |
| 宿主现状 | `ReviewDesk.vue:30–89` ranked-list：P 标签 + `challengesOf` 平铺列表（无分组）+ 平台面积/因果强度/综合分；`utils/review.ts` 的 `rankAttempts` 是排序真相，不动 |
| 质疑分级契约 | `Challenge{dimension,severity,message}`，severity ∈ blocking/warning/note（`api/explore.ts`） |

**③ 要求（四步，每步一个可独立测试通过的 commit）**

1. **六维微条组件**：新建 `components/review/VerdictBars.vue`，props 收 `Verdict`；按 `DIMENSION_ORDER` 渲染，unassessed 维「未评估」+ 否决提示；纯展示，概率计算仍走 `assessedProbability`（不在组件里重算）。
2. **质疑分组**：`challengesOf` 输出按 severity 分组（blocking → warning → note），组内原序；空态「无质疑」。
3. **EvidenceProbe 接线**：Sharpe 标签旁挂 `<EvidenceProbe :hash="null" …>`，label 写明「Sharpe 证据」；点击行为复用现有侧滑（A-06），不新增路由。
4. **失败/缺席态 + 破坏验证**：`ok=false` 不渲染微条；`verdict` 缺席显示「无裁决」；断言 6 双向破坏腿真跑；候选卡视觉基线重录（V-1 纪律）。

**④ 约束与非目标**

- **不做**：PathSparkline（G1 缺数据，carved out 见上方订正）；不改 `rankAttempts` 排序口径；不改 `assessedProbability` 的 min/否决语义；不造假 hash / 假路径；不引入新依赖。
- **措辞**：「未评估」≠「0 分」；「无法回溯」是如实标注不是错误态；失败尝试不出现任何裁决数字（K9）。
- **不退化**：B-02 采纳弹窗（理由 + 概率快照缺一不可）、`InterventionBar` 四干预、`review-desk.spec.ts` 全绿。
- 大对象 `shallowRef`；字符串不夹 markdown。

**⑤ 验收（断言 → 取证方式，写清哪条用真数据、哪条只能 mock）**

| 断言 | 取证 |
|---|---|
| 1 六维微条 | 单测（fixture verdict：六维全 assessed / 含 unassessed / 全 unassessed 三态）；真后端 e2e 一条（真 run 的 verdict 形状） |
| 2 质疑分组 | 单测（乱序输入 → blocking 在前，反例断言）；空清单 → 「无质疑」 |
| 3 EvidenceProbe | 单测断 `hash=null` 时屏幕文本含「无法回溯」（真组件渲染，非 mock）；e2e 点击开侧滑 |
| 4 失败/缺席态 | 单测两条（`ok=false` 无微条；verdict 缺席 → 「无裁决」） |
| 5 不退化 | `review-desk.spec.ts` + `ReviewDesk.test.ts` 全绿（真栈 + 单测） |
| 6 破坏验证 | unassessed→0 红 / blocking 排后红，各还原绿（记录退出码） |

**⑥ 边界**：只做 `VerdictBars.vue` + `ReviewDesk.vue` 卡片区 + 对应单测/e2e；路径缩略图归 G1（后端补字段后另立单）；排序与概率口径不动。

**落地（2026-11-13）**
- **六维微条**：新建 `components/review/VerdictBars.vue`（props `Verdict | null`）：按 `DIMENSION_ORDER` 固定六行；`unassessed` 或非数值维在轨道上写「未评估」并**不渲染填充条**（避免贴底条被读成 0 分），附否决提示「未评估维度行使否决权」；纯展示，概率仍取卡片 `assessedProbability`（P 标签未改口径）。填充色用 `--q-series-1`（`--q-primary` 明令不可作填充）。
- **质疑分组**：`utils/review.ts` 新增 `SEVERITY_ORDER` + `groupChallenges()`（blocking → warning → note，丢空组，组内原序）；`ReviewDesk.vue` 卡片改为分组标题 + 组内条目，空清单显示「无质疑」。分级措辞沿用卡片既有 `severityLabel`（阻断/警告/提示）——`InterventionBar.vue` 本身没有 severity 文案，无「现有措辞」可对齐，故以本页既有措辞为准。
- **证据质问**：Sharpe 标签拆为独立 tag，旁挂 `<EvidenceProbe label="Sharpe 证据" :hash="null" reason="AttemptView 尚未携带证据坐标（content_hash），属于 G1 数据缺口" :value="Sharpe …" />`，点击前即显示「无法回溯」，侧滑复用 A-06，不造假 hash。
- **失败/缺席态**：`ok=false` 不再渲染 Sharpe/P/微条，只显示「失败原因：<error 或 未给出原因>」；`ok=true` 且无 `verdict` 显示「无裁决」。
- **测试**：`VerdictBars.test.ts` 4 例（六维全 assessed / 含 unassessed / 全 unassessed / verdict 缺席）；`utils/review.test.ts` +3 例分组；`ReviewDesk.test.ts` +5 例（失败态无裁决数字、无裁决、探针无法回溯+侧滑、分组顺序、无质疑），原 B-02/A-12 断言未放宽；e2e `review-desk.spec.ts` +2 例（fixture 真形状六维/未评估/失败态、探针点击开侧滑）。
- **破坏验证（真跑，记录退出码）**：① `isAssessed` 去掉 unassessed 判断（相当于把未评估画成评估值）⇒ `VerdictBars.test.ts` 1 failed / EXIT=1，还原 ⇒ 4 passed；② `SEVERITY_ORDER` 改成 note→warning→blocking ⇒ `review.test.ts` 1 failed / EXIT=1，还原 ⇒ 10 passed。
- **验证**：`npx vitest run src/utils/review.test.ts src/components/review/VerdictBars.test.ts src/pages/ReviewDesk.test.ts` → 26 passed；A-14 e2e 真栈实跑 2 passed；`npm run typecheck` EXIT=0；`npx eslint`（触及文件）0 error。
- **偏离说明**：① ⑤ 表要求「真 run 的 verdict 形状」e2e——core `:8085` 共享限流下真跑探索会 429、套件无真 run 可复用（B-02 抬头同款限制），故用 route fixture 逐字段对齐 `Verdict` 取证，测试名与注释均写明 mock；真数据那条留待 G1/限流解除。② ④ 要求「候选卡视觉基线重录」——`visual-regression.spec.ts` 无 `/review` 基线，无图可录，本单未新增基线。

## A-15 晨间简报：控制台首屏改为三节奏入口（设计报告 S4）　✅ 已收口（2026-11-13）

> 来源：2026-11-13 UI/UX 改进报告样图 A · 依赖：**A-12**（校准 tab 深链）/ **A-13**（审阅台入口）/
> **A-14**（候选卡组件复用）· 三单收口后开工。
> 定位：主任「看摘要 5 分钟」节奏的落点 —— 打开控制台第一屏就知道「今天该审什么、上次声称的把握命中没有、有没有失败需要处置」，而不是先看到一堆工具磁贴。

1. `Dashboard.vue` 首屏新增「晨间简报」区（`MarketMetrics` 之上）：待审阅数（`getReviewPending`）+ 最近 run 摘要（`rankAttempts` 前 3）+ 校准误差一行（`getCalibration`，链接到 `/review?tab=calibration`）+ 失败 run 警示（K9 三态）。
2. 待审阅数三态如实：`pending` 为数字 → 显示；`pending=null`（任一源不可用）→ 「—」+ 不可用源名（`api/review.ts` 契约：不做部分求和）；无配置源 → 「—」。**不画成 0**。
3. 最近 run 摘要复用 A-14 的 `VerdictBars` 与 `utils/review.ts::rankAttempts`（不自造排序）；每条带「去审阅」深链 `/review?run=<id>`；失败 run 显示失败原因、**不渲染裁决**。
4. 校准一行只读 `calibration_error` + `sample_size`，n<30 标「样本不足」；点击跳 A-12 深链；`getCalibration` 失败 → 「读面未接通」，不画成 0。
5. 现有 `MarketMetrics` / `QuickBacktest` / `NavTiles` / `ConsoleHistory` / `EmergencyFlatten` 五块**保留且不退化**（简报是新增首屏区，不是删功能）；`dashboard.spec.ts` 现有用例全绿。
6. 破坏验证：把 `pending=null` 渲染成 0 → 断言 2 用例红，还原 → 绿；dashboard 视觉基线重录（V-1 纪律，简报区用 fixture 冻结，避免活数据不可复现 —— 同 V-3 教训）。

### A-15 实施计划（六字段，2026-11-13 起草）　✅ 已收口（2026-11-13）

**① 目标**：控制台首屏成为「三节奏」入口 —— 待审阅 / 最近候选 / 校准误差 / 失败警示四块，每个数指到一条真端点或明写「— / 读面未接通」，主任 5 分钟看完知道今天该审什么。

**② 上下文（2026-11-13 当场实测）**

| 事实 | 证据 |
|---|---|
| 宿主页现状 | `Dashboard.vue`：MarketMetrics(:3) / QuickBacktest(:12) / NavTiles(:24) / ConsoleHistory(:26) / EmergencyFlatten(:38)；无简报区 |
| 待审阅契约 | `api/review.ts`：`ReviewPending{pending:number\|null,as_of?,sources[]}`；注释明写「pending 只有在所有源都答话时才是数字…UI 必须保留『—』这一态」 |
| 排序复用 | `utils/review.ts::rankAttempts`（高原面积 × 因果强度，B-02 已破坏验证）；A-14 的 `VerdictBars` 组件 |
| 校准复用 | A-12 的 `getCalibration` 消费层与深链 `/review?tab=calibration` |
| 视觉基线教训 | V-3：活后台状态不可复现 ⇒ 简报区 e2e/基线用 route 拦截 fixture 冻结（`setFixedTime` + 固定 pending/run 数据），真后端只验「—」态与错误态 |

**③ 要求（四步，每步一个可独立测试通过的 commit）**

1. **简报组件**：新建 `components/dashboard/MorningBriefing.vue`，四块布局；数据层复用 `getReviewPending` / `getExploreStatus`（最近 run）/ `getCalibration`，不在组件里造第二份 API。
2. **三态与错误态**（断言 2/4）：pending 三态、校准失败「读面未接通」、失败 run 警示（K9）。
3. **深链与复用**（断言 3）：「去审阅」跳 `/review?run=<id>`；校准行跳 A-12 深链；`VerdictBars` 直接 import A-14 组件。
4. **基线 + 破坏验证**：dashboard 基线重录（简报区 fixture 冻结）；断言 6 破坏腿真跑；`dashboard.spec.ts` 新增简报用例（真后端「—」态 + fixture 数字态）。

**④ 约束与非目标**

- **不做**：不删现有五块；不新增端点；不做写操作（简报只读）；不引入新依赖；不在简报里做「AI 推荐」措辞（校准是估计不是裁决）。
- **措辞**：「—」≠ 0；「读面未接通」≠「没有数据」；失败 run 不出现裁决数字。
- **不退化**：`dashboard.spec.ts` / `NavTiles` 同源守卫 / `EmergencyFlatten` 二次确认 e2e 全绿。
- 大对象 `shallowRef`；DOM 访问前 `await nextTick()`；字符串不夹 markdown。

**⑤ 验收（断言 → 取证方式，写清哪条用真数据、哪条只能 mock）**

| 断言 | 取证 |
|---|---|
| 1 四块首屏 | e2e fixture（冻结 pending/run/calibration）断四块可见；真后端一条验「—」态 |
| 2 pending 三态 | 单测三条（数字 / null+源名 / 无源）；真后端 e2e（当前栈无配置源 ⇒ 「—」是唯一真态） |
| 3 深链 + 复用 | e2e 点击「去审阅」落 `/review?run=…`；单测断 `VerdictBars` import 自 A-14 |
| 4 校准一行 | 单测（n<30 标注 / 失败 → 读面未接通）；fixture e2e |
| 5 不退化 | `dashboard.spec.ts` 全绿（真栈） |
| 6 破坏验证 + 基线 | null→0 红 → 还原绿；基线连跑两轮绿（fixture 冻结，记录退出码） |

**⑥ 边界**：只做 `MorningBriefing.vue` + `Dashboard.vue` 首屏区 + 对应测试；A-12/A-13/A-14 的产物只复用不改动；简报数据冻结策略落 V-3 同款注释。

**落地（2026-11-13）**
- **组件**：新建 `web/src/components/dashboard/MorningBriefing.vue`，四块（待审阅 / 校准误差 / 失败警示 / 最近一轮候选）+ 候选区；数据只调 `getReviewPending` / `getCalibration` / `getExploreStatus`，排序直接复用 `utils/review.ts::rankAttempts` 取前 3，不另造第二份口径；`Dashboard.vue` 在 `MarketMetrics` 之前插入 `<MorningBriefing />`，原五块一字未动。
- **三态与错误态**：`pending !== null` 照抄数字；`null + 有源` 写「—」+「不可用源：…（不做部分求和）」；`null + 无源` 写「—」+「无配置源」；读面失败写「读面未接通（不按 0 计）」。校准读面失败同样「读面未接通」，`n<30` 标「样本不足，仅供参考」。
- **失败警示的取舍（K9）**：后端 `ExploreStatus` 无 K9 的 `completed/invalid/failed` 字段（只有 `running/stopped/attempts`），因此按两个可判信号如实呈现：`stopped` → 「本轮被叫停」；存在 `ok=false` → 「N 次尝试失败」+ 示例原因；两者皆无 → 「无失败尝试」。**没有**用 `running=false` 反推「已完成」——那正是 K9 禁止的「以缺省判成功」。
- **深链与复用**：候选卡「去审阅」→ `/review?run=<id>`、校准行 → `/review?tab=calibration`；`VerdictBars` 直接 `import` A-14 组件（单测以源码守卫钉住）。**一处必要的越界**：原 `ReviewDesk.vue` 只读 `ql.lastRunId`、不认 `?run=`，深链会落到另一轮 —— 为让断言 3 的链接真的生效，`ReviewDesk` 初始化改为「`?run=` 优先、否则回落到本地指针」（单测 +1 例）。这改变了 A-12/A-14 的宿主页一行，但未改其任何展示口径，属「最贴近原意的必要实现」。
- **测试**：`MorningBriefing.test.ts` 9 例（四块 / pending 三态 / 读面失败 / 校准两态 / 排序非 Sharpe 非 seq / 失败候选只给原因 / 深链 href / VerdictBars 复用源码守卫 / 无 run 空态）；`ReviewDesk.test.ts` +1 例；`dashboard.spec.ts` +2 例（真栈读数态 + fixture 三态与深链点击）。
- **真栈事实订正**：⑤ 表假设「当前栈无配置源 ⇒ 『—』是唯一真态」，实测**不成立**：`GET /api/review/pending` 的 `ai_explore` 源为 `available`、`pending=0`，校准 `sample_size=0`。故真栈用例断言「数字或 —，且 — 必附原因」，不把真实 0 硬改写成 —；未知态由 fixture + 单测覆盖。取舍已按「不伪造读数」记录。
- **基线**：`dashboard-chromium-win32.png` 重录。diff 35446 px 经图像核对为顶部新增简报区 + 其下内容整体下移，侧栏区域与 A-13 重录后一致无新差异；连跑两轮 **1 passed ×2**。`dashboard-mobile` 未重录（仍为 V-2 既存债，页头差异与本次无关）。
- **验证**：`MorningBriefing.test.ts` **9 passed**；`ReviewDesk.test.ts` + `palette.test.ts` 同批 **60 passed**；`dashboard.spec.ts` + `review-desk.spec.ts` 真栈 **21 passed**；`npm run typecheck` **EXIT=0**；`npx eslint`（触及文件）**EXIT=0**。
- **破坏验证（真跑）**：`pending=null` 回退成 `'0'` ⇒ **2 failed / EXIT=1**（三态用例 + 读面失败用例同时红），逐字还原 ⇒ **9 passed / EXIT=0**。
- **commit 拆分取舍**：③ 写「四步各一 commit」，实际合为 1 个 commit —— 四步改的是同一文件同一段（组件骨架、三态、深链、基线/测试），拆开的中转态无法独立变绿；与 A-12/A-14 的单 commit 惯例一致，特此记录。

---

# 分组 B · 🔴 延后（依赖 ai-service 或后端缺口）

> **主任裁决（2026-10-13）**：ai-service 后端会做、目前没有 ⇒ 相应前端先不做，挂计划。
> **已知阻塞细节**：`ai-service` 当前**镜像构建失败** —— agent 仓 `go.mod` 与 import 不同步，报 `updates to go.mod needed; go mod tidy`。这是存量问题，`go mod tidy` 会改依赖文件，属 Ask First。**看起来一条命令可解，但按裁决不擅自执行。**

## V 组：视觉基线可复现性（A-03 重生成基线时撞出，2026-10-14）

> **归属交叉引用**：本组是 **e2e 测试债**，与 [`docs/TASKS.md`](../../TASKS.md) 的 **AUD-61**
> （e2e 套件与前端结构脱节，声明"本文件为 AUD-61 唯一归属地"）同源。此处只保留**设计重构
> 视角需要的东西**（基线必须可复现，否则 A-04~A-11 没有回归网）；V-2/V-3 的**执行登记与
> fixme 记账一律落在 AUD-61 那张表里**，不在本文件重复登记 —— 两处各记一份必然漂移。

> 为什么单列：这三条不是设计问题，是**测试基础设施**问题 —— 基线不可复现意味着后面每一个
> 改颜色的任务（A-04~A-11）都没有可信的回归网。V-1 已在 A-03 内修掉，V-2/V-3 需要设计决策，
> 不并进扫页 commit。

1. **V-1 ✅ 已修**：`AppHeader` 的秒级时钟被烙进全页基线 → `beforeEach` 用 `page.clock.setFixedTime(2026-05-06T10:30:00)` 冻结。**判据**：`npx playwright test tests/visual-regression.spec.ts` 连跑两轮全绿（当前 10/12，剩余 2 张红因 V-2/V-3）。
2. **V-2 待办**：`dashboard-mobile` / `backtest-tablet` 用 `waitForTimeout(500)` 盲等，慢的一次在历史列表落地前就截图（实测基线有"20 条记录"、实跑渲染"暂无回测历史"）。改成**等终态**：`条记录` 与 `暂无回测历史` 二者其一可见即可。**禁止**用加大延时解决 —— 那只是把 race 的概率调低。
3. **V-3 待办**：`data-sync` 页渲染的是**活的后台状态**（纳秒时间戳作业 ID `ohlcv_all_aud49_17919266933509689000`、近期任务列表随状态变、数据源限流告警时有时无），全页基线原理上不可复现。二选一并说明理由：(a) `toHaveScreenshot({ mask: [...] })` 遮掉同步状态卡与告警条；(b) 给视觉测试一套固定 fixture 后端。**不得**删该页基线或断言了事。
4. 三条收口后，**12/12 连跑三轮全绿**才算 V 组完成（两轮不够 —— race 的漏检率就是这么量出来的）。

## B-01 `explore` 改造：三栏观察 + 路径回放（F1/F4）　✅ **2026-11-12 关账**（`416d598`，只补断言 3 用例，不重做页面）

1. 页面消费 `ai` `POST /api/explore/runs` / `GET /runs/:runID` / `POST /runs/:runID/stop` 三条端点，全部真实可达（**2026-11-12：ai-service 已在 `127.0.0.1:8086` healthy，原「未运行」阻塞解除**；G9 已证伪）。
2. 三栏数据源是**轮询**，不是推送；订阅层与 A-08 的 SSE 共用同一抽象接口。
3. F4 回放按 `seq` **升序**渲染尝试序列，且存在一条用例断言"非插入顺序"——`api/explore.ts::orderAttemptsBySeq`，`explore.test.ts` 用 `[3,1,2] → [1,2,3]` 且断言不改入参；破坏验证：去掉 `sort` 后 received `[3,1,2]` 红。
4. "被叫停"与"跑满"在回放与摘要中显著区分（`ExploreStatus.stopped`），有一条用例比对二者文案。
5. 失败的尝试不渲染裁决（同 A-05 第 5 条）。
6. 解锁前置：ai-service 可构建 + `/api/explore/*` 补进 `openapi.yaml`（缺口 **G7**）。

## B-02 审阅台（F2/F3/F5/F7，P0 新页）　✅ **2026-11-12 完成（近似版）**（`efc6cef`，页面 `/review`）

1. 摘要排序按**高原面积 × 因果强度**，不是按 IC；`utils/review.ts::rankAttempts`，`review.test.ts` + `ReviewDesk.test.ts` 用反例断言（Sharpe 2.0 孤峰不排第一，1.5 平台三项优先），破坏验证已做。
2. 候选卡三要素齐备：路径缩略图（**不是**收益曲线）、质疑清单（blocking/warning/note 分级）、概率估计（注明最弱一环）。
3. 摘要聚合数据源为后端缺口 **G1**；**2026-11-12 订正：G1 的聚合读面 `GET /api/review/pending` 已实现（core `openapi:3331`），但派生量（高原面积 / 因果强度）仍未提供** ⇒ 前端继续用 attempts+verdict 近似聚合，页面顶部 `approx-banner` **显式标注"近似"**。
4. 四干预入口一致（同 A-05/B-01 的候选卡、结果流行、回放页三上下文）；指方向/追问/标记三条为 **G2/G3/G4**，**2026-11-12 已由 agent 实现并经 core 反代**，前端接真端点（`InterventionBar.vue`）。
5. 采纳动作必须采集**理由（自由文本）+ 概率快照**，缺任一不可提交（F7/S6）。
6. 被叫停的 run 与跑满的 run 在列表中不混排无差别（F2 异常条款）。

## B-03 研究日志与采纳台账（F7）

1. 台账数据源是采纳记录端点（缺口 **G6**）；未就绪前不落库、不假装可写。
2. 任一采纳可回溯 `run → experiment → 证据链`，有一条端到端用例。
3. "月度采纳率"等聚合数标为**近似**或来自 G6 真实端点，二者必居其一，不静默估算。
4. 稿上的 Merkle Root / 冷密钥签名 / Git Snapshot / 投委会 PDF 导出**全部不实现**（幻觉项），grep 为 0。
5. 导出仅 `html`（`openapi:285` 明写），不出现 xlsx/pdf 选项。
6. 解锁前置：**G6** 采纳记录落库（含理由与概率快照两列）。

## B-04 策略库合并（F11）的 Copilot 腿　✅ **2026-11-12 完成**（`08e95f1`，`/strategy-lab` 三 tab；旧路径保留路由别名）

1. 三页合一（`strategy-lab` + `strategy-builder` + `copilot`）的 tab 结构已落地（`StrategyHub.vue`）；**Copilot tab 依赖 ai-service**，页面用 `copilot-dependency` 写清依赖，不假装可用。
2. 策略 CRUD 走 `core` `/api/strategies*` 两条端点，可做。
3. 生成代码 artifact 是 **Go + 表达式**，不出现 Python 类、`AlphaStrategy`、`resample('5min')`、`.qpkg`（ADR-024 三重违例），grep 为 0。
4. "沙箱编译通过"展示为可审阅 artifact 状态，**不加载不执行**，失败不阻断（ADR-024）。
5. Copilot 产出文案为"可证伪主张 + 证据 + 存疑项"，不出现"AI 推荐的策略"。
6. 解锁前置：ai-service 运行 + `POST /api/copilot/generate` 轮询契约可用。

## B-05 因子研究页的 AI 腿（F12）

> **⚠️ 2026-11-12 订正（归口由 analytics 改为 core）**：原文「IC / 十分位收益的真相源在 **analytics**（`ic_analysis` / `factor_returns`，ADR-037）」**不成立**：跨仓裁决把这两张派生表划归 **core**（`tellurion-docs:docs/adr/adr-038-factor-derived-tables-ownership.md`），且 **analytics 全仓没有因子读端点**（grep 为 0）。core 侧 `/api/factors/{name}` 已退役（410）、`/api/factor*` 读面不存在，对应主台账 `UI-FACTOR-CITATION-RETIRED`。**B-05 维持挂起，UI 保留 disabled**；本条改为 **core 的后端任务指针**：`tellurion:docs/TASKS.md` §三 C3 → `CORE-FACTOR-DERIVED-GUARD`（派生表守卫已 ✅，但未提供读面）。重开条件：core 新增因子列表 / IC / 分位收益读面并新立单，且主台账 `UI-FACTOR-CITATION-RETIRED` 收口。

1. ~~因子列表 / IC / 十分位收益 / 计算触发全部走 `core` `/api/factor/*` 5 条端点 —— **这部分现在就能做**。~~（见上方订正：端点已退役 / 不存在，**归口 core**，需等 core 提供读面）
2. 六维裁决面板复用 A-05 组件，不自造。
3. "变异建议 / 一键派生变异"依赖基因池与 ai 层，延后；界面画 disabled。
4. 不实现 Polars / Parquet / L2 分区 / Barra CNE6（栈错位与幻觉项），grep 为 0。
5. `VERIFIED` 二值徽标不出现，改综合概率 + 最弱项。
6. 因子证据坐标并入因子详情（`/factors` 独立页降级为深链兜底），现有 `FactorCitation` 测试不退化。

## B-06 指方向 / 追问 / 标记 三干预（G2/G3/G4）　✅ **2026-11-12 完成**（`efc6cef`，`components/review/InterventionBar.vue`）

1. 三条端点在后端存在并可调用——**2026-11-12 订正：G2/G3/G4 已实现**（agent `cmd/ai/handlers_explore.go:227-231`，契约 `tellurion-agent:docs/api-schema.md` §1.1；core 反代 `openapi.yaml:3926/3942`）。前端接真端点，不再画 disabled。
2. 三者在候选卡、结果流行、回放页三个上下文入口一致。
3. "追问"入口挂在**被放弃的尝试**上，不是只挂在成功候选上（F3 UX 要点）。
4. 每条端点有契约测试，且补进 `openapi.yaml`（连带收 G7）——契约测试在 agent 仓；core openapi 已以通配收录 `/api/explore`。
5. 前端从 disabled 转可用时，**只改状态位、不改结构**——`InterventionBar.test.ts` 对比两态下 `[data-testid]` 集合与标签名完全一致，仅 `disabled` 位不同。
6. 解锁前置：~~G2/G3/G4 后端实现~~ **已解除**。

---

# 分组 C · 后端缺口台账（UI 依赖，归 core/agent 侧修）

| # | 缺口 | 阻塞的 UI | 状态 |
|---|---|---|---|
| G1 | 摘要聚合 API（高原面积×因果强度排序、路径缩略图数据） | B-02 | **部分已落地（2026-11-12）**：聚合读面 `GET /api/review/pending` 已实现（`openapi.yaml:3331`，`pending` 仅在全部源可用时为数字）；**派生量（高原面积 / 因果强度）仍未提供** ⇒ B-02 用近似 |
| G2 | 指方向（run 续跑注入约束） | B-06 | **已落地**：`POST /api/explore/runs/{runID}/steer`（agent `handlers_explore.go:227`；core 反代 `openapi:3926`） |
| G3 | 追问（针对被放弃方向的问答） | B-01 / B-06 | **已落地**：`POST .../attempts/{seq}/ask`（同上） |
| G4 | 标记（派生子 run / 提升权重） | B-06 | **已落地**：`POST .../attempts/{seq}/mark`（同上） |
| G5 | 实验日志深查询 | B-01 | `GET /api/explore/runs/{id}` 基本够用 |
| G6 | 采纳记录（决定 / 理由 / 概率快照） | B-02 / B-03 + **成功指标测量** | **已落地**：`POST /api/pipeline/adoption` + `GET /api/pipeline/calibration`（`tellurion-agent:docs/api-schema.md` §1.3） |
| G7 | `/api/explore/*`、`/api/tools/*` 未入 openapi 契约 | B-01~B-06 | **部分已收（2026-11-12）**：core openapi 已以通配收录 `/api/explore`、`/api/explore/{path}`、`/api/tools`、`/api/tools/{path}`（`openapi.yaml:3926/3942/3960/3975`）；契约权威仍在 agent `api-schema.md` |
| G8 | 行情侧推送 | — | **明确不做**（ODR-066 B3）；sync 作业 SSE 已存在 |
| **G9** | ~~ai-service 镜像构建失败（`go mod tidy`）~~ **已证伪（2026-11-12）**：ai-service 镜像可构建，本机全栈下 `ai-service` 在 `127.0.0.1:8086` healthy 运行 | ~~整个分组 B~~ 分组 B 的真实前置改为 **G7 契约缺口 + B-05 因子读面缺失 + promote 闸门 a 腿裁决** | **不再是缺口**；分组 B 仍挂起，但理由已换成上面三条 |

---

## 执行顺序建议

```
A-01 → A-02 → A-03   （调色板扫页，一次一页，每页独立 commit + 基线重生成）
A-04                 （导航/顶栏统一 —— 后续所有新页都依赖它）
A-05 → A-06 → A-07   （三个横切组件，新页复用）
A-08 → A-09          （两个"整屏重做"，收益最大）
A-10 → A-11          （补屏与字体）
A-12 → A-13 → A-14   （2026-11-13 设计细化批：校准 tab / 导航收敛 / 候选卡三要素，三者可并行，无互相依赖；均 ✅ 已收口）
A-15                 （晨间简报，✅ 前置 A-12/A-13/A-14 已收口，✅ 2026-11-13 收口）
分组 B               ← B-03 可开工（G6 已落地，接 A-12 的 tab 骨架加第三 tab）；B-05 仍挂起（core 因子读面）
```

## 更新记录

| 日期 | 变更 |
|---|---|
| 2026-10-13 | 初版：11 个可做任务 + 6 个延后任务 + G9 新登缺口，每任务 6 条可判定断言。分组 B 依主任裁决挂起（ai-service 后端未就绪） |
| 2026-10-13 (2) | **A-01、A-02 完成并逐条取证**。三处台账修正与一处扩标准：① 断言 7 新增（**"grep 零命中 ≠ 主题化完成"**，Chart.js 库默认色是第三类来源，实测 `#666` 1397px→1px）；② A-01/A-02 的 visual 基线断言由"待办"改判 **N/A**（12 张快照不含 compare 与 login —— "没基线"≠"基线待更新"）；③ A-02 断言 4 标为**部分取证**并写明 skip 的真实原因（开放访问下 authGuard 正确弹回，重定向逻辑由 `authGuard.test.ts` 覆盖）；④ 新增 `CSS 变量引用完整性` 两组**棘轮基线**守卫（悬空引用 / 旧值兜底，集合相等双向红，破坏验证已做），上线即抓到 **6 条存量悬空引用 + 8 处失效兜底**，已列为 A-03 强制工作清单 |
| 2026-10-14 | **A-01/A-02 自审复盘**，两处问题直接修掉：① 扫页判据全按 **hex** 抓 ⇒ `rgba()` 形式旧色全程不可见，其中包含**每页都渲染**的侧栏激活态。新增断言 8 + `RETIRED_RGBA_BASELINE` 守卫（废弃 hex 表→RGB 三元组，匹配任意 `rgba?(r,g,b,…)`），并补录 **7 处**进 A-03 工作清单。**清单本身也必须机器生成** —— 我第一版手抄 grep 成 6 条，脚本实测 7 条。破坏验证双向已做（注入红 / 不记账红 / 还原 36 绿）。② `DESIGN.md` §0.1 与 frontmatter 把 `--q-warning` 写成"升格为三值之一/一等公民"，实测 `var(--q-warning)` **消费仍为 0**（success/danger 各 9）—— 那是 A-07 的计划不是现状，已改为"色值修正 + 语义预留"并标注接线任务。另：`index.md` 第 2 项加"visual.md 是人读视图，真相源在 DESIGN.md"的导航注记 |
| 2026-10-14 (2) | **A-03 完成**（8 文件扫页 + 三组棘轮基线全部收缩为空 ⇒ 永久门禁）。三处新登缺陷：① `NavTiles` 的 `.tile-icon` 整条规则**从未生效**（scoped 属性打不到 `h()` 造的 VNode），改 `:deep()` 后图标才真的着色；② `class-name` 不是 NIcon 的 prop，会落成字面属性且**不报错**，正确写法是 `class`；③ visual 基线不可复现的三个根因里 **V-1（页头秒级时钟）已用 `page.clock.setFixedTime` 修掉**（刻意不用 `clock.install` —— 那会冻结待触发的 setTimeout，把依赖轮询的页面打成空态），**V-2 盲等 `waitForTimeout`、V-3 `data-sync` 渲染活后台状态（纳秒作业 ID / 限流告警）另立待办**，属测试设计决策，不在扫页里顺手改。教训：**颜色改动的验收不能只看 grep** —— 断言 1/2/8 全是静态的，三个缺陷里两个静态断言永远抓不到 |
| 2026-10-14 (3) | **A-03 自审第二轮**，四处直接修掉：① §0.2.2 声称的"等重量 alpha"实测**并不等量**（`primary-soft` 只有旧值 0.78×）—— 根因是我把合成后的绝对亮度当成 ΔL 记进文档、且从上次扫描输出里挑数而没当场重跑，这是"估算当实测"第三次犯，已按实测重解为 0.10 / 0.16 并连带重生成 12 张基线；② `palette.test.ts` 抬头一直写着三方对账，实际**从不核对 DESIGN.md** —— 补守卫后上线即抓到 7 处真漂移（`--q-series-1..6` + `--q-ai-light` 实现里有、基准里从未立项）；③ `BacktestHistory` 三条 `.pnl-*` 规则**永不匹配**（模板不产该类名，真正用的是 `TradeTable.vue`），我扫页时机械替换的是死代码；④ 用脚本扫完 A-01~A-03 全部 10 个文件的 scoped 选择器，另抓到一处**谎报**：侧栏 Redis/Postgres 状态点写死 `online`、`.offline` 规则永不命中 ⇒ 界面恒久宣称基础设施在线却什么都没查，登记为 **A-04 断言 7**（并补断言 8：12 项归并到 9 项）。四个盲点同一条教训：**静态 grep 命中 ≠ 该样式在页面上起作用** |
| 2026-10-14 (7) | **A-07 完成**（详见该节）。三件事值得单独记：① 三值口径收进 `utils/runStatus.ts` 一份表，**动了别人的断言** —— `BacktestEngine.test.ts` 与 `backtest-engine.spec.ts` 各有一条在断屏幕上出现原始 Code（`empty_universe`），那是被本任务**故意**改掉的行为，不是为了让测试变绿；② 断言 1 的机械腿第一版 `\bstatus\b` 是**假护栏**（注释就能骗绿），改成"必须真的读 status"并用探针文件双向破坏验证；③ 真数据抓到无效响应的实情：指标键是**缺席**而非零值，同时带着 `sortino_ratio=1.79e+308`（MaxFloat64）—— 我原先写在 `ConsoleHistory` 注释里的"invalid 保留数字（它算出来了）"因此**不准确**，已按实测改写。另：`pickJob` 被**共享限流**打成无关处变红，只给 429 加退避（其他码照旧响），同类 flake 按归属登记给 AUD-61；④ **更正我自己写过的假结论** —— A-06 台账那句"全量 playwright 116 passed / 0 failed"是把 `npx playwright test \| tail -30` 的输出当结论（管道给的是 `tail` 的退出码，截断又切掉了红清单）。不截断重跑实测 **61 failed / 116 passed / 2 skipped**（退出码 1），该 61 条经逐类取证（死选择器 / strict-mode 撞 async 默认态 / 纯 API 用例的指标假设 / 共享限流）**均非 A-06~A-07 引入**，已登记给 AUD-61 |

| 2026-11-12 (2) | **A-09/A-10/A-11/B-01/B-02/B-04/B-06 关账 + 事实订正**：① A-09 纸交易观测台 `9ca2a61`，外部信号流 `97e934d` 接上 core 新补的 `GET /api/signals` 读面（空流 ≠ 读面未接，已分开画）；② A-10 三个缺屏 5 个 commit 已推，**断言 3 由 5 条订正为 4 条**（walkforward 历史读端点退役、batch CSV 501）；③ A-11 自托管 latin 子集 woff2（ODR-001，91.4 KiB）；④ B-01 `416d598` 只补 seq 升序用例并关账；⑤ B-02 审阅台 + B-06 三干预 `efc6cef`；⑥ B-04 三页合一 `08e95f1`；⑦ **G 表过期判据订正**：G1 聚合读面已实现（派生量仍缺）、G2/G3/G4 已落地（agent 实现 + core 反代）、G6 已落地、G7 已以通配收录，因此 B-02/B-06 从「画 disabled」改为**接真端点**；⑧ **B-05 归口由 analytics 改为 core**（ADR-038；analytics 全仓无因子读端点），UI 保留 disabled 并改为 core 后端任务指针 |
| 2026-11-13 | **设计细化批立单（只立单不施工）**：主任派工把 2026-11-13 UI/UX 改进报告（会话可视化 artifact）细化为可执行任务。新立 **A-12**（校准驾驶舱 = 审阅台第二 tab，G6 消费面）/ **A-13**（导航 IA 15→14 按 §3.2，解除 A-04 断言 2/8 暂缓）/ **A-14**（候选卡三要素：六维微条 + 质疑分级 + EvidenceProbe）/ **A-15**（晨间简报，⛔ 依赖前三单），各 6 断言 + 六字段实施计划。**两处前提订正**：① 报告「15→9」引 A-04 旧提案，该提案无权威清单且早于五个新页 ⇒ 改按 §3.2 收敛 14 项 5 组；② 样图 C 的 PathSparkline 无数据支撑（`AttemptView` 双侧无权益路径字段，G1 明列缺口）⇒ carved out 归 G1。**一处放置裁决**：S2 原稿「独立 /calibration 页 + ⌘K 直达」与 A-04 断言 5（⌘K 只读 NAV_ITEMS）矛盾 ⇒ 改审阅台第二 tab + 深链。主台账同批新立 `UI-DESIGN-DOC-CONVERGENCE`（设计文档 v1 残留收敛，档 5）并登记 A-12~A-15 开放项 ID |
| 2026-11-13 (3) | **A-14 完成**：`VerdictBars.vue` 六维微条（unassessed 写「未评估」不画 0 分条 + 否决提示）、`groupChallenges` 分级（blocking→warning→note，组内原序，空清单「无质疑」）、Sharpe 旁 EvidenceProbe（`hash=null` 恒「无法回溯」，不造 hash）、失败/缺席态（无裁决数字 / 「无裁决」）。两条破坏腿真跑（unassessed→评估值 1 failed；severity 顺序反转 1 failed，均还原绿）。**教训/边界**：⑤ 表要求「真 run verdict 形状」e2e，但 :8085 限流 + 套件无真 run，只能用 route fixture（已标 mock）；`/review` 无视觉基线，无图可重录 |
| 2026-11-13 (4) | **A-13 完成**：导航收敛为 14 项 5 组（删证据质问独立入口、纸交易移入系统），新增「§3.2 代码块 ↔ `navItems.ts` 逐项一致」守卫（解析失败即红），三 e2e spec 同步真栈 17 passed。5 张桌面基线逐张核算 diff 仅在侧栏后重录、连跑两轮绿；`dashboard-mobile`/`backtest-tablet` 仍红，已验证与 A-13 无关（还原 `navItems.ts` 后仍红 767/1003 px）属 **V-2 既存债**，不掩盖不重录。破坏验证双向真跑（label 改字 4 failed；§3.2 注入幽灵条目 1 failed，均还原绿） |
| 2026-11-13 (5) | **A-15 完成**：控制台首屏新增 `MorningBriefing`（待审阅 / 校准误差 / 失败警示 / 最近候选），数据全走既有端点、排序复用 `rankAttempts`、`VerdictBars` 复用 A-14；`null`/读面失败一律「—」+原因，不画 0。**两处如实记录的偏离**：① 真栈 `review/pending` 实测 `pending=0`（源 available），故真栈用例不硬造「—」；② `ReviewDesk` 增「`?run=` 优先」一行，让深链真的落到该轮。`dashboard.png` 重录两轮绿；破坏验证 null→0 触发 2 failed 后还原绿 |
| 2026-11-13 (6) | A-13 收口自查补漏：`dashboard.spec.ts`（e2e）与 `navItems.test.ts`（单测）各钉了 15 项，分别实跑 1 failed 后同步为 14（两个独立 `test(...)` commit）；子台账验证记录由「三 spec 17 passed」订正为「四 spec 26 passed + 全量单测 696 passed」 |
