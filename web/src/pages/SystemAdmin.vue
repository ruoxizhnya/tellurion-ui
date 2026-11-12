<template>
  <div class="system-admin" data-testid="system-admin-page">
    <n-page-header
      title="系统管理"
      subtitle="鉴权状态 · 用户 · 审计 · 插件（F18）"
    >
      <template #extra>
        <n-button size="small" :loading="loading" @click="reloadAll">刷新</n-button>
      </template>
    </n-page-header>

    <!-- ── 鉴权状态 / bootstrap ─────────────────────────────── -->
    <n-card title="鉴权状态" embedded>
      <n-empty v-if="!authStatus" description="未取到鉴权状态" />
      <template v-else>
        <n-space align="center">
          <n-tag :type="authStatus.auth_enabled ? 'success' : 'default'" size="small">
            auth_enabled = {{ authStatus.auth_enabled }}
          </n-tag>
          <n-tag :type="authStatus.bootstrap_required ? 'warning' : 'default'" size="small">
            bootstrap_required = {{ authStatus.bootstrap_required }}
          </n-tag>
        </n-space>
        <n-alert
          v-if="!authStatus.bootstrap_required"
          type="default"
          :bordered="false"
          class="hint"
        >
          首个管理员窗口已关闭：POST /api/auth/bootstrap 现在只会返回 403。
        </n-alert>
        <n-form v-else inline class="bootstrap-form" data-testid="bootstrap-form">
          <n-form-item label="首个管理员">
            <n-input v-model:value="bootstrapUser" placeholder="admin" />
          </n-form-item>
          <n-form-item label="密码（≥8）">
            <n-input
              v-model:value="bootstrapPass"
              type="password"
              show-password-on="click"
              placeholder="至少 8 位"
            />
          </n-form-item>
          <n-button
            type="primary"
            :loading="bootstrapping"
            :disabled="!bootstrapUser || bootstrapPass.length < 8"
            data-testid="bootstrap-submit"
            @click="handleBootstrap"
          >
            创建
          </n-button>
        </n-form>
        <div v-if="bootstrapMessage" class="muted" data-testid="bootstrap-message">
          {{ bootstrapMessage }}
        </div>
      </template>
      <div v-if="statusError" class="error-text">{{ statusError }}</div>
    </n-card>

    <n-grid :cols="2" :x-gap="16" :y-gap="16">
      <!-- ── 用户 ───────────────────────────────────────────── -->
      <n-gi>
        <n-card title="用户（GET/POST /api/auth/admin/users）" embedded>
          <div v-if="usersError" class="error-text" data-testid="users-error">{{ usersError }}</div>
          <n-empty v-else-if="users.length === 0" description="暂无用户（或无权读取）" />
          <n-data-table
            v-else
            size="small"
            :columns="userColumns"
            :data="users"
            :row-key="(row: AdminUser) => row.ID"
            :pagination="false"
          />
          <n-divider />
          <n-form inline>
            <n-form-item label="用户名">
              <n-input v-model:value="newUser.username" placeholder="trader01" />
            </n-form-item>
            <n-form-item label="密码（≥8）">
              <n-input
                v-model:value="newUser.password"
                type="password"
                show-password-on="click"
              />
            </n-form-item>
            <n-form-item label="角色">
              <n-select v-model:value="newUser.role" :options="roleOptions" style="width: 110px" />
            </n-form-item>
            <n-button
              type="primary"
              :loading="creatingUser"
              :disabled="!newUser.username || newUser.password.length < 8"
              data-testid="create-user"
              @click="handleCreateUser"
            >
              创建
            </n-button>
          </n-form>
          <div v-if="createUserMessage" class="muted">{{ createUserMessage }}</div>
        </n-card>
      </n-gi>

      <!-- ── 审计 ───────────────────────────────────────────── -->
      <n-gi>
        <n-card title="审计（GET /api/auth/admin/audit）" embedded>
          <div v-if="auditError" class="error-text" data-testid="audit-error">{{ auditError }}</div>
          <n-empty v-else-if="audit.length === 0" description="暂无审计记录（或无权读取）" />
          <n-data-table
            v-else
            size="small"
            :columns="auditColumns"
            :data="audit"
            :row-key="(row: AuditRow) => row.ID"
            :pagination="{ pageSize: 8 }"
            :scroll-x="640"
          />
        </n-card>
      </n-gi>
    </n-grid>

    <!-- ── 插件 ─────────────────────────────────────────────── -->
    <n-card title="插件（/api/plugins* 9 条）" embedded>
      <div v-if="pluginsError" class="error-text" data-testid="plugins-error">{{ pluginsError }}</div>
      <n-space class="plugin-actions" align="center">
        <n-button size="small" :loading="pluginBusy" data-testid="plugins-refresh" @click="loadPlugins">
          刷新
        </n-button>
        <n-button size="small" :loading="pluginBusy" data-testid="plugins-load-all" @click="handleLoadAll">
          load-all
        </n-button>
        <n-button size="small" :loading="pluginBusy" @click="handleReloadPath">
          按路径 reload
        </n-button>
        <n-tag size="small" type="info">watch_dir：{{ watchDir || '—' }}</n-tag>
      </n-space>
      <n-form inline class="plugin-forms">
        <n-form-item label="load 路径">
          <n-input v-model:value="loadPath" placeholder="/opt/tellurion/plugins/x.so" style="width: 320px" />
        </n-form-item>
        <n-button
          size="small"
          :loading="pluginBusy"
          :disabled="!loadPath"
          data-testid="plugins-load"
          @click="handleLoad"
        >
          load
        </n-button>
        <n-form-item label="watch 目录">
          <n-input v-model:value="watchDirInput" placeholder="/opt/tellurion/plugins" style="width: 280px" />
        </n-form-item>
        <n-button
          size="small"
          :loading="pluginBusy"
          :disabled="!watchDirInput"
          data-testid="plugins-watch-dir"
          @click="handleSetWatchDir"
        >
          设置
        </n-button>
      </n-form>
      <div v-if="pluginMessage" class="muted" data-testid="plugins-message">{{ pluginMessage }}</div>
      <div v-if="loadAllErrors.length" class="error-text">
        load-all 部分失败：{{ loadAllErrors.join('；') }}
      </div>
      <n-empty v-if="plugins.length === 0" description="暂无插件" />
      <n-data-table
        v-else
        size="small"
        :columns="pluginColumns"
        :data="plugins"
        :row-key="(row: PluginInfo) => row.name"
        :pagination="false"
        :scroll-x="900"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import {
  NAlert,
  NButton,
  NCard,
  NDataTable,
  NDivider,
  NEmpty,
  NForm,
  NFormItem,
  NGi,
  NGrid,
  NInput,
  NPageHeader,
  NSelect,
  NSpace,
  NTag,
} from 'naive-ui'
import {
  bootstrapFirstAdmin,
  createUser,
  getAuthStatus,
  listAudit,
  listUsers,
  type AdminUser,
  type AuditRow,
  type AuthStatus,
} from '@/api/auth'
import {
  getPlugin,
  getWatchDir,
  listPlugins,
  loadAllPlugins,
  loadPlugin,
  reloadPluginByName,
  reloadPluginByPath,
  setWatchDir,
  unloadPlugin,
  type PluginInfo,
} from '@/api/plugins'

