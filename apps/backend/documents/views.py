from rest_framework import decorators, response, viewsets
from rest_framework.permissions import IsAuthenticated

from documents.models import Document
from documents.serializers import DocumentSerializer, DocumentVersionSerializer
from knowledge.permissions import IsAdminOrOwner


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.select_related("node", "created_by").all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        node_id = self.request.query_params.get("node_id")
        if node_id:
            queryset = queryset.filter(node_id=node_id)
        return queryset

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsAdminOrOwner()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save()

    @decorators.action(detail=True, methods=["get"], url_path="versions")
    def versions(self, request, pk=None):
        document = self.get_object()
        serializer = DocumentVersionSerializer(document.versions.all(), many=True)
        return response.Response(serializer.data)
