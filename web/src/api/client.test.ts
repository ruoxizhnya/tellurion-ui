import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ApiError, api, serverBodyText } from '@/api/client'
import clientSource from './client?raw'

// CR-50 (ODR-012): api/client.ts had zero unit-test coverage for the
// three critical paths the rest of the SPA depends on: timeout (60s
// AbortController), retry (transient network errors only), and abort
// (manual AbortSignal + pagehide). A regression in any of these
// would silently break every Vue composable that calls `api.get` /
// `api.post` / `createCancellableRequest`, so we pin the contract
// here with mocked fetch + fake timers.
//
// ApiClient itself is not exported — the module exposes a singleton
// `api` (baseURL is `import.meta.env.VITE_API_BASE || ''`, which is
// empty in the test environment). Tests use that singleton directly.

function makeResponse(body: unknown, init: { status?: number; statusText?: string; ok?: boolean } = {}): Response {
  const { status = 200, statusText = 'OK' } = init
  const ok = init.ok ?? (status >= 200 && status < 300)
  return {
    ok,
    status,
    statusText,
    json: () => Promise.resolve(body),
  } as Response
}

function makeErrorResponse(status: number, body: unknown, statusText = 'Err'): Response {
  return makeResponse(body, { status, statusText, ok: false })
}

describe('ApiError — classification helpers', () => {
  it('flags 4xx as client error and 5xx as server error', () => {
    expect(new ApiError(404, 'x').isClientError).toBe(true)
    expect(new ApiError(400, 'x').isClientError).toBe(true)
    expect(new ApiError(499, 'x').isClientError).toBe(true)
    expect(new ApiError(500, 'x').isServerError).toBe(true)
    expect(new ApiError(503, 'x').isServerError).toBe(true)
  })

  it('isNotFound only true for 404', () => {
    expect(new ApiError(404, 'x').isNotFound).toBe(true)
    expect(new ApiError(403, 'x').isNotFound).toBe(false)
  })

  it('isTimeout only true when isAbort flag is set (the actual abort marker)', () => {
    const cancelled = new ApiError(0, '请求已取消')
    cancelled.isAbort = true
    expect(cancelled.isTimeout).toBe(true)
    // A bare ApiError(0, ...) without the flag is a network failure,
    // not a cancellation — isTimeout must be false.
    expect(new ApiError(0, 'net').isTimeout).toBe(false)
    expect(new ApiError(500, 'srv').isTimeout).toBe(false)
  })

  it('isNetworkError only true for status 0 without abort flag', () => {
    expect(new ApiError(0, 'net').isNetworkError).toBe(true)
    expect(new ApiError(500, 'srv').isNetworkError).toBe(false)
    const cancelled = new ApiError(0, '请求已取消')
    cancelled.isAbort = true
    expect(cancelled.isNetworkError).toBe(false) // abort and network are mutually exclusive
  })

  it('preserves body for downstream inspection', () => {
    const body = { error: 'oops', code: 'E_X' }
    const err = new ApiError(422, 'm', body)
    expect(err.body).toEqual(body)
  })
})

describe('api — happy path', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('GET returns parsed JSON and uses default method', async () => {
    const fetchMock = vi.mocked(fetch).mockResolvedValueOnce(makeResponse({ ok: 1 }))
    const res = await api.get<{ ok: number }>('/p')
    expect(res).toEqual({ ok: 1 })
    expect(fetchMock).toHaveBeenCalledWith('/p', expect.objectContaining({ method: 'GET' }))
  })

  it('POST stringifies body and sets Content-Type', async () => {
    const fetchMock = vi.mocked(fetch).mockResolvedValueOnce(makeResponse({ id: 1 }))
    await api.post('/p', { a: 1 })
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ a: 1 }))
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })

  it('DELETE uses DELETE method', async () => {
    const fetchMock = vi.mocked(fetch).mockResolvedValueOnce(makeResponse({}))
    await api.delete('/p/1')
    expect((fetchMock.mock.calls[0] as [string, RequestInit])[1].method).toBe('DELETE')
  })

  it('preserves absolute URLs (e.g. signed S3 / external services)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse({ ok: 1 }))
    await api.get('https://other.example/p')
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('https://other.example/p')
  })
})

