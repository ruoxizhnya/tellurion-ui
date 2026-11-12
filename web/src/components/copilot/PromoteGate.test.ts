// PromoteGate 的判据（UI-COPILOT-GATE-SURFACE a 腿）。
//
// 裁决（2026-11-12）：人 promote 走**登录者自己的 JWT + X-Actor=本人用户名**，
// 不用 service token、不做 admin 代调。这条判据必须能被破坏验证：把身份来源改回
// service token ⇒ 本文件第一个用例红。
//
// 这里用**真 client + 假 fetch**（不 mock `@/api/strategy`），因为要验的正是
// 请求头长什么样——mock 掉 API 层就只能验"调用过",验不出"用谁的身份调的"。

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PromoteGate from './PromoteGate.vue'
import { useAuthStore } from '@/stores/auth'
import { clearTokens, getAccessToken, setTokens } from '@/api/authToken'

const TARGET = { strategyId: 'st_9f3c2a1b', versionHash: '4d2e8c1f' }

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response
}

function mountAs(username: string | null, role: string | null) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const auth = useAuthStore()
  auth.$patch({ username, role, posture: 'authenticated' })
  return mount(PromoteGate, {
    props: { target: TARGET },
    global: { plugins: [pinia] },
  })
}

/** 走到「确认放行」并等请求落地 */
async function promote(w: ReturnType<typeof mountAs>) {
  await w.get('[data-testid="promote-btn"]').trigger('click')
  await w.get('[data-testid="promote-confirm"]').trigger('click')
  await flushPromises()
}

function sentHeaders(fetchMock: ReturnType<typeof vi.fn>): Record<string, string> {
  const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
  return (init?.headers ?? {}) as Record<string, string>
}

describe('PromoteGate — 谁在放行', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    clearTokens()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    clearTokens()
  })

  it('登录用户放行成功：带本人 JWT + X-Actor=本人，且绝不出 service 头', async () => {
    setTokens('jwt-alice', 'refresh-alice')
    fetchMock.mockResolvedValue(
      jsonResponse(200, { strategy_id: TARGET.strategyId, version_hash: TARGET.versionHash, status: 'promoted' }),
    )

    const w = mountAs('alice', 'admin')
    await promote(w)

    // URL / 方法
    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toContain(`/api/strategies/${TARGET.strategyId}/versions/${TARGET.versionHash}/promote`)
    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('POST')

    // 身份来自登录者自己：Authorization 是 alice 的 token，X-Actor 是 alice
    const headers = sentHeaders(fetchMock)
    expect(headers.Authorization).toBe('Bearer jwt-alice')
    expect(headers['X-Actor']).toBe('alice')
    // 反向判据：任何 service/机器身份的头都不许出现
    expect(Object.keys(headers).some((k) => /service|robot|machine/i.test(k))).toBe(false)
    expect(JSON.stringify(headers)).not.toContain('service')

    // 成功话术要点名是谁放的行
    expect(w.get('[data-testid="promote-success"]').text()).toContain('alice')
    expect(w.get('[data-testid="promote-success"]').text()).toContain('promoted')
  })

  it('没有 token（凭据被清）：请求不带 Authorization，401 如实说需要登录', async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, { error: 'unauthenticated' }))

    const w = mountAs('alice', 'admin')
    await promote(w)

    const headers = sentHeaders(fetchMock)
    expect(headers.Authorization).toBeUndefined()
    expect(headers['X-Actor']).toBe('alice') // 身份声明仍在，但后端不认
    expect(getAccessToken()).toBeNull()

    const err = w.get('[data-testid="promote-error"]').text()
    expect(err).toContain('401')
    expect(err).toContain('需要登录')
  })

  it('角色不足：按钮禁用并说明需要 admin 或 trader，且一个请求都不发', async () => {
    setTokens('jwt-viewer', 'refresh-viewer')

    const w = mountAs('viewer', 'viewer')

    expect(w.get('[data-testid="promote-btn"]').attributes('disabled')).toBeDefined()
    expect(w.get('[data-testid="promote-denied"]').text()).toContain('admin 或 trader')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('未登录（没有用户名）：按钮禁用，说清放行必须用本人身份', () => {
    const w = mountAs(null, null)

    expect(w.get('[data-testid="promote-btn"]').attributes('disabled')).toBeDefined()
    expect(w.get('[data-testid="promote-denied"]').text()).toContain('需要登录')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('后端 403：如实转述没有权限，不重试、不伪装成功', async () => {
    setTokens('jwt-bob', 'refresh-bob')
    fetchMock.mockResolvedValue(jsonResponse(403, { error: 'forbidden' }))

    const w = mountAs('bob', 'trader')
    await promote(w)

    const err = w.get('[data-testid="promote-error"]').text()
    expect(err).toContain('403')
    expect(err).toContain('没有放行权限')
    expect(w.find('[data-testid="promote-success"]').exists()).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('后端 409：状态不允许放行（需 validated），照原话说', async () => {
    setTokens('jwt-alice', 'refresh-alice')
    fetchMock.mockResolvedValue(jsonResponse(409, { error: 'want validated' }))

    const w = mountAs('alice', 'admin')
    await promote(w)

    const err = w.get('[data-testid="promote-error"]').text()
    expect(err).toContain('409')
    expect(err).toContain('validated')
  })

  it('后端 404：提示坐标过期或网关未开通，不引导反复重试', async () => {
    setTokens('jwt-alice', 'refresh-alice')
    fetchMock.mockResolvedValue(jsonResponse(404, { error: 'artifact_not_found' }))

    const w = mountAs('alice', 'admin')
    await promote(w)

    const err = w.get('[data-testid="promote-error"]').text()
    expect(err).toContain('404')
    expect(err).toContain('网关')
  })
})
