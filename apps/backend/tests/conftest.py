import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from documents.models import Document, DocumentVersion
from knowledge.models import KnowledgeNode, KnowledgeRelation

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def users(db):
    admin = User.objects.create_user(
        username="admin_test",
        email="admin_test@example.com",
        password="Admin123!",
        role="admin",
        is_staff=True,
    )
    user1 = User.objects.create_user(
        username="alice_test",
        email="alice_test@example.com",
        password="Alice123!",
        role="user",
    )
    user2 = User.objects.create_user(
        username="bob_test",
        email="bob_test@example.com",
        password="Bob12345!",
        role="user",
    )
    return {"admin": admin, "user1": user1, "user2": user2}


@pytest.fixture
def seed_graph(db, users):
    node1 = KnowledgeNode.objects.create(
        title="Node A",
        description="Desc A",
        node_type="概念",
        created_by=users["user1"],
    )
    node2 = KnowledgeNode.objects.create(
        title="Node B",
        description="Desc B",
        node_type="技术",
        created_by=users["user2"],
    )
    relation = KnowledgeRelation.objects.create(
        source_node=node1,
        target_node=node2,
        relation_type="关联",
        weight=1.0,
        description="关系",
        created_by=users["user1"],
    )
    doc = Document.objects.create(
        title="Doc A",
        content="# doc",
        node=node1,
        created_by=users["user1"],
    )
    DocumentVersion.objects.create(
        document=doc,
        content=doc.content,
        version_number=1,
        created_by=users["user1"],
    )
    return {"node1": node1, "node2": node2, "relation": relation, "doc": doc}


def auth(client: APIClient, username: str, password: str):
    response = client.post(
        "/api/auth/login/",
        {"username": username, "password": password},
        format="json",
    )
    token = response.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return response
