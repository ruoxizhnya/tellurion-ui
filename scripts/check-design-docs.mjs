#!/usr/bin/env node
// UI-DESIGN-DOC-CONVERGENCE（档 5）：`docs/design/` 活跃层是设计系统的「人读真相源」，
// 但 v1 调色板残留、虚构代码示例会让它说的话与仓里的事实相反（AGENTS.md §6）。
// 这个守卫把三件事钉死，防止再漂回去：
//
//   1. 活跃层（`docs/design/` 根下 + `pages/`，递归）不得出现 v1 八值
//      （`#0d1117/#161b22/#1c2333/#e6edf3/#8b949e/#58a6ff/#3fb950/#f85149`）；
//   2. `index.md` 的 token 快照块与 `web/src/styles/variables.css` 逐值一致
//      （且必须包含核心八值，防止靠删行变绿）；
//   3. `interaction.md` 不得再出现并不存在的 `useAppStore`。
//
// **豁免**：`stitch_quantlab_ux_redesign/**` 是历史设计档案 + 任务台账，其中的旧 hex
// 是 A-01/A-02 的扫页证据与 DESIGN.md §0.2 的候选值记录，**刻意保留**，不扫。
//
// 用法：仓库根目录 `node scripts/check-design-docs.mjs [root]`
//       （`root` 仅供守卫自身的夹具测试指到临时目录）
// 破坏验证：往 `principles.md` 注入一个 `#58a6ff` ⇒ 退出码 1；
//           把 `index.md` token 块改回 v1 值 ⇒ 退出码 1。

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const V1_TOKENS = [
  "#0d1117",
  "#161b22",
  "#1c2333",
  "#e6edf3",
  "#8b949e",
  "#58a6ff",
  "#3fb950",
  "#f85149",
];
const CORE_TOKENS = [
  "--q-bg",
  "--q-surface",
  "--q-surface2",
  "--q-text",
  "--q-text2",
  "--q-primary",
  "--q-success",
  "--q-danger",
];
const EXCLUDED_DIRS = new Set(["stitch_quantlab_ux_redesign"]);

const root = process.argv[2]
  ? resolve(process.cwd(), process.argv[2])
  : fileURLToPath(new URL("..", import.meta.url));
const designDir = join(root, "docs", "design");
const variablesPath = join(root, "web", "src", "styles", "variables.css");

const errors = [];
const fail = (msg) => errors.push(msg);

/** 活跃层的 markdown 文件（递归；跳过历史档案目录） */
function collectDocs(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (!EXCLUDED_DIRS.has(name)) collectDocs(full, out);
    } else if (name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

/** 单文件逐行扫 v1 调色板，报行号 */
function checkPalette(file) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const token of V1_TOKENS) {
      if (line.toLowerCase().includes(token)) {
        fail(`${relative(root, file)}:${i + 1} 残留 v1 调色板 ${token}（v2 见 web/src/styles/variables.css）`);
      }
    }
  });
}

/** 解析 `--q-*: value;` 形式的 token 表（CSS 变量与文档快照共用） */
function parseTokens(src) {
  const map = new Map();
  for (const m of src.matchAll(/(--q-[\w-]+)\s*:\s*([^;]+);/g)) {
    map.set(m[1], m[2].trim().replace(/\s+/g, " "));
  }
  return map;
}

function checkTokenSnapshot() {
  const indexPath = join(designDir, "index.md");
  let indexSrc;
  let variablesSrc;
  try {
    indexSrc = readFileSync(indexPath, "utf8");
    variablesSrc = readFileSync(variablesPath, "utf8");
  } catch (e) {
    fail(`读不到 ${relative(root, indexPath)} 或 ${relative(root, variablesPath)}：${e.message}`);
    return;
  }

  // 快照块 = index.md 里含 `:root` 的那个 ```css 代码块
  const blocks = [...indexSrc.matchAll(/```css\r?\n([\s\S]*?)```/g)].map((m) => m[1]);
  const snapshot = blocks.find((b) => b.includes(":root"));
  if (!snapshot) {
    fail("docs/design/index.md 找不到含 `:root` 的 ```css token 快照块");
    return;
  }

  const docTokens = parseTokens(snapshot);
  const realTokens = parseTokens(variablesSrc);

  for (const key of CORE_TOKENS) {
    if (!docTokens.has(key)) {
      fail(`docs/design/index.md token 快照缺核心八值之一的 ${key}`);
      continue;
    }
    const expected = realTokens.get(key);
    if (expected === undefined) {
      fail(`web/src/styles/variables.css 里没有 ${key}（快照无处对齐）`);
      continue;
    }
    if (docTokens.get(key) !== expected) {
      fail(`docs/design/index.md ${key} = ${docTokens.get(key)}，与 variables.css 的 ${expected} 不一致`);
    }
  }
  // 快照里其它 --q-* 只要在源文件里出现，也必须一致
  for (const [key, value] of docTokens) {
    if (CORE_TOKENS.includes(key)) continue;
    const expected = realTokens.get(key);
    if (expected !== undefined && expected !== value) {
      fail(`docs/design/index.md ${key} = ${value}，与 variables.css 的 ${expected} 不一致`);
    }
  }
}

function checkNoFictionalStore() {
  const path = join(designDir, "interaction.md");
  const src = readFileSync(path, "utf8");
  if (src.includes("useAppStore")) {
    fail(`${relative(root, path)} 仍含虚构的 useAppStore（实际只有 auth/backtest/sync 三个 store）`);
  }
}

const docs = collectDocs(designDir);
if (docs.length === 0) fail("docs/design/ 活跃层一个 markdown 都没扫到（路径不对？）");
for (const doc of docs) checkPalette(doc);
checkTokenSnapshot();
checkNoFictionalStore();

if (errors.length > 0) {
  console.error("✗ 设计文档收敛检查未通过：");
  for (const msg of errors) console.error(`  - ${msg}`);
  process.exit(1);
}

console.log(
  `✓ 设计文档收敛：${relative(root, designDir)} 活跃层 ${docs.length} 个文件无 v1 调色板，token 快照与 variables.css 一致`,
);
