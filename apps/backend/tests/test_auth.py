from tests.conftest import auth


def test_register_and_login_flow(api_client, db):
    register_res = api_client.post(
        "/api/auth/register/",
        {"username": "new_user", "email": "new@example.com", "password": "Password123!"},
        format="json",
    )
    assert register_res.status_code == 201

    login_res = api_client.post(
        "/api/auth/login/",
        {"username": "new_user", "password": "Password123!"},
        format="json",
    )
    assert login_res.status_code == 200
    assert "access" in login_res.data


def test_me_requires_auth_and_returns_user(api_client, users):
    unauth_res = api_client.get("/api/auth/me/")
    assert unauth_res.status_code == 401
    assert unauth_res.data["code"] == "unauthorized"

    auth(api_client, users["user1"].username, "Alice123!")
    me_res = api_client.get("/api/auth/me/")
    assert me_res.status_code == 200
    assert me_res.data["username"] == users["user1"].username
