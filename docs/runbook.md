---
status: active
last-verified: 2026-11-12
verified-by: UI-RUNBOOK-GAP（2026-11-12）：四类现象逐条对本机真栈实测（镜像内 nginx 起容器 + 隔离网络模拟后端不可达），curl 状态码与 nginx error log 均留档；promote 段四类拒绝边界现场验过，成功态因本机未装配编译器已登记重开条件
---

# 现场排障手册 — tellurion-ui

> 这份手册只回答一件事：**界面看着不对时，先看哪里、按什么顺序看、看到什么算什么**。
> 设计看 [`ARCHITECTURE.md`](ARCHITECTURE.md)；契约看 [`api-schema.md`](api-schema.md)；
> 本文件不复抄端点清单，也不写 SLO / 告警规则 / 值班表。

## 0. 先认清本仓的边界

本仓只做两件事：**托管 SPA 静态产物**、**把 `/api/` 反代给 analysis-service（core）**。
它**没有自带业务探针**——`/health`、`/readyz` 都是 core 的端点，`/api/health` 只是被反代过去而已。

> 所以：**永远不要拿 `/api/health` 当本仓健康判据**。拿它判活，后端一挂 UI 就被判死，
> 而 UI 此刻明明在正常发静态页。本仓自己的探针是镜像里的 `HEALTHCHECK`（见 `Dockerfile`），
> 探的是 `/` 是否返回 200，与后端无关。

### 两种运行形态，反代在不同地方

| 形态 | 入口 | 谁在反代 `/api` | 静态产物从哪来 |
|---|---|---|---|
| 本地开发（e2e 默认走这个） | `http://localhost:5173` | Vite dev server（`web/vite.config.ts:18-23` → `localhost:8085`） | Vite 内存里，带 HMR |
| 容器 / 部署 | `http://127.0.0.1:8080` | nginx（`deploy/nginx-spa.conf` → `analysis-service:8085`） | 镜像内 `/usr/share/nginx/html`（构建期产出） |

两种形态的失败长得不一样：**5173 上没有「静态资源 404」这回事**（产物在内存里，改完即生效），
一看到 404 就说明你在看 8080 或部署环境。

### 只用 127.0.0.1 + 端口，不碰容器 IP

| 你要看的东西 | 地址 |
|---|---|
| 本仓（nginx + SPA） | `127.0.0.1:8080` |
| core / analysis-service | `127.0.0.1:8085` |
| data-service | `127.0.0.1:8081` |
| strategy | `127.0.0.1:8090` |
| orchestration | `127.0.0.1:8088` |
| 其余（agent/analytics/risk/broker） | `8086 / 8087 / 8089 / 8091` |

容器的 `172.x.x.x` 每次重建都会变，写进步骤等于写一条明天就失效的地址。

---

## 1. 三十秒分诊：这是谁的问题

先跑这三条，结果直接决定往哪个仓走：

```bash
curl -s -o /dev/null -w "spa=%{http_code}\n"  http://127.0.0.1:8080/
curl -s -o /dev/null -w "api=%{http_code}\n"  http://127.0.0.1:8080/api/health
curl -s -o /dev/null -w "core=%{http_code}\n" http://127.0.0.1:8085/api/health
```

| `spa` | `api` | `core` | 唯一责任仓 | 依据 |
|---|---|---|---|---|
| 200 | 200 | 200 | **本仓**（前端逻辑 / 组件 / 路由） | 托管与反代都通，问题在 SPA 里 |
| 200 | 502 | 连不上 | **core**（后端没起） | SPA 正常，反代目标解析不到 —— 本机实测见 §3 |
| 200 | 502 | 200 | **本仓**（反代段）或 core 的后端装配 | 先看 `docker logs <ui 容器>` 的 nginx error，再决定 |
| 200 | 404 | 404 | **core**（该路由不存在） | 反代是通的（否则是 502），404 是后端回的 |
| 404 | 404 | — | **本仓**（nginx root / 产物） | `/` 都不回 index.html，别往后端找 |
| 连不上 | 连不上 | — | **本仓**（容器没起 / 端口没映射） | 见 `docker ps` |

> 本仓 2026-11-12 实测基线（healthy 状态下，可直接对照）：
> `spa=200`（`nginx/1.27.5`、`Content-Type: text/html`）、`api=200`
> `{"service":"analysis-service","status":"healthy",...}`、`/api/auth/status` = `{"auth_enabled":false,...}`、
> 深链 `/copilot` = `200`（history 回退生效）。

---

## 2. 现象 A：静态资源不可加载（白屏 / 一直转圈）

**典型样子**：页面白屏；控制台 `Failed to load module script`、`Loading module ... was blocked`，
或 `GET /assets/index-abc123.js 404`。

### 先看什么

```bash
curl -sI http://127.0.0.1:8080/ | head -4                 # 外壳还在吗
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8080/assets/nope.js
docker logs --tail 50 <ui 容器名>                          # nginx error / access
```

### 判定

