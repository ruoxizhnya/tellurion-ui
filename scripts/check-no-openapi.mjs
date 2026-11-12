#!/usr/bin/env node
// X-LOW-CLEANUP（ui 腿）：ADR-0001 规定 openapi 规格只住 core
// (`tellurion:docs/openapi.yaml`)，本仓**不得复制**一份。这个守卫就是
// 那条「不复制」的机械保证：整仓扫到 openapi/swagger 规格文件即红。
//
// 扫描的是工作区（不是 `git ls-files`），所以未 commit 的副本也会被拦下。
// 排除目录只列构建/依赖产物，文档与源码目录照扫。
//
// 用法：在仓库根目录 `node scripts/check-no-openapi.mjs`
// 破坏验证：`cp <任意 openapi 文件> ./openapi.json` ⇒ 退出码 1。

import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "coverage",
  "test-results",
  "playwright-report",
  ".vite",
]);
const OPENAPI_FILE = /^(openapi|swagger)[^/]*\.(ya?ml|json)$/i;

const hits = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(full);
    } else if (OPENAPI_FILE.test(name)) {
      hits.push(relative(root, full));
    }
  }
}

walk(root);

if (hits.length > 0) {
  console.error(
    "✗ 本仓不得复制 openapi/swagger 规格（ADR-0001：真相源是 core:docs/openapi.yaml）。",
  );
  for (const hit of hits) console.error(`  - ${hit}`);
  process.exit(1);
}

console.log("✓ 本仓无 openapi/swagger 规格副本（ADR-0001）");
