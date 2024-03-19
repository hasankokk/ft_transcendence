from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.views import APIView

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def gameStatus(request, gameId):
    players = [
        {"username": "player01",
         "score": 100},
        {"username": "player02",
         "score": 200}
    ]
    return Response({
        "gameId": gameId,
        "players": players,
        "timePassed": timedelta(minutes=3)})

@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def movePlayer(request):
    Response({'message': "Unimplemented"})

# =====
# DEBUG
# =====

@api_view(['GET'])
def testAuth(request):
    if request.user.is_authenticated:
        return Response({'message': 'you are authorized'})
    else:
        return Response({'message': 'you are NOT authorized'})
