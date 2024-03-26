from django.urls import path

from . import views

app_name = "chat"

urlpatterns = [
    path("", views.windowView, name="chat-window"),
    path("<str:room_name>/", views.roomView, name="room"),
]