// ── 鉴权状态 ───────────────────────────────────────────────────────
const authStatus = ref<AuthStatus | null>(null)
const statusError = ref('')
const bootstrapUser = ref('')
const bootstrapPass = ref('')
const bootstrapping = ref(false)
const bootstrapMessage = ref('')

async function loadStatus() {
  statusError.value = ''
  try {
    authStatus.value = await getAuthStatus()
  } catch (e) {
    authStatus.value = null
    statusError.value = `读取鉴权状态失败：${errText(e)}`
  }
}

async function handleBootstrap() {
  bootstrapping.value = true
  bootstrapMessage.value = ''
  try {
    await bootstrapFirstAdmin(bootstrapUser.value.trim(), bootstrapPass.value)
    bootstrapMessage.value = '首个管理员已创建；窗口关闭后该端点将返回 403。'
    await loadStatus()
    await loadUsers()
  } catch (e) {
    bootstrapMessage.value = `创建失败：${errText(e)}`
  } finally {
    bootstrapping.value = false
  }
}

// ── 用户 ───────────────────────────────────────────────────────────
const users = ref<AdminUser[]>([])
const usersError = ref('')
const creatingUser = ref(false)
const createUserMessage = ref('')
const newUser = reactive({
  username: '',
  password: '',
  role: 'viewer' as 'viewer' | 'trader' | 'admin',
})
const roleOptions = [
  { label: 'viewer', value: 'viewer' },
  { label: 'trader', value: 'trader' },
  { label: 'admin', value: 'admin' },
]

