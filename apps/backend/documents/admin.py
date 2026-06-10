from django.contrib import admin

from documents.models import Document, DocumentVersion


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "node", "created_by", "updated_at")
    search_fields = ("title", "content")


@admin.register(DocumentVersion)
class DocumentVersionAdmin(admin.ModelAdmin):
    list_display = ("id", "document", "version_number", "created_by", "created_at")
