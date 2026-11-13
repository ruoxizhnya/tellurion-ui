import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

/**
 * `scripts/check-design-docs.mjs` 的夹具测试（UI-DESIGN-DOC-CONVERGENCE ⑤）。
 *
 * 守卫本身用 `root` 参数可以指到临时目录，所以这里搭最小假仓逐条验证「该红就红、
 * 该绿就绿」—— 尤其是用**真实脚本**跑，不是把判定逻辑在测试里重写一遍。
 * 同 `check-page-inventory.mjs` 先例：脚本自己跑得通不算数，得证明它抓得住漂移。
 */

const script = resolve(__dirname, '../../scripts/check-design-docs.mjs')

const VARIABLES = `:root {
  --q-bg: #090a0c;
  --q-surface: #111620;
  --q-surface2: #171e2c;
  --q-text: #e1e2eb;
  --q-text2: #c3c6d7;
  --q-primary: #b4c5ff;
  --q-success: #10b981;
  --q-danger: #ef4444;
  --q-radius: 8px;
}
`

const INDEX_OK = `# 设计系统

\`\`\`css
:root {
  --q-bg: #090a0c;
  --q-surface: #111620;
  --q-surface2: #171e2c;
  --q-text: #e1e2eb;
  --q-text2: #c3c6d7;
  --q-primary: #b4c5ff;
  --q-success: #10b981;
  --q-danger: #ef4444;
  --q-radius: 8px;
}
\`\`\`
`

let roots: string[] = []

/** 搭一个最小仓；返回 root */
function makeRepo(overrides: Record<string, string> = {}): string {
  const root = mkdtempSync(join(tmpdir(), 'design-docs-'))
  roots.push(root)
  const files: Record<string, string> = {
    'docs/design/index.md': INDEX_OK,
    'docs/design/pages/dashboard.md': '# 控制台\n\n正文。\n',
    'docs/design/interaction.md': '# 交互规范\n\n三个 store：auth / backtest / sync。\n',
    // 历史档案目录：旧 hex 是扫页证据，必须被豁免
    'docs/design/stitch_quantlab_ux_redesign/DESIGN.md': '| canvas | `#0d1117` |\n',
    'web/src/styles/variables.css': VARIABLES,
    ...overrides,
  }
  for (const [rel, content] of Object.entries(files)) {
    const full = join(root, rel)
    mkdirSync(resolve(full, '..'), { recursive: true })
    writeFileSync(full, content, 'utf8')
  }
  return root
}

function run(root: string) {
  return spawnSync(process.execPath, [script, root], { encoding: 'utf8' })
}

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true })
  roots = []
})

describe('设计文档守卫（scripts/check-design-docs.mjs）', () => {
  it('干净仓 → 退出码 0，且历史档案目录的旧 hex 被豁免', () => {
    const res = run(makeRepo())
    expect(res.stderr).toBe('')
    expect(res.status, res.stdout + res.stderr).toBe(0)
  })

  it('活跃层注入 v1 hex → 退出码 1 且报出行号', () => {
    const res = run(
      makeRepo({ 'docs/design/pages/dashboard.md': '# 控制台\n\n旧主色 `#58a6ff`。\n' }),
    )
    expect(res.status).toBe(1)
    // 路径分隔符跨平台（Windows 反斜杠），只断文件名与行号
    expect(res.stderr).toContain('dashboard.md:3')
    expect(res.stderr).toContain('#58a6ff')
  })

  it('token 快照与 variables.css 不一致 → 退出码 1', () => {
    const drifted = INDEX_OK.replace('--q-bg: #090a0c;', '--q-bg: #101010;')
    const res = run(makeRepo({ 'docs/design/index.md': drifted }))
    expect(res.status).toBe(1)
    expect(res.stderr).toContain('--q-bg')
  })

  it('token 快照缺核心八值之一 → 退出码 1（删行不能变绿）', () => {
    const missing = INDEX_OK.replace('  --q-success: #10b981;\n', '')
    const res = run(makeRepo({ 'docs/design/index.md': missing }))
    expect(res.status).toBe(1)
    expect(res.stderr).toContain('--q-success')
  })

  it('interaction.md 仍含虚构的 useAppStore → 退出码 1', () => {
    const res = run(
      makeRepo({ 'docs/design/interaction.md': '# 交互规范\n\nuseAppStore 示例。\n' }),
    )
    expect(res.status).toBe(1)
    expect(res.stderr).toContain('useAppStore')
  })
})
