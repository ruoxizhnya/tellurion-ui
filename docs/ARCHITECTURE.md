# 本仓边界与依赖方向 — tellurion-ui

## 定位

**前端**（Vue 3 + Vite + Naive UI）+ playwright 端到端套件。

## 依赖方向

```
tellurion-ui (web/)  ──(HTTP /api)──►  analysis-service (core) ──►  data / ai-service
        │
        └── e2e/  ──(浏览器驱动)──►  上面这条链路
```

- 本仓**没有** Go 依赖，也不参与 Go 的 module 图。
- 契约方向是单向的：core 的 `openapi.yaml` → 本仓的类型与调用；**本仓不回写契约**。

## 目录职责

| 路径 | 内容 |
|---|---|
| `web/` | 前端源码（Vue 3 + Vite） |
| `e2e/` | playwright 用例与 helpers（含库级数据隔离） |
| `docs/design/` | 前端设计系统（index / principles / visual / components / interaction / pages） |
| `deploy/nginx-spa.conf` | `/api` 反代到 analysis-service |
| `Dockerfile` | 前端镜像 → nginx 托管 |

## 关键约束

1. **不直连 DB**：所有数据经 `/api`。
2. **不复制 openapi.yaml**：它被 core 的 `//go:embed` 嵌进二进制。
3. **e2e 红就是红**：已知失败用 `test.fixme("AUD-61: 归因")` 显式登记，不改断言消红。
4. **设计系统单一基准**：`docs/design/` 是 v2.0 的唯一基准，页面实现向它对齐，不是反过来。

## 未决 / 待定

- 设计系统重构（`docs/design/stitch_quantlab_ux_redesign/`）落地后，e2e 选择器按页重对齐（AUD-61 阶段二）。
