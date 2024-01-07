from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def index(request):
    return render(request, 'index.html')

def register(request):
    if request.headers['Content-Type'] == 'text/html':
        return HttpResponse("This is the register page")