# e2e（Playwright）

真实后端端到端套件。少数用例显式标注 mock（见用例头部说明），其余打真 API。

## 起栈（三条腿）

- 前端：`cd web && npm run dev` → :5173
- data-service → :8081
- analysis-service → :8085

后端怎么起见 core 仓 `core:docs/guides/local-dev.md`（compose 在 core 仓）。

## ④ 共享限流：e2e 必须用 e2e 姿势

analysis-service 的限流桶是**全进程、按 ClientIP 共享**的（默认 100 req/min）。
整套 playwright 从 `127.0.0.1` 一个 IP 出量，全量跑必然越过额度 —— 于是一批
与被测代码无关的用例拿到 429。core 仓为此提供了显式的 e2e 覆盖层
（`core:docker-compose.e2e.yml`，AUD-58），只把 `RATE_LIMIT_PER_MINUTE` 抬到
100000；基础 compose 的默认值不动。**这是环境姿势，不是放宽断言**。

```bash
# 在 core 仓目录（有 docker-compose.e2e.yml 的那层）：
docker compose -f docker-compose.yml -f docker-compose.e2e.yml \
  up -d --force-recreate --no-deps analysis-service data-service

# 恢复默认 100：
docker compose up -d --force-recreate --no-deps analysis-service data-service
```

跑前自检：连打 110 次 `GET /api/strategies` 应**全 200**（默认 100 时从第 101 次
开始 429）。姿势不对时红的是 429，不是产品缺陷。

## ai-service 的缺席语义

本套件只起三条腿，`cmd/ai`（:8086）通常不在线。核心网关对 `/api/copilot/*`
整族做纯反代，ai-service 不在时 **fail-closed 成 503**（不是 404/500）。
相关用例显式接受 503 —— 这不等于端点存在性不可测：`save` 端点确实删除由
core 单测钉住（`core:cmd/analysis/handlers_copilot_test.go`）。

## 跑

```bash
npm ci
npx playwright test            # 退出码 0 才算过
npm test                       # 同上
```

判据是 playwright 自己的退出码：**不要**用 `| tail` 之类的管道，那会把退出码
换掉（历史踩过两次，见 `docs/TASKS.md` AUD-61）。

已知红一律以 `test.fixme("AUD-61: …")` 显式登记，见 `docs/TASKS.md` 的 AUD-61
登记表。消红顺序是**先对齐选择器/期望，再删 fixme 与登记行**；禁止放宽断言、
禁止把红改成裸 `skip`。选择器优先 `data-testid`，不靠文案/DOM 位置（重构即碎）。
