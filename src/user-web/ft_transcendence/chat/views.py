from django.shortcuts import render

def windowView(request):
    return render(request, "chat/index.html")
