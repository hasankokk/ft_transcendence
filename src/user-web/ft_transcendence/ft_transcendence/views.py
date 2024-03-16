from django.shortcuts import render
from rest_framework.decorators import api_view

@api_view(['GET'])
def index(request):
    return render(request, "index.html") # index.html, index_test.html

@api_view(['GET'])
def home(request):
    return render(request, "home.html")