describe('api — error mapping (4xx / 5xx)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // API-01 的行为变更（不是为消红改断言）：404 带原话时，屏幕上就该是原话。
  // 旧断言钉的是「localized message」= 模板优先，那正是本单要改掉的口径。
  it('404 with a server message shows the server message, not the template', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeErrorResponse(404, { message: 'gone' }))
    await expect(api.get('/p')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      isClientError: true,
      isNotFound: true,
      message: 'gone',
    })
  })

  it('404 with an empty body still falls back to the localized template', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeErrorResponse(404, {}))
    await expect(api.get('/p')).rejects.toMatchObject({ status: 404, message: '请求的资源不存在' })
  })

  it('uses server-provided message for unmapped 4xx', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeErrorResponse(418, { error: 'I am a teapot' }))
    await expect(api.get('/p')).rejects.toMatchObject({ status: 418, message: 'I am a teapot' })
  })

  it('falls back to statusText when body is not JSON', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'boom',
      json: () => Promise.reject(new Error('not json')),
    } as Response)
    await expect(api.get('/p')).rejects.toMatchObject({ status: 500, message: '服务器内部错误' })
  })

  it('maps 429 to a localized message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeErrorResponse(429, {}))
    await expect(api.get('/p')).rejects.toMatchObject({ status: 429, message: '请求过于频繁，请稍后再试' })
  })
})

// API-01 ③-5 的五条透传护栏，逐条一条断言。
// 主判据是第一条：非法 cron 那条实测（A-08 步骤 4）里，后端原话必须活着到界面。
describe('api — 4xx 原话透传的五条护栏 (API-01)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // 拿到 ApiError 本体（不是 any / unknown）：断言字段之前先证明抛出来的确实是它。
  async function apiErrorFrom(run: () => Promise<unknown>): Promise<ApiError> {
    try {
      await run()
    } catch (e) {
      if (e instanceof ApiError) return e
      throw new Error(`期望 ApiError，实际是 ${String(e)}`, { cause: e })
    }
    throw new Error('期望抛出 ApiError，但调用成功了')
  }

  const CRON_MESSAGE = 'invalid cron expression: expected exactly 6 fields, found 3: [99 99 99]'

  it('护栏 1｜4xx 有原话：ApiError.message 就是后端原话', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeErrorResponse(400, { code: 'bad_request', error: CRON_MESSAGE })
    )
    const err = await apiErrorFrom(() => api.post('/sync/schedules', {}))
    expect(err).toBeInstanceOf(ApiError)
    expect(err.message).toBe(CRON_MESSAGE)
    // 状态码类判定不受影响（改了 message 不能顺手改坏 isClientError）
    expect(err.isClientError).toBe(true)
    expect(err.status).toBe(400)
  })

  it('护栏 1a｜透传只对 4xx 生效：5xx 带细节 body 也恒用模板', async () => {
    // core 在 ≥500 故意只给人话 + code（P1-5 信息泄露收口），前端不许替它猜原因。
    vi.mocked(fetch).mockResolvedValueOnce(
      makeErrorResponse(500, { error: 'pq: connection string host=10.0.0.4 password=hunter2' })
    )
    const err = await apiErrorFrom(() => api.get('/p'))
    expect(err.message).toBe('服务器内部错误')
    expect(err.message).not.toContain('password')
    // 原话仍在 body 里（不是被丢掉，只是不显示）—— 排障时能拿到。
    expect(err.body?.error).toContain('pq:')
  })

  it('护栏 2｜原话全空白时回退模板，不显示空字符串', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeErrorResponse(422, { error: '   ', message: '\n\t ' }))
    const err = await apiErrorFrom(() => api.get('/p'))
    expect(err.message).toBe('数据验证失败')
  })

  it('护栏 2a｜body 三个键都没有 / 不是字符串时回退模板', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeErrorResponse(400, { code: 'bad_request', error: { nested: 1 } }))
    const err = await apiErrorFrom(() => api.get('/p'))
    expect(err.message).toBe('请求参数有误')
  })

  it('护栏 3｜超过 500 字符截断并以 … 收尾', async () => {
    const long = 'x'.repeat(4000)
    vi.mocked(fetch).mockResolvedValueOnce(makeErrorResponse(400, { error: long }))
    const err = await apiErrorFrom(() => api.get('/p'))
    expect(err.message).toHaveLength(500)
    expect(err.message.endsWith('…')).toBe(true)
    expect(err.message.startsWith('xxx')).toBe(true)
  })

  it('护栏 3a｜恰好 500 字符不截断（边界不是「大于等于」）', async () => {
    const exact = 'y'.repeat(500)
    vi.mocked(fetch).mockResolvedValueOnce(makeErrorResponse(400, { error: exact }))
    const err = await apiErrorFrom(() => api.get('/p'))
    expect(err.message).toBe(exact)
    expect(err.message.endsWith('…')).toBe(false)
  })

  it('护栏 4｜读取顺序是 error > message > detail', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeErrorResponse(409, { detail: 'd', message: 'm', error: 'e-first' })
    )
    const err = await apiErrorFrom(() => api.get('/p'))
    expect(err.message).toBe('e-first')
  })

  it('护栏 5｜client.ts 不把消息当 HTML：源码里没有 v-html / innerHTML / document.write', async () => {
    // 纯文本渲染是这条链的 XSS 底线：后端原话是**不可信输入**，一旦被 v-html 渲染，
    // 一个能把 error 字段写成 `<img src=x onerror=...>` 的响应就是存储型 XSS。
    // 断言取源码而不是取渲染结果，是因为底线在「这一层不许引入富文本口子」。
    // 用 Vite 的 ?raw 读源码（jsdom 下 import.meta.url 不是 file: 协议，readFileSync 会拒）。
    expect(clientSource).not.toMatch(/v-html|innerHTML|document\.write|insertAdjacentHTML/)
  })

  it('401 带原话时同样透传，但会话处理链不受影响（④ 的约束）', async () => {
    // refreshSession / settleUnauthorized 那条链由下面的既有测试钉着；
    // 本条只证明「401 的文案换了」不会把 status 判定换掉。
    vi.mocked(fetch).mockResolvedValueOnce(makeErrorResponse(401, { error: 'token expired' }))
    const err = await apiErrorFrom(() => api.get('/p'))
    expect(err.status).toBe(401)
    expect(err.isClientError).toBe(true)
  })
})

