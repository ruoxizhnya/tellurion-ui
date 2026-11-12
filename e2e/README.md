# e2e（Playwright）

真实后端端到端套件。少数用例显式标注 mock（见用例头部说明），其余打真 API。

## 起栈（标准姿势：full + orchestration-worker + 抬高限流）

标准姿势是**一个 compose、两个 profile**（不再有单独的 e2e 覆盖层文件——
原 `docker-compose.e2e.yml` 已并入基础 `docker-compose.yml`，其内容只剩
`RATE_LIMIT_PER_MINUTE` 覆盖，现在用环境变量传）：

- `full`：analysis :8085 / data :8081 / risk :8089 / strategy :8090 /
  analytics :8087 / orchestration :8088；
- `orchestration-worker`：异步回测的执行侧（无监听端口）。**缺了它
  `POST /api/backtest` 会一直停在 pending**，看起来像「异步模式坏了」，
  实际是栈少了一条腿；
- `ORCHESTRATION_URL`：analysis 容器内视角 `http://orchestration:8088`；
  不设它 analysis 走本地旧路径，异步用例对不上；
- `DATABASE_NAME`：e2e 用**专用库**（如 `tellurion_e2e`），与主库隔离；
  库要先建好，schema 由 data-service 启动时自建；
- `RATE_LIMIT_PER_MINUTE=100000`：限流桶是**全进程、按 ClientIP 共享**的
  （默认 100 req/min），整套 playwright 从 `127.0.0.1` 一个 IP 出量必然越界，
  红的是 429 而不是产品缺陷。**这是环境姿势，不是放宽断言**。

```bash
# core 仓根目录（docker-compose.yml 所在层）——可直接复制
# 1) 专用库（只第一次需要）
psql -h localhost -U postgres -c 'CREATE DATABASE tellurion_e2e'

# 2) 起栈（bash / macOS / Linux）
DATABASE_NAME=tellurion_e2e \
RATE_LIMIT_PER_MINUTE=100000 \
ORCHESTRATION_URL=http://orchestration:8088 \
docker compose --profile full --profile orchestration-worker up -d --build

# 3) 装载确定性行情夹具（真实 Tushare 同步结果入仓，不耗配额）
#    头注释写明同步日期、标的、区间、行数；可重复执行（先按范围 DELETE）
docker run --rm -i -v "$PWD/e2e/fixtures:/fx:ro" -e PGPASSWORD=postgres postgres:16-alpine \
  psql -h host.docker.internal -U postgres -d tellurion_e2e -v ON_ERROR_STOP=1 -f /fx/market_e2e.sql
```

夹具内容：`600519.SH` / `600000.SH` / `600036.SH` 的日线 531 行
（2023-10-09 .. 2024-06-28）、三只票的 `market.stocks`、SSE 交易日历 297 行
（2023-10-09 .. 2024-07-31）。

日历比行情多出一个月是**刻意的**：日历是参考表，生产部署里它覆盖到同步日之后。
core 的 `verifyCalendarCoverage` 会向 `end_date` 之后探 30 个自然日判断覆盖边界，
日历若停在行情末日，`end_date` 落在这个窗口里的回测会被误判成「日历没同步」而 409
（F3，2026-11-13）。补日历而不是改用例日期——后者等于把假约束写进用例。
真实链路仍有一条 opt-in 测试（`tellurion-data`：
`TUSHARE_ONLINE=1 go test ./internal/transport/tushare -run TestLive`），
**不设为 CI 必过**。

```powershell
# Windows PowerShell 等价写法
$env:DATABASE_NAME='tellurion_e2e'
$env:RATE_LIMIT_PER_MINUTE='100000'
$env:ORCHESTRATION_URL='http://orchestration:8088'
docker compose --profile full --profile orchestration-worker up -d --build
```

恢复默认（主库 / 100 req/min / 无 worker）只需不带这些变量重起：

```bash
docker compose --profile full up -d --force-recreate --no-deps analysis-service data-service
```

跑前自检：连打 110 次 `GET /api/strategies` 应**全 200**（默认 100 时从第 101 次
开始 429）；`GET /api/sync/workers` 应 200 且 `is_running=true`（验证 data 的
worker 与自省面都在）；`GET /api/backtest/{id}` 对刚提交的作业应能在 30s 内
到 `succeeded`（验证 orchestration-worker 在线）。

前端：`cd web && npm run dev` → :5173（e2e 默认直连 :8085/:8081，不依赖 :5173）。

## ai-service 的缺席语义

标准姿势的 full profile 也不含 `cmd/ai`（:8086，另一个可选镜像）。核心网关对 `/api/copilot/*`
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

已知红一律以 `test.fixme("<单号>: …")` 显式登记（必须带单号，登记表在各单正文）。
消红顺序是**先对齐选择器/期望，再删 fixme 与登记行**；禁止放宽断言、
禁止把红改成裸 `skip`。选择器优先 `data-testid`，不靠文案/DOM 位置（重构即碎）。
当前存量：**0**（AUD-61 已于 2026-11-10 收口，见 `docs/archive/`）。