async function loadUsers() {
  usersError.value = ''
  try {
    const res = await listUsers()
    users.value = res.users ?? []
  } catch (e) {
    users.value = []
    usersError.value = `读取用户失败（需要 admin）：${errText(e)}`
  }
}

async function handleCreateUser() {
  creatingUser.value = true
  createUserMessage.value = ''
  try {
    const created = await createUser({
      username: newUser.username.trim(),
      password: newUser.password,
      role: newUser.role,
    })
    createUserMessage.value = `已创建 #${created.user_id} ${created.username}（${created.role}）`
    newUser.username = ''
    newUser.password = ''
    await loadUsers()
  } catch (e) {
    createUserMessage.value = `创建失败：${errText(e)}`
  } finally {
    creatingUser.value = false
  }
}

const userColumns: DataTableColumns<AdminUser> = [
  { title: 'ID', key: 'ID', width: 70 },
  { title: '用户名', key: 'Username', width: 140 },
  { title: '角色', key: 'Role', width: 100 },
  {
    title: '创建时间',
    key: 'CreatedAt',
    width: 170,
    render: (row) => formatTime(row.CreatedAt),
  },
  {
    title: '最近登录',
    key: 'LastLoginAt',
    width: 170,
    render: (row) => (row.LastLoginAt ? formatTime(row.LastLoginAt) : '—'),
  },
  {
    title: '禁用',
    key: 'Disabled',
    width: 80,
    render: (row) => (row.Disabled ? '是' : '否'),
  },
]

// ── 审计 ───────────────────────────────────────────────────────────
const audit = ref<AuditRow[]>([])
const auditError = ref('')

async function loadAudit() {
  auditError.value = ''
  try {
    const res = await listAudit()
    audit.value = res.audit ?? []
  } catch (e) {
    audit.value = []
    auditError.value = `读取审计失败（需要 admin）：${errText(e)}`
  }
}

const auditColumns: DataTableColumns<AuditRow> = [
  { title: 'ID', key: 'ID', width: 70 },
  { title: '用户', key: 'UserID', width: 70, render: (row) => row.UserID ?? '—' },
  { title: '角色', key: 'Role', width: 80 },
  { title: '方法', key: 'Method', width: 70 },
  { title: '端点', key: 'Endpoint', ellipsis: { tooltip: true } },
  { title: '状态', key: 'StatusCode', width: 70 },
  {
    title: '时间',
    key: 'Timestamp',
    width: 170,
    render: (row) => formatTime(row.Timestamp),
  },
]

// ── 插件 ───────────────────────────────────────────────────────────
const plugins = ref<PluginInfo[]>([])
const pluginsError = ref('')
const pluginBusy = ref(false)
const pluginMessage = ref('')
const loadAllErrors = ref<string[]>([])
const loadPath = ref('')
const watchDir = ref('')
const watchDirInput = ref('')

