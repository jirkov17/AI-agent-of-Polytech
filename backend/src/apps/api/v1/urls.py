from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .chat_views import ChatViewSet, N8nCallbackView

router = DefaultRouter()
router.register(r'chats', ChatViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('n8n-callback/', N8nCallbackView.as_view(), name='n8n-callback'),
]
