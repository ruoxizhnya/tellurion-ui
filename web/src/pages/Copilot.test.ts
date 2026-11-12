// Copilot.vue 的失败文案判据（W7 UI-COPILOT-GATE-SURFACE ②③）。
//
// 缺陷不是「文案不好看」，而是**说错方向**：`sandbox_rejected` 同时覆盖
// 「沙箱没装配」与「编过了、等人 promote 放行」两种完全不同的处境，旧页面一律
// 补一句「沙箱未启用：需配置 copilot.working_dir」。被闸门拦下的用户照着这句
// 去翻运维配置，而真正该做的事（去 strategy 放行）一个字都没提。
//
// 这里用真组件 + 假后端钉住：页面**必须**走 utils/copilot.ts 的口径，
// 认不出原因时**不许**补解释。

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { NMessageProvider } from 'naive-ui'
import Copilot from './Copilot.vue'
import * as copilotApi from '@/api/copilot'

vi.mock('@/api/copilot', () => ({
  generateStrategy: vi.fn(),
  pollCopilotJob: vi.fn(),
}))

/** naive-ui 的 useMessage() 要求祖先有 provider，所以套一层壳挂载。 */
function mountPage() {
  const Host = defineComponent({
    render: () => h(NMessageProvider, null, { default: () => h(Copilot) }),
  })
  return mount(Host, { attachTo: document.body })
}

async function send(wrapper: ReturnType<typeof mountPage>, text = '写一个动量策略') {
  const textarea = wrapper.find('textarea')
  expect(textarea.exists()).toBe(true)
  await textarea.setValue(text)
  const buttons = wrapper.findAll('button')
  const sendBtn = buttons.find((b) => b.text().includes('发送'))
  expect(sendBtn).toBeTruthy()
  await sendBtn!.trigger('click')
  await flushPromises()
}

function assistantText(wrapper: ReturnType<typeof mountPage>): string {
  const bubbles = wrapper.findAll('.msg.assistant .msg-bubble')
  expect(bubbles.length).toBeGreaterThan(0)
  return bubbles[bubbles.length - 1].text()
}

describe('Copilot 失败终态：只对着认出来的原因说', () => {
  beforeEach(() => {
    vi.mocked(copilotApi.generateStrategy).mockResolvedValue({
      job_id: 'job-abcdef123456',
      status: 'pending',
    })
  })

  it('闸门拦下：不许说「沙箱未启用」，必须指出等人工 promote', async () => {
    vi.mocked(copilotApi.pollCopilotJob).mockResolvedValue({
      job_id: 'job-abcdef123456',
      status: 'sandbox_rejected',
      build_error:
        '编译通过并已登记资产坐标（carrier=wasm strategy_id=st_x version_hash=abc）；' +
        '未过 promote 人工闸门，不进回测（QT-32）。promote 与回测执行归 tellurion-strategy / core。',
      generated_code: 'package plugins',
    })

    const w = mountPage()
    await send(w)
    const text = assistantText(w)

    expect(text).not.toContain('沙箱未启用')
    expect(text).toContain('未过 promote 人工闸门')
    expect(text).toContain('docs/runbook.md §4.2')
    w.unmount()
  })

  it('沙箱没装配：保留「需配置 copilot.working_dir」这句，因为这次它是对的', async () => {
    vi.mocked(copilotApi.pollCopilotJob).mockResolvedValue({
      job_id: 'job-abcdef123456',
      status: 'sandbox_rejected',
      build_error:
        'copilot.working_dir is not configured; set it in analysis-service.yaml under the `copilot:` key',
    })

    const w = mountPage()
    await send(w)
    const text = assistantText(w)

    expect(text).toContain('沙箱未启用')
    expect(text).toContain('copilot.working_dir')
    w.unmount()
  })

  it('认不出原因：原样搬后端解释，不补任何编的解释', async () => {
    vi.mocked(copilotApi.pollCopilotJob).mockResolvedValue({
      job_id: 'job-abcdef123456',
      status: 'sandbox_rejected',
      build_error: 'staticcheck: os.RemoveAll is forbidden (strategy_v0.go:12)',
    })

    const w = mountPage()
    await send(w)
    const text = assistantText(w)

    expect(text).toContain('os.RemoveAll is forbidden')
    expect(text).not.toContain('沙箱未启用')
    expect(text).not.toContain('promote')
    w.unmount()
  })

  it('受理文案只说真链路：静态检查 / 资产登记 / 闸门，且不承诺回测', async () => {
    // 永不终态 → 停在受理后的那一句，正好看进度文案本身。
    vi.mocked(copilotApi.pollCopilotJob).mockReturnValue(new Promise(() => {}))

    const w = mountPage()
    await send(w)
    const text = assistantText(w)

    expect(text).toContain('静态检查')
    expect(text).toContain('资产登记')
    expect(text).toContain('promote 闸门')
    expect(text).toContain('不会自动跑回测')
    expect(text).not.toContain('→ 回测')
    w.unmount()
  })
})
