// 鉴权域的 API —— 后端是 `cmd/analysis/handlers_auth.go`。
//
// 三个端点，其中两个是**公开**的（见 handlers_auth.go 里各自的注释）：
//
//   GET  /api/auth/status     鉴权开没开、首个管理员窗口还开着吗
//   POST /api/auth/bootstrap  一次性创建首个管理员（窗口关了就永远 403）
//   POST /api/auth/login      username + password -> access/refresh
//
// `/api/auth/status` 必须在**没有任何凭据**的情况下可调用：SPA 用它决定
// 「显示登录页」还是「显示创建首个管理员」，而这个决定发生在登录之前。
// 后端把它列在 pkg/auth 的 publicPaths 白名单里；那张名单和路由表是否一致
// 由 cmd/analysis/auth_public_paths_test.go 机器校验。

import api from './client'

export interface AuthStatus {
  auth_enabled: boolean
  bootstrap_required: boolean
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  username?: string
  role?: string
}

export interface MeResponse {
  user_id: number
  username: string
  role: string
}

/** 公开。返回该实例的鉴权姿势；失败由调用方按「fail closed」处理。 */
export async function getAuthStatus(): Promise<AuthStatus> {
  return api.get<AuthStatus>('/api/auth/status')
}

/** 公开（仅当 users 表为空时可用一次）。成功后直接返回 token，无需再登录。 */
export async function bootstrapFirstAdmin(
  username: string,
  password: string,
): Promise<TokenResponse> {
  return api.post<TokenResponse>('/api/auth/bootstrap', { username, password })
}

export async function login(username: string, password: string): Promise<TokenResponse> {
  return api.post<TokenResponse>('/api/auth/login', { username, password })
}

/** 需要凭据。用来在页面刷新后确认手上的 token 还有效。 */
export async function getMe(): Promise<MeResponse> {
  return api.get<MeResponse>('/api/auth/me')
}

/** 用 refresh token 换一对新 token。由 client.ts 在 401 时驱动，UI 不直接调。 */
export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  return api.post<TokenResponse>('/api/auth/refresh', { refresh_token: refreshToken })
}

// ============================================================
// 管理员用户管理（/api/auth/admin/*，admin 角色）
//
// 注意：后端 `pkg/auth.User` / `AuditLog` 没有 JSON tag，序列化后是
// Go 字段名（大驼峰），且 `User.PasswordHash` 也会被序列化。前端只读
// 白名单字段，**绝不渲染 PasswordHash**。
// ============================================================

export interface AdminUser {
  ID: number
  Username: string
  Role: string
  CreatedAt: string
  LastLoginAt: string | null
  Disabled: boolean
}

export interface AuditRow {
  ID: number
  UserID: number | null
  Role: string
  IP: string
  Endpoint: string
  Method: string
  PayloadHash: string
  TraceID: string
  StatusCode: number
  Timestamp: string
}

export interface CreateUserRequest {
  username: string
  /** 后端要求 ≥8 位（binding:"min=8"）。 */
  password: string
  role: 'viewer' | 'trader' | 'admin'
}

export interface CreatedUser {
  user_id: number
  username: string
  role: string
}

/** GET /api/auth/admin/users（admin） */
export async function listUsers(): Promise<{ users: AdminUser[] }> {
  return api.get<{ users: AdminUser[] }>('/api/auth/admin/users')
}

/** POST /api/auth/admin/users（admin） */
export async function createUser(req: CreateUserRequest): Promise<CreatedUser> {
  return api.post<CreatedUser>('/api/auth/admin/users', req)
}

/** GET /api/auth/admin/audit（admin） */
export async function listAudit(): Promise<{ audit: AuditRow[] }> {
  return api.get<{ audit: AuditRow[] }>('/api/auth/admin/audit')
}
