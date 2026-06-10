# 知识关系管理平台 MVP 规划
*knowledge-graph-manager*

## 项目概述

**描述**: 基于Django+Vue的知识管理网站，以交互式知识关系网络图为核心，支持知识节点与关系的可视化管理、文档关联与Markdown编辑、文档版本控制、用户权限体系，初始使用SQLite并支持平滑迁移至MySQL。

**目标用户**:
- 需
- 要
- 对
- 知
- 识
- 体
- 系
- 进
- 行
- 结
- 构
- 化
- 管
- 理
- 和
- 可
- 视
- 化
- 展
- 示
- 的
- 个
- 人
- 用
- 户
- 、
- 团
- 队
- 知
- 识
- 管
- 理
- 员
- 及
- 内
- 容
- 编
- 辑
- 人
- 员

## 原始需求

> 请开发一个功能完善的知识管理网站，具体技术栈要求如下：后端采用Django框架进行开发，前端使用Vue框架构建用户界面，初始数据库使用SQLite，并设计支持平滑迁移至MySQL数据库的架构。 

功能需求详细说明： 
1. 主页面核心功能：实现交互式知识关系网络图可视化展示，支持节点拖拽、缩放和平移操作。 
2. 搜索功能：实现基于关键词的知识节点搜索，搜索结果节点需自动居中高亮展示，并显示其直接关联关系。 
3. 知识管理功能： 
- 提供知识节点的创建、编辑、删除功能，节点属性应包含标题、描述、类型、创建时间等 
- 提供知识关系的添加、编辑、删除功能，关系属性应包含关系类型、权重、描述等 
4. 文档管理功能： 
- 实现知识节点与文档的关联管理 
- 点击知识节点可查看所有关联文档列表 
- 集成Markdown在线编辑器，支持文档的创建、编辑、预览和保存 
- 支持文档版本控制和历史记录查看 
5. 用户系统：实现用户注册、登录、权限管理功能，区分管理员和普通用户权限 

开发要求： 
1. 系统架构设计需考虑可扩展性和可维护性 
2. 前后端通过RESTful API进行...

## 评分信息

| 维度 | 分值 |
|------|------|
| 等级 | C |
| 总分 | 3.05 |
| 类型权重 | 3.25 |
| 加权总分 | 9.91 |
| 清晰度 | 4 |
| 复杂度 | 5.0 |
| 验证难度 | 1.0 |

## 技术栈

- **前端**: Vue 3 + Vite + D3.js（知识图谱可视化）+ md-editor-v3（Markdown编辑器）+ Vue Router + Pinia + Axios
- **后端**: Django 4 + Django REST Framework + django-filter + drf-spectacular（API文档自动生成）
- **数据库**: SQLite（初始开发）+ MySQL（生产迁移），通过Django ORM抽象层实现平滑切换
- **选型理由**: Django ORM天然屏蔽数据库差异，配合Django migrations可无缝从SQLite迁移至MySQL；D3.js提供力导向图的完整控制能力，满足拖拽、缩放、平移需求；md-editor-v3是纯Vue3 Markdown编辑器，零外部API依赖；drf-spectacular自动生成OpenAPI文档，满足API接口文档要求。

## 核心功能

### 知识图谱可视化 (P0)

- [ ] 基于D3.js力导向图渲染知识关系网络
- [ ] 节点拖拽交互与位置固定
- [ ] 画布缩放与平移操作
- [ ] 节点点击弹出详情面板与关联文档列表
- [ ] 搜索结果节点自动居中并高亮显示及其直接关联关系

### 知识节点管理 (P0)

- [ ] 创建知识节点（标题、描述、类型、创建时间）
- [ ] 编辑知识节点属性
- [ ] 删除知识节点及其关联关系级联处理
- [ ] 按关键词搜索知识节点

### 知识关系管理 (P0)

- [ ] 添加两个节点之间的关系（关系类型、权重、描述）
- [ ] 编辑已有关系属性
- [ ] 删除关系

