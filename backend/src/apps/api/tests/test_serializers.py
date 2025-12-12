import pytest
from apps.chat.models import Chat
from apps.api.serializers.chat_serializers import (
    ChatSerializer,
    MessageCreateSerializer,
)

@pytest.mark.django_db
def test_chat_serializer_valid():
    data = {"title": "New Chat"}
    serializer = ChatSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    chat = serializer.save()
    assert isinstance(chat, Chat)
    assert chat.title == "New Chat"


@pytest.mark.django_db
def test_message_create_serializer_requires_content():
    serializer = MessageCreateSerializer(data={"role": "user"})
    assert not serializer.is_valid()
    assert "content" in serializer.errors
