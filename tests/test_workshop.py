"""End-to-end tests of the running workshop.

1. The extension published the role model and the role assignments to OpenFGA.
2. The use cases, at both enforcement points (Store OpenFGA API and Store Authorization Gateway).

Run: docker compose run --rm smoke-test
"""
import os
import time

import pytest
import requests

KEYCLOAK = os.getenv("KEYCLOAK_URL", "http://keycloak:8081")
OPENFGA = os.getenv("OPENFGA_URL", "http://openfga:8080")
ADMIN_USER = os.getenv("KEYCLOAK_USER", "admin")
ADMIN_PASSWORD = os.getenv("KEYCLOAK_PASSWORD", "password")
PASSWORD = "demo1234!"
APIS = ["http://store-openfga-api:9091", "http://store-authz-gateway:9080"]
TEST_CLIENT = "smoke-test"  # created by keycloak/import.sh, testing only


def token(client_id, username, password):
    r = requests.post(
        f"{KEYCLOAK}/realms/master/protocol/openid-connect/token",
        data={"grant_type": "password", "client_id": client_id, "username": username, "password": password},
    )
    r.raise_for_status()
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def admin():
    s = requests.Session()
    s.headers["Authorization"] = f"Bearer {token('admin-cli', ADMIN_USER, ADMIN_PASSWORD)}"
    s.base = f"{KEYCLOAK}/admin/realms/master"
    return s


@pytest.fixture(scope="session")
def user_id(admin):
    def get(username):
        r = admin.get(f"{admin.base}/users", params={"username": username, "exact": "true"})
        r.raise_for_status()
        return r.json()[0]["id"]
    return get


@pytest.fixture(scope="session", autouse=True)
def apis_up():
    """The apps start after the import and take a few seconds to listen."""
    for api in APIS:
        for _ in range(60):
            try:
                requests.get(f"{api}/api/products", timeout=2)
                break
            except requests.ConnectionError:
                time.sleep(2)
        else:
            pytest.fail(f"{api} is not up")


@pytest.fixture(scope="session")
def tuples():
    stores = requests.get(f"{OPENFGA}/stores").json()["stores"]
    store_id = next(s["id"] for s in stores if s["name"] == "keycloak")
    r = requests.post(f"{OPENFGA}/stores/{store_id}/read", json={})
    r.raise_for_status()
    return {(t["key"]["user"], t["key"]["relation"], t["key"]["object"]) for t in r.json()["tuples"]}


@pytest.mark.parametrize("user, relation, obj", [
    ("role:admin-catalog", "parent", "role:view-product"),
    ("role:admin-catalog", "parent", "role:edit-product"),
    ("role:analyst-catalog", "parent", "role:view-product"),
    ("paula", "assignee", "role:analyst-catalog"),
    ("richard", "assignee", "role:admin-catalog"),
])
def test_tuple_published(tuples, user_id, user, relation, obj):
    if not user.startswith("role:"):
        user = f"user:{user_id(user)}"
    assert (user, relation, obj) in tuples


@pytest.mark.parametrize("api", APIS, ids=["store-openfga-api", "store-authz-gateway"])
@pytest.mark.parametrize("username, view, publish", [
    ("paula", 200, 403),    # analyst: view only
    ("richard", 200, 200),  # admin: view and publish
    ("peter", 403, 403),    # no role
])
def test_use_case(api, username, view, publish):
    headers = {"Authorization": f"Bearer {token(TEST_CLIENT, username, PASSWORD)}"}
    assert requests.get(f"{api}/api/products", headers=headers).status_code == view
    assert requests.post(f"{api}/api/products/1/publish", headers=headers).status_code == publish
