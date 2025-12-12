import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.chat.models import Chat, Message

User = get_user_model()


@pytest.mark.django_db
def test_anonymous_cannot_see_chats():
    client = APIClient()
    response = client.get("/api/v1/chats/")
    assert response.status_code in (401, 403)


@pytest.mark.django_db
def test_user_sees_only_own_chats():
    client = APIClient()

    user1 = User.objects.create_user(username="user1", password="pass12345")
    user2 = User.objects.create_user(username="user2", password="pass12345")

    chat1 = Chat.objects.create(user=user1, title="Chat 1")
    Chat.objects.create(user=user2, title="Chat 2")

    client.force_authenticate(user=user1)
    response = client.get("/api/v1/chats/")

    assert response.status_code == 200
    ids = [item["id"] for item in response.data["results"]]
    assert chat1.id in ids
    assert len(ids) == 1


@pytest.mark.django_db
def test_create_chat_belongs_to_user():
    client = APIClient()
    user = User.objects.create_user(username="user", password="pass12345")

    client.force_authenticate(user=user)
    response = client.post("/api/v1/chats/", {"title": "My chat"}, format="json")

    assert response.status_code == 201
    chat = Chat.objects.get(id=response.data["id"])
    assert chat.user == user


@pytest.mark.django_db
def test_add_message_creates_message(monkeypatch):
    client = APIClient()
    user = User.objects.create_user(username="user", password="pass12345")
    chat = Chat.objects.create(user=user, title="My chat")

    # не вызываем реальный send_to_n8n
    def fake_send_to_n8n(chat_id, content):
        return None

    monkeypatch.setattr("apps.api.v1.chat_views.send_to_n8n", fake_send_to_n8n)

    client.force_authenticate(user=user)
    response = client.post(
        f"/api/v1/chats/{chat.id}/add_message/",
        {"content": "hello", "role": "user"},
        format="json",
    )

    assert response.status_code == 200
    messages = Message.objects.filter(chat=chat)
    assert messages.count() == 1
    assert messages.first().content == "hello"
