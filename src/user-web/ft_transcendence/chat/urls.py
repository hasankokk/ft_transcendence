from django.urls import path

from . import views

app_name = "chat"

urlpatterns = [
    path("", views.windowView, name="chat-window"),
    path("pong/", views.pongRoomView, name="pong-room"),
    path("test/", views.chatRoomView, name="chat-room"),
]
