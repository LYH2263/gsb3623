from tests.conftest import auth


def test_graph_endpoint(api_client, users, seed_graph):
    auth(api_client, users["admin"].username, "Admin123!")
    res = api_client.get("/api/graph/")
    assert res.status_code == 200
    assert "nodes" in res.data
    assert "links" in res.data


def test_admin_endpoints_permission(api_client, users):
    auth(api_client, users["user1"].username, "Alice123!")
    forbidden_res = api_client.get("/api/admin/users/")
    assert forbidden_res.status_code == 403

    api_client.credentials()
    auth(api_client, users["admin"].username, "Admin123!")
    list_res = api_client.get("/api/admin/users/")
    assert list_res.status_code == 200

    overview_res = api_client.get("/api/admin/overview/")
    assert overview_res.status_code == 200
    assert {"nodes", "relations", "documents", "users"}.issubset(overview_res.data.keys())
