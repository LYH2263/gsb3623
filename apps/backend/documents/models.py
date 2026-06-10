from django.conf import settings
from django.db import models

from knowledge.models import KnowledgeNode


class Document(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    node = models.ForeignKey(
        KnowledgeNode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documents",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return self.title


class DocumentVersion(models.Model):
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name="versions",
    )
    content = models.TextField()
    version_number = models.PositiveIntegerField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="document_versions",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("document", "version_number")
        ordering = ["-version_number"]

    def __str__(self) -> str:
        return f"{self.document_id}-v{self.version_number}"
