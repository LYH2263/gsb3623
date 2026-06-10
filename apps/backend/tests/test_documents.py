from documents.models import DocumentVersion
from tests.conftest import auth


def test_document_create_update_versions(api_client, users, seed_graph):
    auth(api_client, users["user1"].username, "Alice123!")

    create_res = api_client.post(
        "/api/documents/",
        {
            "title": "Doc New",
            "content": "# v1",
            "node_id": seed_graph["node1"].id,
        },
        format="json",
    )
    assert create_res.status_code == 201
    doc_id = create_res.data["id"]

    assert DocumentVersion.objects.filter(document_id=doc_id, version_number=1).exists()

    update_res = api_client.put(
        f"/api/documents/{doc_id}/",
        {
            "title": "Doc New",
            "content": "# v2",
            "node_id": seed_graph["node1"].id,
        },
        format="json",
    )
    assert update_res.status_code == 200

    versions_res = api_client.get(f"/api/documents/{doc_id}/versions/")
    assert versions_res.status_code == 200
    assert len(versions_res.data) == 2


def test_document_forbidden_for_non_owner(api_client, users, seed_graph):
    auth(api_client, users["user2"].username, "Bob12345!")
    res = api_client.put(
        f"/api/documents/{seed_graph['doc'].id}/",
        {
            "title": "Nope",
            "content": "x",
            "node_id": None,
        },
        format="json",
    )
    assert res.status_code == 403
