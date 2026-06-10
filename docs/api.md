# API 接口说明

## 认证

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `GET /api/auth/me/`

## 节点

- `GET /api/nodes/`（keyword/type）
- `POST /api/nodes/`
- `PUT /api/nodes/{id}/`
- `DELETE /api/nodes/{id}/`

## 关系

- `GET /api/relations/`（source_node/target_node）
- `POST /api/relations/`
- `PUT /api/relations/{id}/`
- `DELETE /api/relations/{id}/`

## 文档

- `GET /api/documents/`（node_id）
- `POST /api/documents/`
- `GET /api/documents/{id}/`
- `PUT /api/documents/{id}/`
- `GET /api/documents/{id}/versions/`

## 图谱

- `GET /api/graph/`

## 管理后台

- `GET /api/admin/users/`
- `PATCH /api/admin/users/{id}/`
- `GET /api/admin/overview/`

## OpenAPI

- Schema: `/api/schema/`
- Swagger: `/api/docs/`
