from rest_framework import serializers

from knowledge.models import KnowledgeNode, KnowledgeRelation


class KnowledgeNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeNode
        fields = [
            "id",
            "title",
            "description",
            "node_type",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]


class KnowledgeRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeRelation
        fields = [
            "id",
            "source_node",
            "target_node",
            "relation_type",
            "weight",
            "description",
            "created_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_by", "created_at"]
