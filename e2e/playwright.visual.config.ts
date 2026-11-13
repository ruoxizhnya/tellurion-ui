import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  outputDir: './test-results-visual',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'e2e-report-visual' }],
    ['json', { outputFile: 'e2e-report-visual/results.json' }],
  ],
  use: {
    ...base.use,
    video: 'on',
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
});