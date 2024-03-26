from django.shortcuts import render
from rest_framework.decorators import api_view

def windowView(request):
    return render(request, "chat/index.html")

@api_view(['GET'])
def roomView(request, room_name):
    return render(request, "chat/room.html", {"room_name": room_name})
