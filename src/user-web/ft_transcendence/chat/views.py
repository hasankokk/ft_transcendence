from django.shortcuts import render
from rest_framework.decorators import api_view

def windowView(request):
    return render(request, "chat/index.html")

@api_view(['GET'])
def chatRoomView(request):
    return render(request, "chat/chat_room.html")
