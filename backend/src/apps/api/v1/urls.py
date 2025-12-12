from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .chat_views import ChatViewSet, N8nCallbackView
from .auth_views import RegisterView, MeView  # файл сделаем ниже

router = DefaultRouter()
router.register(r"chats", ChatViewSet, basename="chat")

urlpatterns = [
    path("", include(router.urls)),

    # n8n callback
    path("n8n/callback/", N8nCallbackView.as_view(), name="n8n-callback"),

    # auth
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="auth-login"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
]