### 文档管理 (P0)

- [ ] 创建文档并关联到知识节点
- [ ] Markdown在线编辑器支持编辑与实时预览
- [ ] 保存文档内容
- [ ] 文档版本控制与历史记录查看
- [ ] 查看知识节点关联的文档列表

### 用户系统 (P0)

- [ ] 用户注册与登录（JWT Token认证）
- [ ] 管理员与普通用户角色区分
- [ ] 管理员可管理所有内容，普通用户仅可管理自己创建的内容
- [ ] 用户个人信息查看

### 数据验证与错误处理 (P1)

- [ ] 前端表单校验与友好错误提示
- [ ] 后端DRF序列化器字段验证
- [ ] 全局异常处理中间件返回统一错误格式

### 测试与文档 (P1)

- [ ] 后端单元测试覆盖核心模型与API
- [ ] 前端组件集成测试
- [ ] 系统架构设计文档、数据库设计文档、API接口文档、前端组件设计文档、部署文档同步编写

### 数据库迁移方案 (P1)

- [ ] 编写SQLite到MySQL的迁移脚本与操作文档
- [ ] Django settings多数据库配置切换方案
- [ ] 迁移前后数据完整性校验

## 页面结构

| 路由 | 页面 | 描述 |
|------|------|------|
| `/` | 知识图谱主页 | 展示交互式知识关系网络图，集成搜索栏，支持节点拖拽、缩放、平移，点击节点查看详情与关联文档 |
| `/nodes` | 知识节点管理 | 以列表形式管理所有知识节点，支持增删改查与类型筛选 |
| `/relations` | 知识关系管理 | 管理知识节点之间的关系，支持关系的添加、编辑、删除 |
| `/documents` | 文档管理 | 管理所有文档，支持创建、编辑、关联节点、查看版本历史 |
| `/documents/:id/edit` | 文档编辑 | Markdown在线编辑器页面，支持编辑、实时预览和保存，可查看版本历史 |
| `/login` | 登录注册 | 用户登录与注册页面，支持表单验证与错误提示 |
| `/admin` | 管理后台 | 管理员专属页面，管理用户账号与权限，查看系统概览 |

## 数据模型

### User

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BigAutoField | 用户主键ID |
| username | CharField(150) | 用户名，唯一 |
| email | EmailField | 邮箱地址，唯一 |
| password | CharField(128) | 哈希密码 |
| role | CharField(20) | 角色：admin或user |
| is_active | BooleanField | 账号是否启用 |
| created_at | DateTimeField | 注册时间 |

### KnowledgeNode

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BigAutoField | 节点主键ID |
| title | CharField(200) | 节点标题 |
| description | TextField | 节点描述 |
| node_type | CharField(50) | 节点类型（如概念、技术、人物等） |
| created_by | ForeignKey(User) | 创建者 |
| created_at | DateTimeField | 创建时间 |
| updated_at | DateTimeField | 更新时间 |

### KnowledgeRelation

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BigAutoField | 关系主键ID |
| source_node | ForeignKey(KnowledgeNode) | 源节点 |
| target_node | ForeignKey(KnowledgeNode) | 目标节点 |
| relation_type | CharField(50) | 关系类型（如依赖、包含、关联等） |
| weight | FloatField | 关系权重，默认1.0 |
| description | TextField | 关系描述 |
| created_by | ForeignKey(User) | 创建者 |
| created_at | DateTimeField | 创建时间 |

### Document

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BigAutoField | 文档主键ID |
| title | CharField(200) | 文档标题 |
| content | TextField | Markdown文档内容 |
| node | ForeignKey(KnowledgeNode) | 关联的知识节点 |
| created_by | ForeignKey(User) | 创建者 |
| created_at | DateTimeField | 创建时间 |
| updated_at | DateTimeField | 更新时间 |

