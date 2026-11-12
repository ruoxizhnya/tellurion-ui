// plugins.test.ts — A-10 / F18：插件管理 9 条端点必须逐条对齐
// `cmd/analysis/handlers_plugin.go` 的真实路由。变更端点的 admin 门槛由
// 后端 `RequireRole` 决定，前端只负责把路径/请求体送到位。

import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './client'
import {
  getPlugin,
  getWatchDir,
  listActivePlugins,
  listPlugins,
  loadAllPlugins,
  loadPlugin,
  reloadPluginByName,
  reloadPluginByPath,
  setWatchDir,
  unloadPlugin,
} from './plugins'

vi.mock('./client', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('插件读面（4 条）', () => {
  it('GET /api/plugins', async () => {
    vi.mocked(api.get).mockResolvedValue({ plugins: [], count: 0 })
    await listPlugins()
    expect(api.get).toHaveBeenCalledWith('/api/plugins')
  })

  it('GET /api/plugins/active', async () => {
    vi.mocked(api.get).mockResolvedValue({ plugins: [], count: 0 })
    await listActivePlugins()
    expect(api.get).toHaveBeenCalledWith('/api/plugins/active')
  })

  it('GET /api/plugins/:name（名字做 URL 编码）', async () => {
    vi.mocked(api.get).mockResolvedValue({ name: 'ma cross' })
    await getPlugin('ma cross')
    expect(api.get).toHaveBeenCalledWith('/api/plugins/ma%20cross')
  })

  it('GET /api/plugins/watch-dir', async () => {
    vi.mocked(api.get).mockResolvedValue({ watch_dir: '/opt/plugins' })
    await getWatchDir()
    expect(api.get).toHaveBeenCalledWith('/api/plugins/watch-dir')
  })
})

describe('插件变更面（6 条操作，admin）', () => {
  it('POST /api/plugins/load 透传 path', async () => {
    vi.mocked(api.post).mockResolvedValue({ message: 'ok' })
    await loadPlugin('/opt/plugins/x.so')
    expect(api.post).toHaveBeenCalledWith('/api/plugins/load', { path: '/opt/plugins/x.so' })
  })

  it('POST /api/plugins/:name/unload', async () => {
    vi.mocked(api.post).mockResolvedValue({ message: 'ok' })
    await unloadPlugin('macross')
    expect(api.post).toHaveBeenCalledWith('/api/plugins/macross/unload')
  })

  it('POST /api/plugins/:name/reload', async () => {
    vi.mocked(api.post).mockResolvedValue({ message: 'ok' })
    await reloadPluginByName('macross')
    expect(api.post).toHaveBeenCalledWith('/api/plugins/macross/reload')
  })

  it('POST /api/plugins/reload 透传 path', async () => {
    vi.mocked(api.post).mockResolvedValue({ message: 'ok' })
    await reloadPluginByPath('/opt/plugins/x.so')
    expect(api.post).toHaveBeenCalledWith('/api/plugins/reload', { path: '/opt/plugins/x.so' })
  })

  it('POST /api/plugins/load-all', async () => {
    vi.mocked(api.post).mockResolvedValue({ message: 'ok', loaded: [], errors: [] })
    await loadAllPlugins()
    expect(api.post).toHaveBeenCalledWith('/api/plugins/load-all')
  })

  it('POST /api/plugins/watch-dir 透传 dir', async () => {
    vi.mocked(api.post).mockResolvedValue({ message: 'ok', dir: '/opt/plugins' })
    await setWatchDir('/opt/plugins')
    expect(api.post).toHaveBeenCalledWith('/api/plugins/watch-dir', { dir: '/opt/plugins' })
  })
})
