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
   │  ③ SSE：/api/explore/runs/{id}/stream（逐写直通，FlushInterval=-1）
   ↓
后端
  analysis-service ──► data-service（:8081）/ ai-service（:8086）/ core 引擎
```

## 2. 关键时序

### 打开一个回测结果
1. 页面挂载 → `auth.ts` 取当前用户（401 → 跳登录）
2. `backtest.ts` `GET /api/runs/{id}` 取摘要
3. 图表用返回的 DTO 渲染；缺字段走 `/api/analysis/*` 补算
4. 写操作（提交回测）→ 拿 `job_id` → 轮询或订阅

### 探索页（SSE）
1. `POST /api/explore/runs` → `runID`
2. `new EventSource('/api/explore/runs/{id}/stream')`
3. `progress` 更新快照；`complete` 收尾；断线只重连、不取消 run

## 3. 失败模式（每一处 fail-closed 都要能指名）

| 失败点 | 症状 | 兜底 |
|---|---|---|
| 轮询把 429 当失败 | 误报"后端挂了" | 区分 429 与 5xx（OPS-01） |
| SSE 断线 | 进度停住 | 重连 + 拉一次快照 |
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
