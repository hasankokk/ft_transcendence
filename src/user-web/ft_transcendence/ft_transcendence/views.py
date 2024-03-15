from django.shortcuts import render
from rest_framework.decorators import api_view
from django.contrib.auth.decorators import login_required

@login_required
def index(request):
    return render(request, "index.html") # index.html, index_test.html
