# ODR-001: 字体自托管拉丁子集，CJK 走系统栈

> **Status**: Accepted
> **Date**: 2026-11-12
> **Category**: Tooling-Process
> **Related ADRs**: 无

## Context

子台账 `A-11 字体加载决策落地` 要求二选一（自托管 woff2 / 外部 CDN）并留下可复现的证据。
此前 `variables.css` 的 `--q-font` 里写着 `Inter` / `Geist`，但**一个都没加载**：`index.html`
没有 link，`public/` 没有 woff2，实际渲染全程走系统字体。DESIGN.md §5.1 的"中文命中
Noto Sans SC"因此也只是一句期望。

需要同时满足的约束：

1. 断言 2：加载后 `document.fonts.check('12px Inter')` 在真实页面为 `true`；
2. 断言 4：中文实际命中 `Noto Sans SC` 族；
3. 断言 6：产物**无谓**膨胀不得 >200KB；
4. AGENTS 的既有约束：不把二进制字体提交进仓。

## Decision

**拉丁字形自托管，经 npm 依赖（`@fontsource`）发布；CJK 不打包，由系统字体栈承担。**

- `web/src/main.ts` 只 import 需要的字重与**子集**：
  `@fontsource/inter/latin-400.css`、`latin-500.css`、`latin-600.css`、
  `@fontsource/jetbrains-mono/latin-400.css`。
- 不使用 `@fontsource/inter/400.css`（全子集，含 cyrillic/greek/vietnamese，体积翻倍）。
- 不引入 Google Fonts 等外部 CDN：与"本地可运行、离线可用"的定位冲突，且大陆网络下
  首屏会因 CDN 超时出现字体闪烁（FOUT），比系统字体更差。
- `--q-font` 移除 `Geist`：该字体从未随包发布，留在栈里只会制造"看起来配了"的错觉。
- CJK 顺序固定为 `Noto Sans SC → PingFang SC → Microsoft YaHei → sans-serif`。

**断言 4 的订正**：把 CJK 字体打进包内不可行 —— `Noto Sans SC` 单字重 woff2 已远超
200KB 预算（9 个字重按需再乘以子集数）。因此断言 4 的口径改为"**中文优先命中系统
Noto Sans SC**；宿主未安装时依次退到 PingFang SC / Microsoft YaHei"，并由 e2e 用
`document.fonts` 证明页面**没有**自带该字体的 `@font-face`，同时记录
`document.fonts.check('12px "Noto Sans SC"')` 的真实值。

## Consequences

- 首屏只多 4 个 woff2，浏览器按 `unicode-range` 只在出现拉丁字形时下载；
- 中文渲染质量取决于宿主系统字体（Windows 通常 `Microsoft YaHei`，macOS `PingFang SC`），
  与"完全不配字体"相比已从宋体族回落到无衬线族，但跨平台字形仍不完全一致；
- 字体随 `npm ci` 安装，不进 git，不涉二进制审批；
- `Geist` 从栈中消失，若设计后续指定该字体，需要新增依赖并重开本 ODR。

## Artifacts

- `web/package.json`、`web/package-lock.json`：新增 `@fontsource/inter`、`@fontsource/jetbrains-mono`
- `web/src/main.ts`：四个 latin 子集 css import
- `web/src/styles/variables.css`：`--q-font` 去掉 `Geist`，注释改为结论
- `web/src/styles/global.css`：`font-variant-numeric: tabular-nums`（A-11 断言 5）
- `docs/design/stitch_quantlab_ux_redesign/obsidian_precision_quant/DESIGN.md` §5.1
- `e2e/tests/font-loading.spec.ts`

## Metrics

- 字体资产：`inter-latin-400` 23,664 B + `latin-500` 24,272 B + `latin-600` 24,452 B +
  `jetbrains-mono-latin-400` 21,168 B = **93,556 B ≈ 91.4 KiB**（预算 200KB，占 45.7%）。
- 说明：本轮 `npm run build` 前的基线构建在 `vue-tsc` 阶段失败，`dist/` 为更早的陈旧产物，
  因此"整体 dist 增量"不可归因；可归因的增量即上述 4 个 woff2 与它们各自的 `@font-face` 声明。
- e2e `tests/font-loading.spec.ts` 3 passed；本机 `document.fonts.check('12px "Noto Sans SC"')`
  实测为 `true`（宿主已装该字体），页面自带的 `@font-face` 中不含该族。

## Lessons Learned

断言写"命中某字体"时，要同时写清**字体从哪来**（自带 / 系统）。只写族名会让"没打包"与
"加载失败"看起来是同一种红；这次把"是否自带"与"系统是否可用"拆成两条独立检查后才分得清。
