from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class KnowledgeNode(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    node_type = models.CharField(max_length=50)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="knowledge_nodes",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return self.title


class KnowledgeRelation(models.Model):
    source_node = models.ForeignKey(
        KnowledgeNode,
        on_delete=models.CASCADE,
        related_name="outgoing_relations",
    )
    target_node = models.ForeignKey(
        KnowledgeNode,
        on_delete=models.CASCADE,
        related_name="incoming_relations",
    )
    relation_type = models.CharField(max_length=50)
    weight = models.FloatField(default=1.0, validators=[MinValueValidator(0.0)])
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="knowledge_relations",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.source_node_id}->{self.target_node_id}({self.relation_type})"
