from django.shortcuts import render
from django.utils import timezone
from rest_framework.decorators import api_view

from rest_framework.parsers import JSONParser

from game import models

@api_view(['GET'])
def indexView(request):
	return render(request, 'game/index.html')

@api_view(['GET'])
def pongRoomView(request):
    return render(request, 'game/pong_room.html')

@api_view(['GET'])
def pongRoomLocalView(request):
    return render(request, 'game/pong_local.html')
