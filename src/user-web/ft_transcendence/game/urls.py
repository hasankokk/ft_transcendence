from django.urls import path

from . import views

app_name = "game"

urlpatterns = [
    path("", views.indexView, name="index"),
    path("pong/", views.pongView, name="pong"),
]