| 看到什么 | 判定 | 归谁 |
|---|---|---|
| `/` 404 或 403 | nginx 的 `root` 指错，或产物根本没进镜像 | **本仓**（镜像构建） |
| `/` 200，但浏览器请求的 `/assets/index-<hash>.js` 404 | 浏览器拿的是**旧 index.html**，去要已经被删掉的旧指纹文件 | **本仓**（发版/缓存），见下 |
| `/assets/` 下随便取一个不存在的文件 | 应回 `404`（本机实测 `404`）—— 回 200 反而说明 SPA 回退吃掉了资产请求 | **本仓**（nginx 配置） |
| `/` 连不上 | 容器没起 / 端口没映射 | **本仓**（编排） |

### 处置

- **旧外壳缓存**是最常见的一种：`index.html` 必须每次校验、`/assets/` 带指纹才长缓存，这两条规则在
  `deploy/nginx-spa.conf` 里是分开写的（`location /assets/` 与 `location /`）。核这两段是否被改回去。
- **不要**靠「让用户清浏览器缓存」收工：清了还能复现，说明是发版流程里 index 与 assets 不同源。
- 重建镜像即可（产物在镜像里构建，宿主 `web/dist` 不参与，见 `Dockerfile` 顶部注释）。

---

## 3. 现象 B：`/api` 404 或 502

**先记一句话**：`502` 几乎总是「反代目标不可达」，`404` 几乎总是「后端说没有这个路由」。
两者都不是「前端写错了」。

### 先看什么

```bash
curl -s -o /dev/null -w "via-nginx=%{http_code}\n" http://127.0.0.1:8080/api/health
curl -s -o /dev/null -w "direct-core=%{http_code}\n" http://127.0.0.1:8085/api/health
docker logs --tail 50 <ui 容器名>        # nginx error log 才说得出「解析不到」还是「连不上」
```

### 判定（本机 2026-11-12 两种都复现过）

| 证据 | 判定 | 归谁 | 处置 |
|---|---|---|---|
| `via-nginx=502`，error log 有 `analysis-service could not be resolved` | nginx 解析不到后端（DNS / 网络） | 后端容器没起，或 UI 容器不在同一网络 | `docker ps`；把 UI 容器接进与 core 相同的 network |
| `via-nginx=502`，error log 有 `Connection refused` | 名字解析到了，端口没人听 | **core** | 看 core 容器日志 |
| `via-nginx=404`，`direct-core=404`，body 为 `404 page not found` | 反代正常，后端没有这个路由 | **core**（契约 / 路由） | 查 `api-schema.md` 与 core 路由表；不在本仓补假接口 |
| `via-nginx=404`，`direct-core=200` | nginx 的 `location /api/` 段坏了（前缀没拼回 `$request_uri`） | **本仓** | 核 `proxy_pass http://$backend$request_uri;` 这一行 |
| 两边都 200 | 反代与后端都好 | 回到 §1，问题在 SPA 逻辑 | — |

> 本机实测（隔离网络，后端名解析不到）：
> `spa=200`、`/api/health` = `502 Bad Gateway`（nginx 自己吐的 HTML），
> error log = `analysis-service could not be resolved (110: Operation timed out)`。
> **这正是「不要怀疑前端」那一类**：静态页好好的，坏的是反代链路。

### 处置边界

- 不在本仓新造端点去「兜住」后端的 404；不在前端把 404 改写成成功态。
- SSE / 长连接类接口的症状是「进度不动、跑完才跳 100%」，那是 `location /api/` 里
  `proxy_buffering off` + `proxy_read_timeout` 被改掉了 —— 去看配置，不是去看组件。

---

## 4. 现象 C：登录态失效（一直跳登录页 / 401 循环）

### 先看什么

```bash
curl -s http://127.0.0.1:8085/api/auth/status      # {"auth_enabled":...}
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8085/api/auth/me   # 无凭据应为 401
```

浏览器侧：Network 里找第一个 `401`，看它的 URL 与响应体；Application 里看 token 还在不在。

### 判定

| 看到什么 | 判定 | 归谁 |
|---|---|---|
| `auth_enabled:false`，但页面仍跳登录 | 前端把「鉴权关闭」当成了「未登录」 | **本仓**（路由守卫） |
| `auth_enabled:true`，`/api/auth/me` 一直 401 且 `/api/auth/refresh` 也 401 | refresh token 过期/被撤销 | 用户重新登录；**不要**为了让页面能进把后端 `JWT_SECRET` 清空 |
| 登录接口 200，但随后请求都不带 `Authorization` | token 存储/注入断了 | **本仓**（`web/src/api/client.ts` 的透传链路） |
| 直打 core 正常、经 8080 全 401 | 反代把 header 丢了，或打到别的实例 | 先按 §3 查反代 |

> 后端鉴权目前是「放开态」（无 `JWT_SECRET` + 显式声明），所以本机 `auth_enabled:false` 是**正常**的
> —— 这个状态下页面不该出现登录页。**不要把「本地不需要 token」写进前端假设**：token 透传路径必须保留，
> 收紧后（`JWT_SECRET` 非空）一行都不用改。

