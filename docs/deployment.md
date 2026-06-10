# 部署文档

## 方式一：本地进程

1. `pnpm install`
2. `pnpm --filter backend setup`
3. `pnpm --filter e2e setup`
4. `pnpm dev`

## 方式二：Docker Compose（非 Alpine）

1. `pnpm docker:up`
2. 访问前端 `http://localhost:4173`
3. 访问后端 `http://localhost:8000`
4. `pnpm docker:down`

## MySQL 迁移

1. `docker compose --profile mysql up -d mysql`
2. 配置环境变量：`KGM_DB_ENGINE=mysql` 等
3. 执行 `pnpm migrate:mysql`
4. 执行关键功能回归与数据计数校验
