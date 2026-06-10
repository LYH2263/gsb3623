from django.db import transaction
from rest_framework import serializers

from documents.models import Document, DocumentVersion
from knowledge.models import KnowledgeNode


class DocumentVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentVersion
        fields = ["id", "document", "content", "version_number", "created_by", "created_at"]
        read_only_fields = ["id", "document", "created_by", "created_at"]


class DocumentSerializer(serializers.ModelSerializer):
    node_title = serializers.CharField(source="node.title", read_only=True)
    node_id = serializers.PrimaryKeyRelatedField(
        source="node",
        queryset=KnowledgeNode.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Document
        fields = [
            "id",
            "title",
            "content",
            "node",
            "node_title",
            "node_id",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at", "node"]

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("标题不能为空")
        return value

    @transaction.atomic
    def create(self, validated_data):
        document = Document.objects.create(
            title=validated_data["title"],
            content=validated_data.get("content", ""),
            node=validated_data.get("node"),
            created_by=self.context["request"].user,
        )
        DocumentVersion.objects.create(
            document=document,
            content=document.content,
            version_number=1,
            created_by=self.context["request"].user,
        )
        return document

    @transaction.atomic
    def update(self, instance, validated_data):
        node_provided = "node" in validated_data
        node = validated_data.pop("node", instance.node)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if node_provided:
            instance.node = node
        instance.save()

        latest_version = instance.versions.first()
        next_version = (latest_version.version_number if latest_version else 0) + 1
        DocumentVersion.objects.create(
            document=instance,
            content=instance.content,
            version_number=next_version,
            created_by=self.context["request"].user,
        )

        return instance
