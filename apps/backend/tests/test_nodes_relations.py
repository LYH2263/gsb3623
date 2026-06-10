from documents.models import Document
from knowledge.models import KnowledgeRelation
from tests.conftest import auth


def test_node_create_search_update_permission(api_client, users):
    auth(api_client, users["user1"].username, "Alice123!")

    create_res = api_client.post(
        "/api/nodes/",
        {"title": "Python", "description": "lang", "node_type": "技术"},
        format="json",
    )
    assert create_res.status_code == 201
    node_id = create_res.data["id"]

    list_res = api_client.get("/api/nodes/?keyword=Python&type=技术")
    assert list_res.status_code == 200
    assert len(list_res.data) >= 1

    api_client.credentials()
    auth(api_client, users["user2"].username, "Bob12345!")
    forbidden_res = api_client.put(
        f"/api/nodes/{node_id}/",
        {"title": "Hack", "description": "x", "node_type": "技术"},
        format="json",
    )
    assert forbidden_res.status_code == 403


def test_node_delete_cascades_relation_and_detaches_document(api_client, users, seed_graph):
    auth(api_client, users["user1"].username, "Alice123!")

    delete_res = api_client.delete(f"/api/nodes/{seed_graph['node1'].id}/")
    assert delete_res.status_code == 204
    assert KnowledgeRelation.objects.filter(id=seed_graph["relation"].id).count() == 0
    doc = Document.objects.get(id=seed_graph["doc"].id)
    assert doc.node is None


def test_relations_crud_and_filter(api_client, users, seed_graph):
    auth(api_client, users["admin"].username, "Admin123!")

    create_res = api_client.post(
        "/api/relations/",
        {
            "source_node": seed_graph["node1"].id,
            "target_node": seed_graph["node2"].id,
            "relation_type": "依赖",
            "weight": 2.0,
            "description": "依赖关系",
        },
        format="json",
    )
    assert create_res.status_code == 201
    relation_id = create_res.data["id"]

    filter_res = api_client.get(f"/api/relations/?source_node={seed_graph['node1'].id}")
    assert filter_res.status_code == 200
    assert len(filter_res.data) >= 1

    update_res = api_client.put(
        f"/api/relations/{relation_id}/",
        {
            "source_node": seed_graph["node1"].id,
            "target_node": seed_graph["node2"].id,
            "relation_type": "依赖",
            "weight": 1.5,
            "description": "更新",
        },
        format="json",
    )
    assert update_res.status_code == 200

    delete_res = api_client.delete(f"/api/relations/{relation_id}/")
    assert delete_res.status_code == 204
