---
status: active
last-verified: 2026-10-20
verified-by: 功能边界固化（三份契约：db / api / dataflow）
---

# Dataflow — tellurion-ui

> 目的：把「数据从哪来、在谁手里变形、到哪去」写死。**任何跨仓数据交换都必须能在本图上找到一条边**；找不到 = 这段代码在偷偷建第二条路。

## 1. 主链路

```
浏览器（Vue 3 / Vite）
   │  ① 静态资源：nginx 托管 dist
   │  ② API 调用：/api/*  → nginx 反代 → analysis-service（:8085）
   │  ③ 探索页的进展：今天走 **REST 轮询**，不是 SSE（2026-10-26 实测订正，见 §2「探索页」）
   │     —— 本仓唯一被消费的推送腿是 `/api/sync/jobs/{id}/progress`（`stores/sync.ts`）
   │  ④ 提交回测→job_id→轮询：与 ② 同一条反代边（POST /api/backtest、
   │     GET /api/backtest/{id}，analysis-service 直接服务，不下探）
   ↓
后端
  analysis-service ──► data-service（:8081）/ ai-service（:8086）/ core 引擎
```

## 2. 关键时序

### 打开一个回测结果
1. 页面挂载 → `auth.ts` 取当前用户（401 → 跳登录）
2. `backtest.ts` `GET /api/backtest/{id}/report` 取结果摘要（进度轮询 `GET /api/backtest/{id}`）
3. 图表用返回的 DTO 渲染；缺字段走 `/api/analysis/*` 补算
4. 写操作（提交回测）→ 拿 `job_id` → 轮询或订阅

### 探索页（**今天是 REST 轮询**，不是 SSE）

1. `POST /api/explore/runs` → `runID`（`web/src/api/explore.ts:132`）
2. `window.setInterval` 每轮调 `GET /api/explore/runs/{id}`（`explore.ts:136` 的 `getExploreStatus`，循环在 `pages/Explore.vue:99-127`）
3. 连续失败到 `MAX_POLL_FAILS` ⇒ 停止刷新并把屏上内容标为「可能已过期」（`Explore.vue:135-139`）；停作用 `POST /api/explore/runs/{id}/stop`（`explore.ts:141`）

> ⚠️ **后端那条 SSE 确实存在，但前端零消费**：`tellurion-agent:cmd/ai/handlers_explore.go:188` 注册
> `GET /explore/runs/:runID/stream`，`:443` 出 `text/event-stream`，`:385` 的注释写「前端 EventSource 和 poll
> 能复用同一套类型」。本仓**唯一**构造 `EventSource` 的文件是 `stores/sync.ts`（打 `/api/sync/jobs/{id}/progress`），
> 由守卫 `web/src/a08-boundaries.test.ts:49-58` 用「构造点集合 == 登记集」钉死；`api-schema.md` §「关键的跨仓语义」
> 同批写的也是「explore 侧无 SSE 消费」。**以前本节写「探索页走 EventSource」，与本仓自己的 api-schema 和守卫互相矛盾。**
> 要接那条流是另一个动作：得先改 `a08-boundaries.test.ts` 的登记集，不能在探索页悄悄开第二条腿。

## 3. 失败模式（每一处 fail-closed 都要能指名）

| 失败点 | 症状 | 兜底 |
|---|---|---|
| 轮询把 429 当失败 | 误报"后端挂了" | 区分 429 与 5xx（AUD-61） |
| SSE 断线（**只指 `/api/sync/jobs/{id}/progress` 这一条腿**，`stores/sync.ts`） | 同步进度停住 | 重连 + 拉一次快照；探索页与此无关（它没有 SSE） |
| 探索页轮询连续失败 | 进展停在最后一次成功拿到的状态 | `MAX_POLL_FAILS` 后停止刷新并在屏上标「可能已过期」，不静默回退（`Explore.vue:135-139`） |
| 契约漂移 | 页面字段空 | e2e + openapi 生成类型（若引入） |
| 直连 DB 的诱惑 | 鉴权/兼容失控 | 红线：只走 /api |

## 4. 不变量（可被测试钉住的）

1. `web/` 内不出现数据库驱动或连接串。
2. 不出现第二份 `openapi.yaml`。
3. e2e 的已知红全部以 `test.fixme("AUD-61: …")` 显式登记（数量可查）。
4. 生产路径只经 `/api`。

## 5. 与契约文档的关系

- 表结构 → `docs/db-schema.md`
- 接口形状 → `docs/api-schema.md`
- 本文件只讲**流向与顺序**，不重复字段定义。