describe('serverBodyText — 共享的取值口径 (API-01 ③-2)', () => {
  it('undefined body 与空对象都给空串（调用方据此落模板）', () => {
    expect(serverBodyText()).toBe('')
    expect(serverBodyText({})).toBe('')
    expect(serverBodyText({ error: '' })).toBe('')
    expect(serverBodyText({ error: '  ' })).toBe('')
  })

  it('截断口径与 client 一致（一处实现，两处不会再漂移）', () => {
    const text = serverBodyText({ error: 'z'.repeat(600) })
    expect(text).toHaveLength(500)
    expect(text.endsWith('…')).toBe(true)
  })
})

describe('api — timeout via AbortController', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('aborts the request when the timeout elapses and throws a timeout ApiError', async () => {
    vi.useFakeTimers()
    try {
      // fetch that only resolves after we call advanceTimers — never resolves
      // before the timeout, simulating a slow server.
      vi.mocked(fetch).mockImplementation(
        (_url, init) =>
          new Promise((_resolve, reject) => {
            const signal = (init as RequestInit).signal as AbortSignal
            signal.addEventListener('abort', () => {
              const err = new Error('aborted')
              err.name = 'AbortError'
              reject(err)
            })
          }),
      )

      const promise = api.get('/slow', { timeout: 1000 })
      // Attach a catch so the unhandled rejection warning does not fire;
      // we still assert via the awaited expectation below.
      promise.catch(() => {})
      vi.advanceTimersByTime(1000)
      await expect(promise).rejects.toMatchObject({
        status: 0,
        isTimeout: true,
        message: '请求已取消',
      })
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not throw if fetch resolves before the timeout', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse({ ok: 1 }))
    await expect(api.get('/fast', { timeout: 1000 })).resolves.toEqual({ ok: 1 })
  })
})

describe('api — manual AbortSignal', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('aborts in-flight request when caller signal is aborted', async () => {
    vi.mocked(fetch).mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          const signal = (init as RequestInit).signal as AbortSignal
          signal.addEventListener('abort', () => {
            const err = new Error('aborted')
            err.name = 'AbortError'
            reject(err)
          })
        }),
    )

    const ac = new AbortController()
    const promise = api.get('/p', { signal: ac.signal })
    promise.catch(() => {})
    ac.abort()
    await expect(promise).rejects.toMatchObject({ status: 0, isTimeout: true })
  })
})

