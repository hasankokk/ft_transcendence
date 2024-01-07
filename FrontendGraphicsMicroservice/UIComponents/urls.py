from django.urls import path, re_path
from django.contrib import admin
from . import views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('index/', views.index, name='index'),
    path('register/', views.register, name='register'),
    re_path(r'^.*$', views.index, name='index'),
]
