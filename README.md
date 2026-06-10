# 知识关系管理平台（Django + Vue）

## 原始需求

> 请开发一个功能完善的知识管理网站，具体技术栈要求如下：后端采用Django框架进行开发，前端使用Vue框架构建用户界面，初始数据库使用SQLite，并设计支持平滑迁移至MySQL数据库的架构。

> 功能需求详细说明：
> 主页面核心功能：实现交互式知识关系网络图可视化展示，支持节点拖拽、缩放和平移操作。
> 搜索功能：实现基于关键词的知识节点搜索，搜索结果节点需自动居中高亮展示，并显示其直接关联关系。
> 知识管理功能：
>
> - 提供知识节点的创建、编辑、删除功能，节点属性应包含标题、描述、类型、创建时间等
> - 提供知识关系的添加、编辑、删除功能，关系属性应包含关系类型、权重、描述等
>   文档管理功能：
> - 实现知识节点与文档的关联管理
> - 点击知识节点可查看所有关联文档列表
>   集成Markdown在线编辑器，支持文档的创建、编辑、预览和保存
>   支持文档版本控制和历史记录查看
>   用户系统：实现用户注册、登录、权限管理功能，区分管理员和普通用户权限
>   开发要求：
>   系统架构设计需考虑可扩展性和可维护性
>   前后端通过RESTful API进行数据交互
>   实现完整的数据验证和错误处理机制
>   开发过程中需同步编写详细开发文档，包括：
>   系统架构设计文档
>   数据库设计文档
>   API接口文档
>   前端组件设计文档
>   部署文档
>   编写单元测试和集成测试，确保代码质量
>   实现数据库迁移方案，确保从SQLite平滑迁移至MySQL
>   请基于以上需求进行详细分析和任务拆解，制定开发计划后开始实施。

## 目录结构

- `apps/backend`: Django + DRF 后端
- `apps/frontend`: Vue 3 + Vite 前端
- `e2e`: Playwright 全链路 E2E
- `docker`: Dockerfile 与 Nginx 配置
- `docs`: 架构、数据库、API、部署、验收说明

## 代码架构

```text
label-3623
├─ apps
│  ├─ backend
│  │  ├─ accounts        # 用户、登录注册、JWT、角色
│  │  ├─ knowledge       # 知识节点/关系模型与接口
│  │  ├─ documents       # 文档、版本历史、关联节点
│  │  ├─ graph           # 图谱聚合查询接口
│  │  └─ common          # 统一错误处理、通用响应与工具
│  └─ frontend
│     ├─ src/pages       # 7 个业务页面
│     ├─ src/stores      # Pinia 状态模块
│     ├─ src/components  # 复用组件（表单/列表/弹窗等）
│     └─ src/services    # Axios API 封装与错误映射
├─ e2e                   # Playwright 全链路测试
├─ docker                # 前后端镜像与 nginx 配置
└─ docs                  # 架构/数据库/API/部署/验收文档
```

- 前后端通过 REST API 解耦，前端只依赖 DTO 与接口契约，不直接依赖后端实现细节。
- 权限边界统一由后端 RBAC 控制，前端通过路由守卫与按钮状态进行可见性约束。
- 文档版本、关系级联删除、节点删除后文档置空等业务规则在后端单点实现，确保一致性。

## 技术细节

- 后端：Django 4 + DRF + django-filter + drf-spectacular，JWT 鉴权（access/refresh），统一错误格式：`{ code, message, details, request_id }`。
- 数据库：默认 SQLite；通过迁移脚本与校验流程支持平滑迁移到 MySQL 8.4，镜像均为非 Alpine（`python:3.12-slim`、`node:22-bookworm-slim`、`nginx:1.27-bookworm`）。
- 前端：Vue 3 + Vite + Pinia + Vue Router + Axios + D3.js + md-editor-v3，覆盖图谱交互、节点/关系管理、文档编辑与版本历史。
- 样式体系：基于统一 design tokens（颜色、字号、间距、圆角、阴影）规范化页面视觉，保证登录/注册与核心业务页风格一致。
- 质量保障：`pnpm lint`（前端 ESLint + 后端 Ruff）、`pnpm test`（pytest + vitest + Playwright）、`pnpm build`（前端构建 + 后端迁移检查）作为交付门禁。
- E2E：真实后端联调，不依赖前端 mock；覆盖登录、图谱、节点、关系、文档、管理页及 401/403/400 错误分支。

## 环境要求

- Node.js >= 22（本地当前 24.x 也可）
- pnpm >= 10
- Python >= 3.12（推荐）
- Docker / Docker Compose（可选）

## 安装

```bash
pnpm install
pnpm --filter backend setup
pnpm --filter e2e setup
```

## 本地开发

```bash
pnpm dev
```

- 前端: [http://localhost:4173](http://localhost:4173)
- 后端: [http://localhost:8000](http://localhost:8000)
- API 文档: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)

## 验证命令

```bash
pnpm lint
pnpm test
pnpm build
```

## Docker

```bash
docker compose up -d --build
docker compose down -v
```

Docker 访问地址：

- 前端: [http://localhost:4173](http://localhost:4173)
- 后端: [http://localhost:8000](http://localhost:8000)
- API 文档: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)


## SQLite -> MySQL 迁移

先启动 mysql：

```bash
docker compose --profile mysql up -d mysql
```

执行迁移：

```bash
pnpm migrate:mysql
```

## 默认测试账号（seed）

- 管理员：`admin / Admin123!`
- 普通用户：`alice / Alice123!`
- 普通用户：`bob / Bob12345!`
