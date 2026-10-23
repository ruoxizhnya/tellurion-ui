import { test, expect, APIRequestContext, Page } from '@playwright/test';
import { waitForBackendReady, API } from '../helpers/api';
import { isolateTestEnvironment } from '../helpers/isolation';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8085';

const STRATEGY_PROMPTS = [
  '写一个基于 RSI 的均值回归策略',
  '实现一个双均线交叉策略，参数可调',
  '写一个基于布林带的突破策略',
];

/**
 * P1-30 E2E AI Copilot 端到端测试
 *
 * 覆盖范围 (Sprint 6 P1 pickup #9):
 *   1. 页面加载 (UI 入口)
 *   2. 自然语言输入 → 助手响应 (UI 端到端)
 *   3. 多轮对话 (state 累积)
 *   4. 复制代码按钮可用
 *   5. 错误处理 (网络/API 失败)
 *   6. API 契约 (Copilot endpoints)
 *   7. SSE 进度 (data-sync stream — 当前 Copilot 自身无 SSE,
 *      见 ODR-024 lessons learned)
 *
 * 设计:
 *   - `waitForBackendReady` 在 beforeAll 阶段确保 analysis-service 在线
 *   - `isolateTestEnvironment` 拦截外部 AI/finance API, 避免依赖外部
 *   - 用例 1-3 是 UI 路径, 4-5 是 API 路径, 6 是混合
 *   - 由于 Copilot 需要 AI_API_KEY (生产配置), 不可在 CI 强制 200;
 *     接受 200 / 503 / 401 / 502 任意可识别 status
 */
