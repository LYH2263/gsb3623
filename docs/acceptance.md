# 验收说明

## 命令门禁

- `pnpm lint`
- `pnpm test`
- `pnpm build`

## AC 对照

- AC-01: 图谱渲染与交互（Graph 页面 + E2E graph.spec）
- AC-02: 搜索定位高亮（Graph 页面 + E2E graph.spec）
- AC-03: 文档保存与版本（DocumentEdit + E2E documents.spec）
- AC-04: 管理员后台与普通用户 403（Admin + E2E admin.spec）
- AC-05: 删除节点级联关系与文档置空（后端测试 test_node_delete...）
- AC-06: 未登录 401 与跳转登录（E2E auth.spec/error.spec）
- AC-07: 前后端校验（Nodes 页面校验 + 后端序列化校验）
- AC-08: 普通用户越权 403（后端测试 + E2E 各 spec）
- AC-09: 节点详情与关联文档（Graph 页面 + E2E graph.spec）
- AC-10: SQLite->MySQL 迁移脚本（`pnpm migrate:mysql`）
