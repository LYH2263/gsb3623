# 系统架构设计

## 分层

1. 前端层（Vue + Pinia + Router）
2. API 层（DRF ViewSet / APIView）
3. 领域模型层（Django ORM）
4. 数据层（SQLite 默认 + MySQL 迁移）

## 后端模块

- `accounts`: 注册、登录、JWT、用户信息
- `knowledge`: 知识节点 / 关系 CRUD 与权限
- `documents`: 文档与版本控制
- `graph`: 图谱聚合接口
- `admin_portal`: 管理员用户与概览
- `common`: 统一错误处理、请求 ID、健康检查

## 安全与权限

- JWT 鉴权
- RBAC：管理员全权限，普通用户仅可操作自己创建内容
- 未认证统一 401，越权统一 403
- 统一错误结构：`{ code, message, details, request_id }`

## 前端关键设计

- `authStore` 维护 token 与用户态
- 路由守卫拦截未登录访问
- Axios 拦截器处理 401
- 图谱交互由 D3 组件驱动（拖拽、缩放、平移、聚焦）