### DocumentVersion

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BigAutoField | 版本主键ID |
| document | ForeignKey(Document) | 所属文档 |
| content | TextField | 该版本的Markdown内容 |
| version_number | PositiveIntegerField | 版本号，自增 |
| created_by | ForeignKey(User) | 保存者 |
| created_at | DateTimeField | 版本创建时间 |

## API 端点

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register/` | `none` | 用户注册，接收用户名、邮箱、密码，返回用户信息 |
| `POST` | `/api/auth/login/` | `none` | 用户登录，接收用户名和密码，返回JWT access和refresh token |
| `GET` | `/api/nodes/` | `required` | 获取知识节点列表，支持keyword搜索和type筛选查询参数 |
| `POST` | `/api/nodes/` | `required` | 创建知识节点，接收title、description、node_type字段 |
| `PUT` | `/api/nodes/{id}/` | `required` | 更新指定知识节点，管理员可编辑所有，普通用户仅编辑自己创建的 |
| `DELETE` | `/api/nodes/{id}/` | `required` | 删除指定知识节点及其级联关系，权限同编辑规则 |
| `GET` | `/api/relations/` | `required` | 获取知识关系列表，支持按source_node或target_node筛选 |
| `POST` | `/api/relations/` | `required` | 创建知识关系，接收source_node、target_node、relation_type、weight、description |
| `PUT` | `/api/relations/{id}/` | `required` | 更新指定知识关系属性 |
| `DELETE` | `/api/relations/{id}/` | `required` | 删除指定知识关系 |
| `GET` | `/api/documents/` | `required` | 获取文档列表，支持按关联node_id筛选 |
| `POST` | `/api/documents/` | `required` | 创建文档并关联知识节点，接收title、content、node_id |
| `PUT` | `/api/documents/{id}/` | `required` | 更新文档内容，自动创建新版本记录 |
| `GET` | `/api/documents/{id}/versions/` | `required` | 获取指定文档的版本历史列表 |
| `GET` | `/api/graph/` | `required` | 获取完整图谱数据（节点列表+关系列表），供D3.js渲染 |
| `GET` | `/api/admin/users/` | `required` | 管理员获取所有用户列表，支持角色修改和启用禁用操作 |

## 验收标准

### AC-01 (core)

- **Given**: 用户已登录并进入知识图谱主页
- **When**: 页面加载完成
- **Then**: D3.js力导向图正确渲染所有知识节点和关系，支持拖拽节点、滚轮缩放和画布平移操作

### AC-02 (core)

- **Given**: 用户在主页搜索栏输入关键词
- **When**: 点击搜索或按回车
- **Then**: 匹配的节点自动居中并高亮显示，同时高亮其直接关联的节点和关系线

### AC-03 (core)

- **Given**: 用户在文档编辑页面修改Markdown内容
- **When**: 点击保存按钮
- **Then**: 文档内容保存成功，同时自动生成一条新的版本记录，可在版本历史中查看

### AC-04 (core)

- **Given**: 管理员登录系统
- **When**: 访问管理后台
- **Then**: 可查看所有用户列表并修改用户角色，普通用户访问管理后台返回403

### AC-05 (edge)

- **Given**: 用户尝试删除一个被多个关系和文档关联的知识节点
- **When**: 确认删除操作
- **Then**: 该节点及其所有关联关系被级联删除，关联文档的node字段置空或文档同步删除，系统给出明确提示

### AC-06 (error)

- **Given**: 未登录用户
- **When**: 访问任何需要认证的API接口
- **Then**: 返回401状态码和统一格式的错误信息，前端自动跳转到登录页面

### AC-07 (error)

- **Given**: 用户创建知识节点时标题为空
- **When**: 提交表单
- **Then**: 前端表单校验阻止提交并显示错误提示，若绕过前端则后端返回400和字段验证错误详情

### AC-08 (usability)

- **Given**: 普通用户登录系统
- **When**: 尝试编辑或删除其他用户创建的节点
- **Then**: 操作按钮不可见或禁用，API层返回403权限不足提示

### AC-09 (core)

- **Given**: 用户点击图谱中的某个知识节点
- **When**: 节点详情面板展开
- **Then**: 显示节点属性信息和该节点关联的所有文档列表，点击文档可跳转到编辑页面

### AC-10 (usability)

- **Given**: 系统从SQLite迁移至MySQL
- **When**: 执行迁移脚本完成后
- **Then**: 所有数据完整保留，应用功能正常运行，无数据丢失或字段类型异常

## 不在 MVP 范围内

- 第三方OAuth社交登录（如GitHub、Google登录）
- 知识节点的文件附件上传（图片、PDF等）
- 多人实时协同编辑文档
- 知识图谱的自动推荐与智能关联建议
- 移动端原生应用
- 国际化多语言支持
- 知识节点的导入导出功能（CSV、JSON批量操作）

## 实现里程碑

### Phase 1：后端基础与用户系统

- [ ] 初始化Django项目与DRF配置，配置SQLite数据库
- [ ] 实现User模型扩展（role字段）、注册、登录API与JWT认证
- [ ] 实现KnowledgeNode模型与CRUD API，含搜索筛选
- [ ] 实现KnowledgeRelation模型与CRUD API
- [ ] 实现权限控制（管理员全权限、普通用户仅操作自己的数据）
- [ ] 编写模型与API的单元测试
- [ ] 编写系统架构设计文档与数据库设计文档

**验收**: 所有模型迁移成功，用户注册登录流程通过，节点与关系CRUD API通过Postman测试，权限控制生效，单元测试通过率100%

### Phase 2：文档管理与版本控制

- [ ] 实现Document模型与CRUD API，含节点关联
- [ ] 实现DocumentVersion模型，保存文档时自动创建版本记录
- [ ] 实现文档版本历史查询API
- [ ] 实现图谱数据聚合API（/api/graph/）
- [ ] 实现管理员用户管理API
- [ ] 编写文档相关单元测试与集成测试
- [ ] 编写API接口文档（结合drf-spectacular自动生成）

**验收**: 文档创建编辑保存正常，每次保存自动生成版本记录，版本历史可查询，图谱聚合API返回完整节点与关系数据，管理员API权限正确

### Phase 3：前端开发与图谱可视化

- [ ] 初始化Vue 3 + Vite项目，配置路由、Pinia状态管理、Axios拦截器
- [ ] 实现登录注册页面与Token管理
- [ ] 实现知识图谱主页：D3.js力导向图渲染、拖拽、缩放、平移
- [ ] 实现搜索功能：关键词搜索、结果节点居中高亮及关联关系展示
- [ ] 实现节点详情面板与关联文档列表
- [ ] 实现知识节点管理页面（列表、新建、编辑、删除）
- [ ] 实现知识关系管理页面
- [ ] 实现文档管理页面与Markdown编辑器页面（md-editor-v3集成）
- [ ] 实现文档版本历史查看功能
- [ ] 实现管理后台页面（用户管理、系统概览）
- [ ] 编写前端组件设计文档
- [ ] 编写前端组件集成测试

**验收**: 所有7个页面功能完整可用，图谱交互流畅，搜索高亮居中正确，Markdown编辑预览保存正常，版本历史可查看，权限控制在UI层生效，前端测试通过

### Phase 4：数据库迁移、联调与部署

- [ ] 编写SQLite到MySQL迁移脚本（dumpdata/loaddata方案）
- [ ] 配置Django settings多数据库切换（通过环境变量）
- [ ] 执行迁移并验证数据完整性
- [ ] 前后端联调与全流程集成测试
- [ ] 性能优化（图谱大数据量渲染、API分页）
- [ ] 编写部署文档（含SQLite到MySQL迁移操作手册）
- [ ] 全局错误处理与边界情况修复

**验收**: SQLite数据完整迁移至MySQL且功能正常，全流程端到端测试通过，所有5份开发文档齐全，部署文档可指导独立部署