### 处置

- 401 由 `client.ts` 驱动一次 refresh；refresh 也失败才登出。循环跳登录多半是这两步都被绕过或重复触发。
- 排障时**不要**清后端 secret、不要改 `pg_hba`、不要给测试开免鉴权后门来「让页面能进」。

---

## 5. 现象 D：e2e 基线红

### 先分清三种红

| 红的样子 | 先看什么 | 判定 |
|---|---|---|
| 功能性失败（元素找不到 / 断言不符） | `npx playwright test --reporter=list` 的首个失败堆栈 | 先按 §1 确认后端健康，再核选择器与页面结构是否真变了 |
| **视觉基线** diff | `e2e/tests/visual-regression.spec.ts-snapshots/` 里回写的 `*-diff.png` | 差异比例 **< 1%** 判环境差异（字体抗锯齿、动态内容），**不重录**；≥ 1% 先确认是不是真改了渲染 |
| 只有部分视觉用例红、且 diff 出现在页头时间 | 页头 `setInterval` 时钟没被冻结 | 用例层问题，见 `visual-regression.spec.ts` 顶部 `freezeClock` 注释 |

### 判定顺序（别跳步）

```bash
cd e2e
npx playwright test tests/visual-regression.spec.ts        # 先只跑红的那一类
# 再看 e2e-report/ 里的 diff 图与 actual/expected
```

- **先证明后端是好的**（§1 三条 curl）。后端没数据导致的整页空白，看起来像「视觉大改」，其实一条断言都不该动。
- 历史类用例对库里历史记录敏感：库里恰好没有历史记录 ≠ 功能坏了。这类用独立库或按 run 隔离，不改断言。

### 处置红线

不删断言、不放宽断言、不跳过用例、不用 `test.skip` 收工、不为变绿重录基线。
确认渲染真变了才 `npx playwright test --update-snapshots`，并在提交里写清「哪张、为什么变」。

---

## 6. 人工 promote：把「编过了」变成「可以跑」

> 这一节补的是产品面的缺口：AI 生成链停在 **promote 人工闸门**（`sandbox_rejected` + `build_error`
> 含「未过 promote 人工闸门」），界面上只是一个「失败」，没有任何人能点的那一下。
> **闸门是人的动作**（ADR-023），页面不做，本手册给的是可审计的手工路径。

**谁做**：人。agent 侧只登记、不 promote（`tellurion-agent:SERVICE.md` §2）。

**前置**：该版本在 strategy 里已有 **status = validated** 的产物。

```bash
# ① 看这一版有没有产物、什么状态（公开读面）
curl -s "http://127.0.0.1:8090/api/strategies/<id>/versions/<version_hash>"

# ② 放行（X-Actor 必填：它进审计，回答「谁批的」）
curl -s -X POST \
  -H "X-Actor: <你的名字>" \
  -H "Content-Type: application/json" \
  -d '{}' \
  "http://127.0.0.1:8090/api/strategies/<id>/versions/<version_hash>/promote"

# ③ 核对审计（一行一次放行）
curl -s "http://127.0.0.1:8090/api/strategies/<id>/promotions"
```

**四种被拒的形状**（都不会写审计行，可放心重试）——本机 2026-11-12 真退出码：

| HTTP | `code` | 含义 | 怎么办 |
|---|---|---|---|
| 400 | `actor_required` | 没带 `X-Actor` | 补上。这不是权限问题，是缺「谁批的」 |
| 404 | `artifact_not_found` | 这一版没有产物（编译器没跑/没跑完） | 先跑 build + validate，再 promote |
| 400 | `unsupported_carrier` | `builtin` / `dsl` / `external` 没有字节码，不开放版本级 promote | 无需操作 |
| 409 | 状态机不符（`want validated`） | 产物还没到 `validated` | 先 validate |

鉴权收紧后（`JWT_SECRET` 非空）还需 `Authorization: Bearer <service token>`，无 token 的写请求是 **401**。

### 本机栈的已知缺口

本机**没有编译器**（strategy 容器无 `STRATEGY_COMPILER_*`，也没有 compiler 容器）：
`POST .../build` 只会排队，永远产不出 artifact，所以**成功态 promote 在本机不可达**——
上表四条拒绝边界可以现场验，成功态要等编译器装配后按 ② 原样跑。

> **不要**手搓 artifact、也不要直接改 `strategy_artifacts.status` 绕过：
> 那会让 `resolve` 返回一个跑不起来的字节码，把假绿灯发给回测入口。

---

## 7. 这份手册不许你做的事

- 不拿 core 的 `/health` `/readyz` 当本仓探针（本仓的判据只有 `/` 是否 200）。
- 不为了「让页面能进」清后端 secret、改 `pg_hba`、加免鉴权后门。
- 不为了「让用例绿」删断言、放宽断言、跳过用例、重录视觉基线。
- 不为了「兜住 404」在前端伪造接口或把失败改写成成功态。
- 不直连数据库排障 —— 找对应服务已有的读面。
