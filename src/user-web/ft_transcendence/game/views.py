from django.shortcuts import render
from rest_framework.decorators import api_view

@api_view(['GET'])
def indexView(request):
	return render(request, 'game/index.html')

@api_view(['GET'])
def pongRoomView(request):
    return render(request, 'game/pong_room.html')
