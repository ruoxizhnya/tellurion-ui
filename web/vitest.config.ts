import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // 只统计「有逻辑」的目录；pages / components/layout 等渲染层不在此列，
      // 它们的验证由 e2e 承担（e2e 不计入覆盖率，见 UI-CI-COVERAGE ④）。
      include: ['src/components/backtest/**', 'src/composables/**', 'src/stores/**', 'src/utils/**', 'src/api/**'],
      // UI-CI-COVERAGE（2026-11-13）：门 = 当日实测基线下浮 2 点。
      // 实测（52 文件 / 643 例）：lines 66.50 / statements 65.65 /
      // branches 51.60 / functions 61.35 ⇒ 64.5 / 63.65 / 49.6 / 59.35；
      // 取整向下（64 / 63 / 49 / 59）。
      // 为什么不按「实测 -5 点」：破坏验证实测显示，删掉本仓最大的单个测试文件
      // （api/client.test.ts，19KB）也只掉 statements 2.01 / functions 2.87 点，
      // -5 点缓冲会让门对这种回退完全失灵，无法满足本条验收（删一个测试文件 ⇒ 门红）。
      // -2 点仍能容忍小幅自然漂移，且删掉任一核心测试文件即红。
      thresholds: {
        lines: 64,
        statements: 63,
        branches: 49,
        functions: 59,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
