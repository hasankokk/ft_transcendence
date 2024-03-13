from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView, TokenRefreshView

from . import views

app_name = "user"

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.logoutView, name="logout"),
    path("oauth-callback/", views.oauth_callback, name="oauth-callback"),
    path("get-oauth-url/", views.get_oauth_url, name="get-oauth-url"),
    path("verify-token/", TokenVerifyView.as_view(), name="token_verify"),
    path("refresh-token/", TokenRefreshView.as_view(), name='token_refresh'),
    path("friend-request/", views.FriendRequestView.as_view(), name="friend-request"),
    # =================
    #  Views for debug
    # =================
	path('check-session/', views.check_session, name='check-session'),
    path("check/", views.checkuser, name="user-check"),
    path("check2/", views.checkuser2, name="user-check2"),
    path("check3/", views.checkuser3, name="user-check3"),
    path("check4/", views.checkuser4, name="user-check4"),
]
