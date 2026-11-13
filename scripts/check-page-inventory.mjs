#!/usr/bin/env node
// UI-PAGE-INVENTORY：§3.1.1「页面全集」是 UI 页面清单的唯一维护处。这个守卫把
// 「文档说的」和「代码里有的」钉在一起，防止两边各自漂移：
//
//   1. `web/src/pages/*.vue` ↔ 表格「页面文件」列，双向必须相等（新增页不登记 / 登记了
//      不存在的文件 / 同一页登记两次，都会红）；
//   2. 表格里的路由必须在 `web/src/router/index.ts` 里真实存在（`path:` 或 `alias:`），
//      写 `—` 的行必须由 `StrategyHub.vue` 以 tab 形式内嵌；
//   3. 每行「一句话用途」不能空着或写 TODO；
//   4. `docs/ARCHITECTURE.md` 里的相对链接都要能解析到真实文件（「链接检查绿」）。
//
// 用法：仓库根目录 `node scripts/check-page-inventory.mjs`
// 破坏验证：任意改一处（比如把某行 `pages/Alerts.vue` 改成 `pages/Alert.vue`，
// 或在 pages/ 下新建一个不登记的 vue）⇒ 退出码 1。

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const archPath = join(root, "docs", "ARCHITECTURE.md");
const routerPath = join(root, "web", "src", "router", "index.ts");
const pagesDir = join(root, "web", "src", "pages");
const hubPath = join(root, "web", "src", "pages", "StrategyHub.vue");

const errors = [];
const fail = (msg) => errors.push(msg);

const arch = readFileSync(archPath, "utf8");
const router = readFileSync(routerPath, "utf8");
const hub = readFileSync(hubPath, "utf8");

// --- 1. 抠出 §3.1.1 表格 -----------------------------------------------------
const BEGIN = "<!-- PAGE-INVENTORY:BEGIN -->";
const END = "<!-- PAGE-INVENTORY:END -->";
const beginAt = arch.indexOf(BEGIN);
const endAt = arch.indexOf(END);
if (beginAt < 0 || endAt < 0 || endAt < beginAt) {
  console.error(`✗ docs/ARCHITECTURE.md 找不到 ${BEGIN} / ${END} 标记，无法校验页面全集`);
  process.exit(1);
}

const rows = arch
  .slice(beginAt + BEGIN.length, endAt)
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.startsWith("|"))
  .filter((line) => !/^\|\s*-{3,}/.test(line)) // 分隔行
  .slice(1) // 表头
  .map((line) =>
    line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim()),
  );

const stripCode = (cell) => cell.replace(/^`|`$/g, "").trim();

const declared = new Map(); // 页面相对路径 -> 路由
for (const [routeCell, pageCell, purposeCell] of rows) {
  const route = stripCode(routeCell);
  const page = stripCode(pageCell);
  if (!page.startsWith("pages/") || !page.endsWith(".vue")) {
    fail(`页面全集行格式不对：「${pageCell}」应形如 \`pages/X.vue\``);
    continue;
  }
  if (!purposeCell || /TODO|待补|TBD/.test(purposeCell)) {
    fail(`${page} 的「一句话用途」为空或仍是占位符`);
  }
  if (declared.has(page)) {
    fail(`${page} 在页面全集里出现了两次`);
  }
  declared.set(page, route);
}

// --- 2. 页面文件 ↔ 表格 双向一致 ---------------------------------------------
const actualPages = new Set(
  readdirSync(pagesDir)
    .filter((name) => name.endsWith(".vue"))
    .map((name) => `pages/${name}`),
);

for (const page of actualPages) {
  if (!declared.has(page)) fail(`web/src/pages/${page.slice("pages/".length)} 没有登记进 §3.1.1 页面全集`);
}
for (const page of declared.keys()) {
  if (!existsSync(join(root, "web", "src", page))) fail(`页面全集登记了不存在的文件 web/src/${page}`);
}

// --- 3. 路由必须真实存在；`—` 行必须是 StrategyHub 内嵌视图 ------------------
const routeExists = (route) => {
  const candidates = [route, route.replace(/^\//, "")];
  if (route === "/") candidates.push("");
  return candidates.some(
    (p) => router.includes(`path: '${p}'`) || router.includes(`path: "${p}"`),
  );
};
const aliasExists = (route) =>
  new RegExp(`alias:\\s*\\[[^\\]]*['"]${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"]`).test(
    router,
  );

for (const [page, route] of declared) {
  const file = page.slice("pages/".length);
  if (route.startsWith("—")) {
    // 内嵌视图在 StrategyHub 里用相对路径 import（`./X.vue`），两种写法都认。
    if (!hub.includes(`'./${file}'`) && !hub.includes(`@/pages/${file}`)) {
      fail(`${page} 在全集里标成内嵌视图，但 StrategyHub.vue 并没有内嵌它`);
    }
    continue;
  }
  if (!routeExists(route) && !aliasExists(route)) {
    fail(`${page} 登记的路由 ${route} 在 web/src/router/index.ts 里找不到`);
  }
  if (!router.includes(`@/pages/${file}`)) {
    fail(`${page} 登记了路由 ${route}，但路由表没有引用 @/pages/${file}`);
  }
}

// --- 4. ARCHITECTURE.md 相对链接检查 ----------------------------------------
const docLinks = [...arch.matchAll(/\]\(([^)\s]+)\)/g)]
  .map((m) => m[1])
  .filter((href) => !/^(https?:|mailto:|#)/.test(href));
for (const href of docLinks) {
  const target = join(dirname(archPath), decodeURI(href.split("#")[0]));
  if (!existsSync(target)) fail(`docs/ARCHITECTURE.md 的链接指向不存在的文件：${href}`);
}

// --- 汇报 -------------------------------------------------------------------
if (errors.length > 0) {
  console.error("✗ 页面全集 / 路由 / 链接 一致性检查未通过：");
  for (const msg of errors) console.error(`  - ${msg}`);
  process.exit(1);
}

console.log(
  `✓ 页面全集一致：${declared.size} 个页面文件（${[...declared.values()].filter((r) => !r.startsWith("—")).length} 条路由 + ${[...declared.values()].filter((r) => r.startsWith("—")).length} 个内嵌视图），文档链接 ${docLinks.length} 条可解析（${relative(root, archPath)}）`,
);
