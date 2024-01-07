from django.shortcuts import render

def gameView(request):
	return render(request, 'game/game.html') # no such file