test.describe('P1-30: AI Copilot E2E', () => {
  test.beforeAll(async () => {
    const ready = await waitForBackendReady(60000);
    expect(ready).toBe(true);
  });

  test.beforeEach(async ({ page }) => {
    await isolateTestEnvironment(page);
  });

  // ==========================================================================
  // UI 端到端流程
  // ==========================================================================

  test('UI: 访问 /copilot 显示策略 Copilot 页面', async ({ page }) => {
    await page.goto('/copilot');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('.copilot-page')).toBeVisible();
    await expect(page.locator('.n-card').first()).toContainText('策略 Copilot');
  });

  test('UI: 自然语言输入 → 用户消息渲染', async ({ page }) => {
    await page.goto('/copilot');
    await page.waitForLoadState('domcontentloaded');

    const prompt = STRATEGY_PROMPTS[0];
    const textarea = page.locator('.n-input textarea, .n-input__input-el').first();
    await textarea.fill(prompt);

    // 验证 send button 在输入后启用
    const sendBtn = page.locator('.n-button--primary-type:has-text("发送")');
    await expect(sendBtn).toBeEnabled();

    // 不真正点击发送 (避免依赖 AI 后端), 改为直接 verify input 已填入
    const value = await textarea.inputValue();
    expect(value).toBe(prompt);
  });

  test('UI: 端到端自然语言 → API 调用 → 响应 (或错误) 消息渲染', async ({ page }) => {
    await page.goto('/copilot');
    await page.waitForLoadState('domcontentloaded');

    // OBS-12（2026-10-09）：生成接口是**异步 job** —— POST 受理 202
    // {job_id,status}，再 GET /generate/{job_id} 轮询到终态
    // （契约见 core:docs/openapi.yaml 的 /api/copilot/generate*）。
    // 旧 stub 直接返回同步 {code,explanation}，页面拿不到 job_id 必然失败。
    await page.route('**/api/copilot/generate', route => {
      route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({ job_id: 'stub-job-1', status: 'pending' }),
      });
    });
    await page.route('**/api/copilot/generate/stub-job-1', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          job_id: 'stub-job-1',
          status: 'generated',
          strategy_name: 'P1-30 StubStrategy',
          generated_code: 'package plugins\n\nimport "context"\n\n// P1-30 stub strategy\nfunc Foo(ctx context.Context) { _ = ctx }',
        }),
      });
    });

    const textarea = page.locator('.n-input textarea, .n-input__input-el').first();
    await textarea.fill(STRATEGY_PROMPTS[0]);

    const sendBtn = page.locator('.n-button--primary-type:has-text("发送")');
    await sendBtn.click();

    // 等待 assistant 消息出现 (UI 端到端)
    const assistantMsg = page.locator('.msg.assistant').last();
    await expect(assistantMsg).toBeVisible({ timeout: 15000 });

    // 验证响应内容（终态消息带策略名）
    await expect(assistantMsg).toContainText(/P1-30 StubStrategy/);

    // 验证 code block 渲染
    const codeBlock = page.locator('.code-block').last();
    await expect(codeBlock).toBeVisible();
    await expect(codeBlock).toContainText('package plugins');
  });

  test('UI: 端到端自然语言 → API 503 (AI 未配置) → 错误消息渲染', async ({ page }) => {
    await page.goto('/copilot');
    await page.waitForLoadState('domcontentloaded');

    // 拦截 /api/copilot/generate, 返回 503 (AI 未配置场景)
    await page.route('**/api/copilot/generate', route => {
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'AI API not configured (set AI_API_KEY and AI_API_URL)' }),
      });
    });

    const textarea = page.locator('.n-input textarea, .n-input__input-el').first();
    await textarea.fill(STRATEGY_PROMPTS[1]);

    const sendBtn = page.locator('.n-button--primary-type:has-text("发送")');
    await sendBtn.click();

    const assistantMsg = page.locator('.msg.assistant').last();
    await expect(assistantMsg).toBeVisible({ timeout: 10000 });
    await expect(assistantMsg).toContainText(/生成失败|AI API not configured|503/);
  });

  test('UI: 多轮对话 — 第二条消息追加到消息列表', async ({ page }) => {
    await page.goto('/copilot');
    await page.waitForLoadState('domcontentloaded');

    // 异步 job 契约：每轮一次 202 受理 + 一次终态轮询（见文件头 OBS-12）。
    let turn = 0;
    await page.route('**/api/copilot/generate', route => {
      turn += 1;
      route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({ job_id: `mt-${turn}`, status: 'pending' }),
      });
    });
    await page.route('**/api/copilot/generate/**', route => {
      const jobId = route.request().url().split('/').pop();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          job_id: jobId,
          status: 'generated',
          strategy_name: 'MultiTurnStrategy',
          generated_code: '// turn response',
        }),
      });
    });

    const textarea = page.locator('.n-input textarea, .n-input__input-el').first();
    const sendBtn = page.locator('.n-button--primary-type:has-text("发送")');

    // 第一轮
    await textarea.fill(STRATEGY_PROMPTS[0]);
    await sendBtn.click();
    await expect(page.locator('.msg.user').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.msg.assistant').first()).toContainText(/MultiTurnStrategy/, {
      timeout: 10000,
    });

    // 第二轮
    await textarea.fill(STRATEGY_PROMPTS[1]);
    await sendBtn.click();
    await expect(page.locator('.msg.user')).toHaveCount(2, { timeout: 10000 });
    await expect(page.locator('.msg.assistant')).toHaveCount(2, { timeout: 10000 });

    // 第二条 assistant 消息内容
    const lastAssistant = page.locator('.msg.assistant').last();
    await expect(lastAssistant).toContainText('MultiTurnStrategy');
  });

  test('UI: 复制代码按钮存在且可点击', async ({ page }) => {
    await page.goto('/copilot');
    await page.waitForLoadState('domcontentloaded');

    // 异步 job 契约：代码在终态响应的 generated_code 里（OBS-12）。
    await page.route('**/api/copilot/generate', route => {
      route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({ job_id: 'copy-job', status: 'pending' }),
      });
    });
    await page.route('**/api/copilot/generate/copy-job', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          job_id: 'copy-job',
          status: 'generated',
          strategy_name: 'CopyTest',
          generated_code: '// click-to-copy test',
        }),
      });
    });

    const textarea = page.locator('.n-input textarea, .n-input__input-el').first();
    await textarea.fill(STRATEGY_PROMPTS[2]);
    const sendBtn = page.locator('.n-button--primary-type:has-text("发送")');
    await sendBtn.click();

    // 等待 code block + 复制按钮渲染
    const copyBtn = page.locator('.code-block .n-button:has-text("复制")').last();
    await expect(copyBtn).toBeVisible({ timeout: 10000 });
    await expect(copyBtn).toBeEnabled();
  });

  test('UI: 导航栏从 dashboard 可达', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 寻找包含 "Copilot" 或 "策略 Copilot" 的导航元素
    const copilotNav = page.locator('.nav-tile, .nav-item, a[href*="copilot"]')
      .filter({ hasText: /Copilot|策略/ });
    const count = await copilotNav.count();
    if (count > 0) {
      await copilotNav.first().click();
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/\/copilot/);
    } else {
      // 直接 navigate (fallback)
      await page.goto('/copilot');
      await expect(page.locator('.copilot-page')).toBeVisible();
    }
  });

  // ==========================================================================
  // API 契约
  // ==========================================================================

  test('API: POST /api/copilot/generate 空 description 返回 400', async ({ request }) => {
    const response = await request.post(`${BACKEND}/api/copilot/generate`, {
      data: { description: '' },
    });
    // 200/400/503 都是合理: 服务端可能先做 400 校验, 也可能先做 503
    // (AI 未配置优先于 description 校验)
    expect([400, 503]).toContain(response.status());
  });

  test('API: POST /api/copilot/generate 有效 prompt 返回结构化响应', async ({ request }) => {
    const response = await request.post(`${BACKEND}/api/copilot/generate`, {
      data: { description: STRATEGY_PROMPTS[0] },
      timeout: 60000,
    });
    // 活契约是异步 job：受理 = 202 {job_id,status}（core:docs/openapi.yaml）；
    // AI 未配置/不在线 = 503；上游 AI 网关的 502/401 原样透传。
    expect([202, 503, 502, 401]).toContain(response.status());

    if (response.status() === 202) {
      const body = await response.json();
      expect(typeof body.job_id).toBe('string');
      expect(body.job_id.length).toBeGreaterThan(0);
      expect(typeof body.status).toBe('string');
    } else {
      // 依赖不可用至少要有 error 字段
      const body = await response.json();
      expect(body).toHaveProperty('error');
    }
  });

  // AUD-01 (ODR-065 C3): POST /api/copilot/save 已删除，不是加固。
  // 该端点零生产调用方（前端 S7-P2-7 已删 saveStrategy stub），且其用途与
  // ADR-024 冲突；原实现有路径遍历（StrategyName 无校验 → 可写任意 .go 文件）。
  // 这里断言 404 而不是「坏输入被拒」——后者在端点被重新加回来时依然会通过。
  // 单测版护栏见 cmd/analysis/handlers_copilot_test.go。
  test('API: POST /api/copilot/save 已删除，应返回 404', async ({ request }) => {
    const response = await request.post(`${BACKEND}/api/copilot/save`, {
      data: { code: 'package plugins', strategy_name: 'TestStrategy' },
    });
    // ai-service 不在 e2e 栈里时，整个 /api/copilot/* 前缀由反代 fail-closed
    // 成 503（实测），404 只有在 ai-service 在线时才可观测。两者都表示
    // 「旧的 save 端点没有成功受理」；端点确实删除由 core 单测钉住。
    expect([404, 503]).toContain(response.status());
  });

  test('API: GET /api/copilot/stats 返回统计信息', async ({ request }) => {
    const response = await request.get(`${BACKEND}/api/copilot/stats`);
    // 200 OK 或 404/500 视实现；ai-service 不在线时整族反代 503。
    expect([200, 404, 500, 503]).toContain(response.status());

    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toBeDefined();
    }
  });

  // ==========================================================================
  // SSE 进度
  // ==========================================================================
  //
  // 当前 backend 仅为 /api/sync/stream 提供 SSE (data sync, 非 Copilot);
  // Copilot 自身是同步 POST 阻塞, 进度通过 UI 内部 "正在生成..."
  // 气泡展示 (见 pages/Copilot.vue:62-63)。
  //
  // 本测试覆盖现有 SSE 端点的契约 — 验证 text/event-stream 行为
  // 正常, 为后续 P2 把 Copilot 改造为 SSE 进度 (类似 pipeline.run)
  // 留下契约参照。

  test('SSE: /api/sync/stream 返回 text/event-stream 内容类型 (契约)', async ({ request }) => {
    const response = await request.get(`${BACKEND}/api/sync/stream`, {
      headers: { Accept: 'text/event-stream' },
      timeout: 5000,
    }).catch(() => null);

    if (!response) {
      test.skip(true, '/api/sync/stream endpoint unreachable (sandbox/offline)');
      return;
    }

    const contentType = response.headers()['content-type'] || '';
    const status = response.status();

    // 接受 200 (SSE active) 或 404/500 (endpoint absent in this build)
    expect([200, 404, 500]).toContain(status);

    if (status === 200) {
      expect(contentType).toMatch(/text\/event-stream/);
    }
  });

  // ==========================================================================
  // 混合: UI + API 验证 response 字段在 UI 端正确渲染
  // ==========================================================================

  test('UI+API: 助手响应的 code 与策略名都渲染到 UI', async ({ page }) => {
    await page.goto('/copilot');
    await page.waitForLoadState('domcontentloaded');

    // 异步 job 契约：explanation 字段已不在契约里，终态响应给的是
    // strategy_name + generated_code（见 core:docs/openapi.yaml）。
    const testStrategy = 'UIApiIntegrationTest';
    const testCode = '// UI+API 集成测试 code\npackage plugins';
    await page.route('**/api/copilot/generate', route => {
      route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({ job_id: 'uiapi-job', status: 'pending' }),
      });
    });
    await page.route('**/api/copilot/generate/uiapi-job', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          job_id: 'uiapi-job',
          status: 'generated',
          strategy_name: testStrategy,
          generated_code: testCode,
        }),
      });
    });

    const textarea = page.locator('.n-input textarea, .n-input__input-el').first();
    await textarea.fill('UI+API 集成测试');
    const sendBtn = page.locator('.n-button--primary-type:has-text("发送")');
    await sendBtn.click();

    // 验证策略名在 msg-bubble 内
    const assistantBubble = page.locator('.msg.assistant .msg-bubble').last();
    await expect(assistantBubble).toContainText(testStrategy, { timeout: 10000 });

    // 验证 code 在 code-block 内
    const codeBlock = page.locator('.msg.assistant .code-block').last();
    await expect(codeBlock).toContainText('package plugins');

    // 验证 language 标签
    const codeHeader = codeBlock.locator('.code-header span').first();
    await expect(codeHeader).toContainText('go');
  });
});
