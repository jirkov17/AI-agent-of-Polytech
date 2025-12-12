import pytest
from rest_framework.test import APIClient
from apps.chat.models import Chat, Message


@pytest.mark.django_db
def test_e2e_users_see_only_their_chats():
    client = APIClient()

    # --- Пользователь A: регистрация и логин ---
    reg_a = {
        "username": "user_a",
        "email": "user_a@test.com",
        "password": "pass_a_123",
    }
    r = client.post("/api/v1/auth/register/", reg_a, format="json")
    assert r.status_code == 201

    login_a = {"username": "user_a", "password": "pass_a_123"}
    r = client.post("/api/v1/auth/login/", login_a, format="json")
    assert r.status_code == 200
    tokens_a = r.json()
    access_a = tokens_a["access"]

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_a}")

    # Пользователь A создаёт два чата
    r = client.post("/api/v1/chats/", {"title": "A Chat 1"}, format="json")
    assert r.status_code == 201
    chat_a1_id = r.data["id"]

    r = client.post("/api/v1/chats/", {"title": "A Chat 2"}, format="json")
    assert r.status_code == 201
    chat_a2_id = r.data["id"]

    # --- Пользователь B: регистрация и логин ---
    client.credentials()  # сбросить заголовки

    reg_b = {
        "username": "user_b",
        "email": "user_b@test.com",
        "password": "pass_b_123",
    }
    r = client.post("/api/v1/auth/register/", reg_b, format="json")
    assert r.status_code == 201

    login_b = {"username": "user_b", "password": "pass_b_123"}
    r = client.post("/api/v1/auth/login/", login_b, format="json")
    assert r.status_code == 200
    tokens_b = r.json()
    access_b = tokens_b["access"]

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_b}")

    # Пользователь B создаёт один чат
    r = client.post("/api/v1/chats/", {"title": "B Chat 1"}, format="json")
    assert r.status_code == 201
    chat_b1_id = r.data["id"]

    # --- Проверка: A видит только свои чаты ---
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_a}")
    r = client.get("/api/v1/chats/")
    assert r.status_code == 200
    ids_a = [c["id"] for c in r.data["results"]]
    assert set(ids_a) == {chat_a1_id, chat_a2_id}
    assert chat_b1_id not in ids_a

    # --- Проверка: B видит только свои чаты ---
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_b}")
    r = client.get("/api/v1/chats/")
    assert r.status_code == 200
    ids_b = [c["id"] for c in r.data["results"]]
    assert set(ids_b) == {chat_b1_id}
    assert chat_a1_id not in ids_b
    assert chat_a2_id not in ids_b

    # Дополнительно убеждаемся, что сообщения тоже создаются под владельцем
    r = client.post(
        f"/api/v1/chats/{chat_b1_id}/add_message/",
        {"content": "hello from B", "role": "user"},
        format="json",
    )
    assert r.status_code == 200
    assert Message.objects.filter(chat_id=chat_b1_id).count() == 1
