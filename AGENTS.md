# AGENTS — tellurion-ui

> 本文件是**本仓**的唯一入口。判据：一个 agent 只 checkout 本仓，就知道「怎么构建、边界在哪、活在哪、禁止什么」。

## 1. 这是什么仓

**前端**（Vue 3 + Vite + Naive UI）+ playwright 端到端套件。只放呈现层：组件 / 交互 / 视觉规范、页面设计、e2e、前端构建与托管配置。

切分判据（DDD）：本仓只放「前端这个领域自己的东西」；「怎么算」在 core，「试什么/怎么试」在 agent。

## 2. 构建 / 测试

```bash
cd web
npm ci
npm run build        # vue-tsc -b && vite build
npm run lint
npm run typecheck
npm test             # lint:tests + vitest run
```

端到端（需要起齐服务：前端 :5173 / data-service :8081 / analysis :8085）：

```bash
cd e2e
npm ci
npx playwright test          # 已知红见 docs/TASKS.md 的 AUD-61
```

## 3. 边界（硬约束）

**允许**

- 组件 / 页面 / 交互 / 视觉规范（`docs/design/` 是唯一基准）
- e2e 用例与 helpers（含数据隔离）
- 前端构建与 nginx 托管配置

**禁止**

- **直连数据库**（任何形态：驱动、连接串、绕过 `/api` 的直连）
- **复制 `openapi.yaml`**：契约在 core（被 `//go:embed` 嵌进二进制，`GET /api/openapi.yaml` 直出），复制一份必然漂移
- 在 `web/` 里做服务端逻辑（BFF 是 dev 期便利，不是生产路径）
- 把 e2e 的已知红改成"跳过/放宽断言"来变绿（AUD-61 的红线）

## 4. 依赖的契约版本

| 依赖 | 版本 | 说明 |
|---|---|---|
| 后端 HTTP API | 以 core 的 `openapi.yaml` 为唯一真相源 | **不复制、不手改**；契约变更由 core 侧先改 |
| `tellurion-agent` | — | 只经 `/api/{copilot,pipeline,explore,tools}` 反代，不感知拆仓 |

## 5. 活在哪、文档在哪

- **本仓台账**：`docs/TASKS.md`（唯一；AUD-61 在册）。**没有单号别开工。**
- 文档导航：`docs/README.md`；边界与依赖：`docs/ARCHITECTURE.md`；决策：`docs/adr/`。
- **前端设计系统**：`docs/design/index.md`（入口）；`docs/design/stitch_quantlab_ux_redesign/` 是重构子项台账（主台账仍是 `docs/TASKS.md`）。
- 跨仓背景（只读）：`tellurion:docs/TASKS.md`。

> 跨仓引用一律写 `repo:path` 纯文本，**不做可点击相对链接**。

## 6. 文档真相源（改功能前先看这里）

本仓的「功能边界」由三份文件钉住，**它们是唯一真相源，不是参考读物**：

| 维度 | 文件 |
|---|---|
| 数据形状（我拥有哪些表、谁能写） | `docs/db-schema.md` |
| 接口形状（对外暴露什么、错误码、幂等） | `docs/api-schema.md` |
| 流向与顺序（数据怎么走、哪里 fail-closed） | `docs/dataflow.md` |

**变更触发是硬约束**（完整表见 `docs/README.md` §3）：改表 → 改 `db-schema.md`；改接口 → 改 `api-schema.md`；改链路 → 改 `dataflow.md`；改分层 → 改 `ARCHITECTURE.md` + 一条 ADR；删档/迁移/换工具 → 一条 ODR。PR 里代码动了而对应文档没动，应被打回。
