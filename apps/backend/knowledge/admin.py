from django.contrib import admin

from knowledge.models import KnowledgeNode, KnowledgeRelation


@admin.register(KnowledgeNode)
class KnowledgeNodeAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "node_type", "created_by", "created_at")
    search_fields = ("title", "description", "node_type")


@admin.register(KnowledgeRelation)
class KnowledgeRelationAdmin(admin.ModelAdmin):
    list_display = ("id", "source_node", "target_node", "relation_type", "weight", "created_by")
    search_fields = ("relation_type", "description")
