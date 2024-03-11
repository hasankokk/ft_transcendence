from django.shortcuts import render, HttpResponseRedirect, reverse
from django.http import HttpResponse, Http404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.views import APIView

@api_view(['GET'])
def testPage(request):
    return render(request, "chat_window.html")

class testView(APIView):
    def post(self, request):
        return Response({'message': 'testView POST not implemented'})
    def get(self, request):
        return Response({'message': 'testView GET not implemented'})

# =====
# DEBUG
# =====

@api_view(['GET'])
def testAuth(request):
    if request.user.is_authenticated:
        return Response({'message': 'you are authorized'})
    else:
        return Response({'message': 'you are NOT authorized'})
