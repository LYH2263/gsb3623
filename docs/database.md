# 数据库设计

## 实体

- User
- KnowledgeNode
- KnowledgeRelation
- Document
- DocumentVersion

## 关键约束

- `User.email` 唯一
- `KnowledgeRelation.weight >= 0`
- `Document.node` 可空（删除节点时置空）
- `DocumentVersion(document, version_number)` 唯一

## 删除策略

- 删除 `KnowledgeNode`：
  - 关联 `KnowledgeRelation` 级联删除
  - 关联 `Document.node` 置空，文档保留

## 版本策略

- 创建文档自动写入版本 `v1`
- 更新内容时自动写入 `v(n+1)`
