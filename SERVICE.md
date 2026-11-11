---
service-card: 1
repo: tellurion-ui
kind: frontend
lifecycle: production
owner: ruoxizhnya
impact: degrading

requires: []
required-by: []
calls:
  - tellurion
called-by: []

truth:
  readme: README.md
  agents: AGENTS.md
  architecture: docs/ARCHITECTURE.md
  api: docs/api-schema.md
  db: docs/db-schema.md
  dataflow: docs/dataflow.md
  runbook: null
  tasks: docs/TASKS.md

status: evergreen
last-verified: 2026-11-11
verified-by: 2026-11-11 实读 README / AGENTS / ARCHITECTURE / api-schema / db-schema / dataflow / Dockerfile / deploy/nginx-spa.conf；端口与端点数量未写入
---

# 服务卡：tellurion-ui

> **一句话**：呈现层——Vue 3 SPA 与 playwright 端到端套件，只经 `/api` 消费后端，不碰数据层。
>
> `frontend` · `production` · `degrading` · `ruoxizhnya`

## 1. 这是什么

它是系统的唯一人机界面：页面、组件、交互与视觉规范都在这里，构建产物由 nginx 托管，`/api` 反代到 core 的 analysis-service。它只消费接口，不生产契约。

**它拥有**：前端设计系统（`docs/design/`）、页面与组件实现（`web/`）、playwright 端到端用例（`e2e/`）、前端构建与 nginx 托管配置。
**它不拥有**：任何数据库表、任何后端业务逻辑、`openapi.yaml` 契约本体。

## 2. 它不做什么

- 不直连数据库（驱动、连接串、绕过 `/api` 的直连都禁止）。
- 不复制 `openapi.yaml`：契约在 core，复制一份就是第二份真相。
- 不在 `web/` 里做服务端逻辑：BFF 只是 dev 期便利，不是生产路径。
- 不感知仓的拆分：AI 四族经 core 反代进来，前端不直连 agent。
- 不把 e2e 真失败改成跳过或放宽断言来变绿。

## 3. 与谁相连

### 调用它（入边）

| 来源 | 协议 | 用来做什么 | 本仓挂了会怎样 |
|---|---|---|---|
| 浏览器（人） | HTTP | 打开页面、操作全部业务功能 | 人无法操作；后端与自动化链路不受影响 |
| playwright e2e | HTTP | 回归验证真实 API 与页面行为 | 仅测试失败，不影响运行中的系统 |

### 它调用（出边）

| 目标 | 协议 | 用来做什么 | 目标挂了会怎样 |
|---|---|---|---|
| `tellurion` | HTTP（经 nginx `/api` 反代） | 登录、回测、策略、因子、行情、同步、执行、合规、告警，以及 AI 四族的前端入口 | 页面报错或空白；凭据失效时回到登录态；不做本地假数据兜底 |

> 不写 URL、端口。反代目标见 `deploy/nginx-spa.conf`；接口形状见 core 的 `openapi.yaml`，消费面清单见 `docs/api-schema.md`。

## 4. 运行时身份

- **常驻进程**：无业务进程；构建产物是静态文件，由 nginx 托管并对 `/api` 做反代。
- **存活/就绪语义**：本仓**不自带探针**；它的可用性等于「静态资源可加载 + core 的 `/api` 可用」。不要把 core 的 `/health` / `/readyz` 当成本仓探针。
- **部署真相**：`Dockerfile`、`deploy/nginx-spa.conf`。
- **端口**：不在此卡；见上述部署真相。

## 5. 数据与契约归属

| 维度 | 归属 | 真相源 |
|---|---|---|
| DB schema | 无表、不连库、不迁移 | `docs/db-schema.md` |
| 跨仓 DTO / 契约 | 只消费 core 的 `openapi.yaml`；本仓不生产契约 | core `docs/openapi.yaml` |
| 对外 HTTP | 不对外提供 API；只有静态资源与 `/api` 反代 | `deploy/nginx-spa.conf` |

> 数据 owner 的对应关系（回测 / 行情 / 实验 / 鉴权各归谁）见 `docs/db-schema.md` §1 的表；本卡不复述。

## 6. 坏了怎么办

- **影响面**：`degrading`——人无法操作，但后端、编排与自动化链路继续运行；已提交的作业不受影响。
- **先确认（按顺序）**：
  1. 静态资源是否 200；不是则看 nginx 日志与镜像构建产物。
  2. `/api/health` 是否 200；不是则问题在 core，不在本仓。
  3. 只有某一族操作失败时，看该请求的响应码与 `docs/api-schema.md` 记录的消费面，判断是契约变化还是后端故障。
- **升级路径**：`owner` → 跨仓争议 → core `docs/TASKS.md`
- **runbook**：本仓暂无 runbook（缺口已登记，见 `docs/TASKS.md` 的 `UI-RUNBOOK-GAP`）；起停先看 `README.md`「本地开发」。

## 7. 5 分钟后去哪

| 我想…… | 读这个 |
|---|---|
| 知道前端消费了哪些端点族 | `docs/api-schema.md` |
| 知道为什么本仓零表 | `docs/db-schema.md` |
| 知道数据怎么走、哪里 fail-closed | `docs/dataflow.md` |
| 本地起前端 / 跑 e2e | `README.md` |
| 当前在做什么 / 已知缺口 | `docs/TASKS.md` |
| 视觉与交互规范 | `docs/design/index.md` |
| 架构与决策 | `docs/ARCHITECTURE.md`、`docs/adr/` |
