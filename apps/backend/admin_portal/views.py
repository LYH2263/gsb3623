from django.contrib.auth import get_user_model
from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_portal.serializers import AdminUserSerializer, AdminUserUpdateSerializer
from documents.models import Document
from knowledge.models import KnowledgeNode, KnowledgeRelation

User = get_user_model()


class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    queryset = User.objects.all().order_by("-created_at")
    serializer_class = AdminUserSerializer


class AdminUserDetailView(generics.UpdateAPIView):
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
    serializer_class = AdminUserUpdateSerializer
    http_method_names = ["patch"]


class AdminOverviewView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(
            {
                "nodes": KnowledgeNode.objects.count(),
                "relations": KnowledgeRelation.objects.count(),
                "documents": Document.objects.count(),
                "users": User.objects.count(),
            }
        )
