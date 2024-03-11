from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenVerifyView

urlpatterns = [
    path("", views.testPage, name="window"),
    path("mytest/", views.testView.as_view(), name="message"),
    path("verify-token/", TokenVerifyView.as_view(), name="token_verify"),
    # === Debug ===
    path("check-auth/", views.testAuth, name="auth_test"), # similar to verify-token
]
