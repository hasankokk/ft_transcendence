from django.urls import path

from . import views

urlpatterns = [
    path("", views.gameView, name="pingpong"),
]
