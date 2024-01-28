from django.http import JsonResponse, HttpResponse, Http404

from django.contrib.auth import logout, authenticate, login, get_user_model
from django.contrib import messages
from django.shortcuts import render, HttpResponseRedirect, reverse
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.views.decorators.http import require_GET

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework import status

import json
import logging # is this necessary?
import requests # is this necessary?

from . import forms
from . import serializers

TOKEN_URL = "https://api.intra.42.fr/oauth/token"
AUTHORIZATION_URL = "https://api.intra.42.fr/oauth/authorize"

logger = logging.getLogger(__name__)

def registerView(request):

    if request.method == 'GET':
        context = {'form': forms.UserRegistrationForm().render("user/form_snippet.html")}
        return render(request, "user/register.html", context)

    elif request.method == 'POST':
        form = forms.UserRegistrationForm(data=request.POST)

        if form.is_valid():
            try:
                user = form.save()
            except ValueError as e:
                for msg in e.args:
                    messages.error(request, msg)
                return HttpResponseRedirect(request.path)
            except:
                messages.error(request, _("An error occured while registering user in the database"))
                return HttpResponseRedirect(request.path)
            messages.success(request, _("Successfully registered"))
            return HttpResponseRedirect(request.path)

        else:
            password1 = form.data["password1"]
            password2 = form.data["password2"]
            username = form.data["username"]
            email = form.data["email"]

            for error in form.errors:
                if error == 'email':
                    if get_user_model().objects.filter(email=email).exists():
                        messages.error(request, _("Email is already taken"))
                    else:
                        messages.error(request, _("Invalid email"))
                elif error == 'password2' and password1 == password2:
                    messages.error(request, _("The password is not strong enough"))
                elif error == 'password2' and password1 != password2:
                    messages.error(request, _("The passwords do not match"))
                elif error == 'username':
                    if get_user_model().objects.filter(username=username).exists():
                        messages.error(request, _("Username is already taken"))
                    else:
                        messages.error(request, _("Invalid username" + error))
                else:
                    messages.error(request, _("Invalid form error: " + error))
            return HttpResponseRedirect(request.path)

    return Http404(_("Invalid request method"))

@require_GET
def loginFormView(request):
    if not request.user.is_authenticated:
        form = forms.UserLoginForm()
        return render(request, "user/login.html", {'form': form})
    else:
        return HttpResponseRedirect(reverse("game:index"))

@api_view(['POST'])
def loginSubmitAPI(request):
    data = JSONParser().parse(request)
    serializer = serializers.UserLoginSerializer(data=data)

    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(request, username=username, password=password)

        if user != None:
            login(request, user) # TODO: Remove after implementing JWT
            messages.success(request, _("Login successful"))
            return Response({"Your Token": "Very secure random token"})
        else:
            messages.error(request, _("Incorrect username or password"))
            return HttpResponseRedirect(reverse("user:login"), status=401)
            #return Response({"message": "Login credentials incorrect"}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        for error in serializer.errors:
            messages.error(request, "Invalid Serializer:" + error)
        return Response({"message": "An error has occured"}, status=status.HTTP_401_UNAUTHORIZED)

def logoutView(request):
    
    if request.user.is_authenticated:
        logout(request)
        messages.info(request, _("Logout successful"))
    else:
        messages.warning(request, _("User is already logged out"))
    return HttpResponseRedirect(reverse("index"))

def get_oauth_url(request):
    oauth_url = f"{AUTHORIZATION_URL}?client_id={settings.OAUTH_CLIENT_ID}&redirect_uri={settings.OAUTH_REDIRECT_URI}&response_type=code"
    return JsonResponse({'oauth_url': oauth_url})

msg_oauthSuccess = """
<script type="text/javascript">
    localStorage.setItem('oauthSuccess', 'true');
	window.close();
</script>
"""

msg_oauthFailure = """
<script type="text/javascript">
    localStorage.setItem('oauthFailure', 'true');
    window.close();
</script>
"""

def oauth_callback(request):
    code = request.GET.get('code')
    if code:
        token_response = requests.post(TOKEN_URL, data={
            'grant_type': 'authorization_code',
            'client_id': settings.OAUTH_CLIENT_ID,
            'client_secret': settings.OAUTH_CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.OAUTH_REDIRECT_URI,
        }).json()
        access_token = token_response.get("access_token")
        if access_token:
            user_info = requests.get('https://api.intra.42.fr/v2/me', headers={'Authorization': f'Bearer {access_token}'}).json()
            user, created = get_user_model().objects.get_or_create(
                username=user_info.get('login'),
                defaults={'email': user_info.get('email')}
            )
            login(request, user)
            return HttpResponse(msg_oauthSuccess)
        else:
            return HttpResponse(msg_oauthFailure)
    return HttpResponse(msg_oauthFailure)
