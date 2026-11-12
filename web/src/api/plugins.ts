// 插件管理域 —— 后端是 `cmd/analysis/handlers_plugin.go`（共 9 条）。
//
// 读端点只需全局认证；**变更端点要求 admin**（REV-08：load/reload 会把
// 请求体路径交给 plugin.Open，.so 的 init 在进程内执行；watch-dir 是路径
// 校验锚点）。前端不复制这条判断：后端会回 401/403/503，页面原样展示。
//
// 注意 `pkg/strategy.PluginInfo` 有 JSON tag，字段是小写蛇形。

import api from './client'

export interface PluginInfo {
  name: string
  path: string
  loaded_at: string
  last_mod_time: string
  size: number
  version: string
  git_hash: string
  description: string
  status: 'active' | 'unloaded' | 'error'
  error?: string
}

export interface PluginListResponse {
  plugins: PluginInfo[]
  count: number
}

export interface PluginActionResponse {
  message: string
  plugin?: PluginInfo
  name?: string
}

export interface LoadAllResponse {
  message: string
  loaded: PluginInfo[]
  errors: string[]
  count: number
  errCount: number
}

export interface WatchDirResponse {
  watch_dir: string
}

/** GET /api/plugins */
export async function listPlugins(): Promise<PluginListResponse> {
  return api.get<PluginListResponse>('/api/plugins')
}

/** GET /api/plugins/active */
export async function listActivePlugins(): Promise<PluginListResponse> {
  return api.get<PluginListResponse>('/api/plugins/active')
}

/** GET /api/plugins/:name */
export async function getPlugin(name: string): Promise<PluginInfo> {
  return api.get<PluginInfo>(`/api/plugins/${encodeURIComponent(name)}`)
}

/** POST /api/plugins/load（admin） */
export async function loadPlugin(path: string): Promise<PluginActionResponse> {
  return api.post<PluginActionResponse>('/api/plugins/load', { path })
}

/** POST /api/plugins/:name/unload（admin） */
export async function unloadPlugin(name: string): Promise<PluginActionResponse> {
  return api.post<PluginActionResponse>(
    `/api/plugins/${encodeURIComponent(name)}/unload`,
  )
}

/** POST /api/plugins/:name/reload（admin） */
export async function reloadPluginByName(name: string): Promise<PluginActionResponse> {
  return api.post<PluginActionResponse>(
    `/api/plugins/${encodeURIComponent(name)}/reload`,
  )
}

/** POST /api/plugins/reload（admin，按路径重载） */
export async function reloadPluginByPath(path: string): Promise<PluginActionResponse> {
  return api.post<PluginActionResponse>('/api/plugins/reload', { path })
}

/** POST /api/plugins/load-all（admin；部分失败回 207） */
export async function loadAllPlugins(): Promise<LoadAllResponse> {
  return api.post<LoadAllResponse>('/api/plugins/load-all')
}

/** POST /api/plugins/watch-dir（admin） */
export async function setWatchDir(dir: string): Promise<{ message: string; dir: string }> {
  return api.post<{ message: string; dir: string }>('/api/plugins/watch-dir', { dir })
}

/** GET /api/plugins/watch-dir */
export async function getWatchDir(): Promise<WatchDirResponse> {
  return api.get<WatchDirResponse>('/api/plugins/watch-dir')
}
