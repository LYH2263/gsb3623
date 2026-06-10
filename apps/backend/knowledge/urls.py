from django.urls import include, path
from rest_framework.routers import DefaultRouter

from knowledge.views import KnowledgeNodeViewSet, KnowledgeRelationViewSet

router = DefaultRouter()
router.register("nodes", KnowledgeNodeViewSet, basename="nodes")
router.register("relations", KnowledgeRelationViewSet, basename="relations")

urlpatterns = [
    path("", include(router.urls)),
]
