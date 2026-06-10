import logging

from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from documents.models import Document
from knowledge.models import KnowledgeNode, KnowledgeRelation
from knowledge.permissions import IsAdminOrOwner
from knowledge.serializers import KnowledgeNodeSerializer, KnowledgeRelationSerializer

logger = logging.getLogger(__name__)


class KnowledgeNodeViewSet(viewsets.ModelViewSet):
    queryset = KnowledgeNode.objects.select_related("created_by").all()
    serializer_class = KnowledgeNodeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        keyword = self.request.query_params.get("keyword")
        node_type = self.request.query_params.get("type")
        if keyword:
            queryset = queryset.filter(
                Q(title__icontains=keyword) | Q(description__icontains=keyword)
            )
        if node_type:
            queryset = queryset.filter(node_type=node_type)
        return queryset

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsAdminOrOwner()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        linked_docs = Document.objects.filter(node=instance)
        linked_docs.update(node=None)
        logger.info(
            "node_deleted node_id=%s docs_detached=%s request_user=%s",
            instance.id,
            linked_docs.count(),
            self.request.user.id,
        )
        instance.delete()


class KnowledgeRelationViewSet(viewsets.ModelViewSet):
    queryset = KnowledgeRelation.objects.select_related(
        "source_node", "target_node", "created_by"
    ).all()
    serializer_class = KnowledgeRelationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        source_node = self.request.query_params.get("source_node")
        target_node = self.request.query_params.get("target_node")
        if source_node:
            queryset = queryset.filter(source_node_id=source_node)
        if target_node:
            queryset = queryset.filter(target_node_id=target_node)
        return queryset

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsAdminOrOwner()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