async function loadPlugins() {
  pluginsError.value = ''
  try {
    const res = await listPlugins()
    plugins.value = res.plugins ?? []
    const wd = await getWatchDir()
    watchDir.value = wd.watch_dir ?? ''
  } catch (e) {
    plugins.value = []
    pluginsError.value = `读取插件失败：${errText(e)}`
  }
}

async function withPluginBusy(fn: () => Promise<void>) {
  pluginBusy.value = true
  pluginMessage.value = ''
  loadAllErrors.value = []
  try {
    await fn()
  } catch (e) {
    pluginMessage.value = `操作失败：${errText(e)}`
  } finally {
    pluginBusy.value = false
  }
}

function handleLoad() {
  return withPluginBusy(async () => {
    const res = await loadPlugin(loadPath.value.trim())
    pluginMessage.value = res.message
    await loadPlugins()
  })
}

function handleReloadPath() {
  return withPluginBusy(async () => {
    if (!loadPath.value.trim()) {
      pluginMessage.value = '请先填写 load 路径'
      return
    }
    const res = await reloadPluginByPath(loadPath.value.trim())
    pluginMessage.value = res.message
    await loadPlugins()
  })
}

function handleLoadAll() {
  return withPluginBusy(async () => {
    const res = await loadAllPlugins()
    pluginMessage.value = res.message
    loadAllErrors.value = res.errors ?? []
    await loadPlugins()
  })
}

function handleSetWatchDir() {
  return withPluginBusy(async () => {
    const res = await setWatchDir(watchDirInput.value.trim())
    pluginMessage.value = `${res.message}：${res.dir}`
    await loadPlugins()
  })
}

function handleUnload(name: string) {
  return withPluginBusy(async () => {
    const res = await unloadPlugin(name)
    pluginMessage.value = res.message
    await loadPlugins()
  })
}

function handleReloadName(name: string) {
  return withPluginBusy(async () => {
    const res = await reloadPluginByName(name)
    pluginMessage.value = res.message
    await loadPlugins()
  })
}

function handleInspect(name: string) {
  return withPluginBusy(async () => {
    const info = await getPlugin(name)
    pluginMessage.value = `${info.name}：${info.status}（${info.version || 'no version'}）`
  })
}

const pluginColumns: DataTableColumns<PluginInfo> = [
  { title: '名称', key: 'name', width: 160 },
  { title: '状态', key: 'status', width: 100 },
  { title: '版本', key: 'version', width: 100 },
  { title: '路径', key: 'path', ellipsis: { tooltip: true } },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row) =>
      h(NSpace, { size: 4 }, () => [
        h(
          NButton,
          { size: 'tiny', onClick: () => handleInspect(row.name) },
          { default: () => '详情' },
        ),
        h(
          NButton,
          { size: 'tiny', onClick: () => handleReloadName(row.name) },
          { default: () => 'reload' },
        ),
        h(
          NButton,
          { size: 'tiny', type: 'error', onClick: () => handleUnload(row.name) },
          { default: () => 'unload' },
        ),
      ]),
  },
]

// ── 通用 ───────────────────────────────────────────────────────────
const loading = ref(false)

async function reloadAll() {
  loading.value = true
  await Promise.all([loadStatus(), loadUsers(), loadAudit(), loadPlugins()])
  loading.value = false
}

function errText(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

function formatTime(ts: string | null): string {
  if (!ts) return '—'
  const d = new Date(ts)
  return isNaN(d.getTime()) ? ts : d.toLocaleString('zh-CN', { hour12: false })
}

onMounted(async () => {
  await loadStatus()
  await Promise.all([loadUsers(), loadAudit(), loadPlugins()])
})
</script>

<style scoped>
.system-admin {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.hint {
  margin: 12px 0;
}

.bootstrap-form {
  margin-top: 12px;
}

.muted {
  font-size: 12px;
  color: var(--q-text3);
  margin-top: 8px;
}

.error-text {
  color: var(--q-danger-text);
  font-size: 12px;
}

.plugin-actions {
  margin-bottom: 12px;
}

.plugin-forms {
  margin-bottom: 8px;
}
</style>
