from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
import threading

from apps.chat.models import Chat, Message
from apps.api.serializers.chat_serializers import (
    ChatSerializer,
    ChatListSerializer,
    MessageSerializer,
    MessageCreateSerializer,
)
from ..utils import send_to_n8n


class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSerializer

    def get_queryset(self):
        return Chat.objects.filter(user=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return ChatListSerializer
        return ChatSerializer


    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        chat = self.get_object()
        messages = chat.messages.all().order_by('created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_message(self, request, pk=None):
        chat = self.get_object()
        request.data['chat'] = chat.id
        serializer = MessageCreateSerializer(data=request.data)

        if serializer.is_valid():
            message = serializer.save()

            if message.role == 'user':
                threading.Thread(
                    target=send_to_n8n,
                    args=(chat.id, message.content)
                ).start()

            all_messages = chat.messages.all().order_by('created_at')
            response_serializer = MessageSerializer(all_messages, many=True)
            return Response(response_serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def get_updates(self, request, pk=None):
        chat = self.get_object()
        last_id = request.query_params.get('last_id', 0)

        try:
            last_id = int(last_id)
        except (TypeError, ValueError):
            last_id = 0

        messages = chat.messages.filter(id__gt=last_id).order_by('created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


class N8nCallbackView(APIView):
    def post(self, request):
        chat_id = request.data.get('chat_id')
        response_text = request.data.get('response')
        if not chat_id or not response_text:
            return Response(
                {"error": "Missing chat_id or response"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            chat = Chat.objects.get(id=chat_id)
            Message.objects.create(
                chat=chat,
                content=response_text,
                role='assistant'
            )
            return Response({"status": "success"}, status=status.HTTP_200_OK)

        except Chat.DoesNotExist:
            return Response(
                {"error": "Chat not found"},
                status=status.HTTP_404_NOT_FOUND
            )
