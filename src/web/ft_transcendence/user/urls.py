from django.urls import path

from . import views

app_name = "user"

urlpatterns = [
    path("register/", views.registerView, name="register"),
    path("login/", views.loginFormView, name="login"),
    path("login-api/", views.loginSubmitAPI, name="login-submit"),
    path("logout/", views.logoutView, name="logout"),
    path("oauth-callback/", views.oauth_callback, name="oauth-callback"),
    path("get-oauth-url/", views.get_oauth_url, name="get-oauth-url"),
]
