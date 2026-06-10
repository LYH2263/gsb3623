from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from knowledge.models import KnowledgeNode, KnowledgeRelation


class GraphView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        nodes = list(
            KnowledgeNode.objects.values(
                "id", "title", "description", "node_type", "created_by", "created_at"
            )
        )
        links = list(
            KnowledgeRelation.objects.values(
                "id",
                "source_node",
                "target_node",
                "relation_type",
                "weight",
                "description",
                "created_by",
            )
        )
        mapped_links = [
            {
                "id": item["id"],
                "source": item["source_node"],
                "target": item["target_node"],
                "relation_type": item["relation_type"],
                "weight": item["weight"],
                "description": item["description"],
                "created_by": item["created_by"],
            }
            for item in links
        ]
        return Response({"nodes": nodes, "links": mapped_links})
