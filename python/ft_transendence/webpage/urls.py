from django.urls import path
from .views import index, register_view, login_view, logout_view

urlpatterns = [
    path('', index, name='index'),
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
]
