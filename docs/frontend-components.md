# 前端组件设计

## 页面

- `/` 图谱页
- `/nodes` 节点管理
- `/relations` 关系管理
- `/documents` 文档管理
- `/documents/:id/edit` 文档编辑
- `/login` 登录注册
- `/admin` 管理后台

## 核心组件

- `GraphCanvas.vue`: D3 图谱渲染与交互
- `BaseModal.vue`: 统一弹窗

## Store

- `auth`
- `graph`
- `nodes`
- `relations`
- `documents`
- `admin`

## 样式规范

- 统一 design tokens（颜色、间距、圆角、阴影）
- 统一按钮/表单/表格/弹窗样式
- 响应式支持移动端窄屏布局
