from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenVerifyView

urlpatterns = [
    path("game-status/<int:gameId>/", views.gameStatus, name="game_status"),
    path("verify-token/", TokenVerifyView.as_view(), name="token_verify"),
    # === Debug ===
    path("check-auth/", views.testAuth, name="auth_test"), # similar to verify-token
]