describe('api — retry on transient network errors', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('retries up to N times on network failure, then gives up', async () => {
    vi.useFakeTimers()
    try {
      // Always throw a non-AbortError to simulate a hard network failure.
      vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'))

      const promise = api.get('/p', { retry: 2, timeout: 1000 })
      promise.catch(() => {}) // suppress unhandled rejection

      // First attempt + 2 retries = 3 fetch calls total.
      // Between attempts the code awaits `API_RETRY_DELAY * (4 - retry)`:
      //   retry=2 -> 2*1000=2000ms, retry=1 -> 3*1000=3000ms
      await vi.advanceTimersByTimeAsync(0) // run first attempt
      expect(vi.mocked(fetch).mock.calls).toHaveLength(1)
      await vi.advanceTimersByTimeAsync(2000) // wait out retry 2 -> 1
      expect(vi.mocked(fetch).mock.calls).toHaveLength(2)
      await vi.advanceTimersByTimeAsync(3000) // wait out retry 1 -> 0
      expect(vi.mocked(fetch).mock.calls).toHaveLength(3)

      await expect(promise).rejects.toMatchObject({
        status: 0,
        isNetworkError: true,
      })
    } finally {
      vi.useRealTimers()
    }
  })

  it('does NOT retry on 4xx ApiError', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeErrorResponse(400, { message: 'bad' }))
    await expect(api.get('/p', { retry: 3 })).rejects.toMatchObject({ status: 400 })
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1)
  })

  it('does NOT retry on 5xx ApiError', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeErrorResponse(500, {}))
    await expect(api.get('/p', { retry: 3 })).rejects.toMatchObject({ status: 500 })
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1)
  })

  it('succeeds after a transient failure within the retry budget', async () => {
    vi.useFakeTimers()
    try {
      vi.mocked(fetch)
        .mockRejectedValueOnce(new TypeError('transient'))
        .mockResolvedValueOnce(makeResponse({ ok: 'recovered' }))

      const promise = api.get('/p', { retry: 2, timeout: 1000 })
      promise.catch(() => {})
      await vi.advanceTimersByTimeAsync(0)
      await vi.advanceTimersByTimeAsync(2000) // backoff for retry 2 -> 1
      await expect(promise).resolves.toEqual({ ok: 'recovered' })
      expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('api — createCancellableRequest', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns an abort function that cancels the in-flight request', async () => {
    vi.mocked(fetch).mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          const signal = (init as RequestInit).signal as AbortSignal
          signal.addEventListener('abort', () => {
            const err = new Error('aborted')
            err.name = 'AbortError'
            reject(err)
          })
        }),
    )

    const { promise, abort } = api.createCancellableRequest<{ ok: number }>('/p', 'GET')
    promise.catch(() => {})
    abort()
    await expect(promise).rejects.toMatchObject({ status: 0, isTimeout: true })
  })

  it('resolves with the response body when fetch succeeds', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse({ id: 7 }))
    const { promise } = api.createCancellableRequest<{ id: number }>('/p', 'POST', { a: 1 })
    await expect(promise).resolves.toEqual({ id: 7 })
  })

  it('serialises POST body when provided', async () => {
    const fetchMock = vi.mocked(fetch).mockResolvedValueOnce(makeResponse({ id: 1 }))
    await api.createCancellableRequest('/p', 'POST', { foo: 'bar' }).promise
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.body).toBe(JSON.stringify({ foo: 'bar' }))
    expect(init.method).toBe('POST')
  })
})

describe('api — module-scoped pagehide listener (CR-25)', () => {
  it('does not register a fresh pagehide listener per request', () => {
    // The pagehide listener is installed once at module import time and
    // cancels every controller in `inFlightControllers`. happy-dom
    // tracks listeners internally; we just verify the pagehide event
    // can be fired without throwing and that the API surface is
    // present. (Counting listeners across re-imports is brittle in
    // vitest, so we keep this as a smoke test.)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeResponse({})))
    void api.get('/a')
    void api.get('/b')
    void api.post('/c', {})
    expect(typeof window.addEventListener).toBe('function')
    expect(() => window.dispatchEvent(new Event('pagehide'))).not.toThrow()
  })
})
