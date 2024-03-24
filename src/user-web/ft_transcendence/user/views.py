from django.http import JsonResponse, HttpResponse, Http404, FileResponse

from django.db.models import Q
from django.contrib.auth import logout, authenticate, login, get_user_model
from django.contrib import messages
from django.shortcuts import get_object_or_404, render, HttpResponseRedirect, reverse
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import ensure_csrf_cookie

from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.views import APIView
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from django_otp.forms import OTPTokenForm
from django_otp.plugins.otp_email.models import EmailDevice

import json
import logging # is this necessary?
import requests # is this necessary?

from . import forms
from . import serializers
from user.models import UserRelationship

TOKEN_URL = "https://api.intra.42.fr/oauth/token"
AUTHORIZATION_URL = "https://api.intra.42.fr/oauth/authorize"

logger = logging.getLogger(__name__)

class RegisterView(View):

    def get(self, request):
        context = {'form': forms.UserRegistrationForm().render("user/form_snippet.html")}
        return render(request, "user/register.html", context)

    def post(self, request):
        
        data = request.POST
        if len(request.POST) == 0:
            data = json.loads(request.body)
        form = forms.UserRegistrationForm(data=data)

        if form.is_valid():
            try:
                user = form.save()
            except ValueError as e:
                return JsonResponse({'success': False, "message": "ValueError", "errors": e.args})
            except:
                return JsonResponse({'success': False, "message": _("An error occured while registering user in the database")})
            return JsonResponse({'success': True, "message": _("Successfully registered")})

        else:
            password1 = form.data.get("password1", None)
            password2 = form.data.get("password2", None)
            username = form.data.get("username", None)
            email = form.data.get("email", None)

            errors = []

            for error in form.errors:
                if form.data.get(error, None) is None:
                    errors.append(_(error + " field is not found"))
                elif error == 'email':
                    if get_user_model().objects.filter(email=email).exists():
                        errors.append(_("Email is already taken"))
                    else:
                        errors.append(_("Invalid email"))
                elif error == 'password2' and password1 == password2:
                    errors.append(_("The password is not strong enough"))
                elif error == 'password2' and password1 != password2:
                    errors.append(_("The passwords do not match"))
                elif error == 'username':
                    if get_user_model().objects.filter(username=username).exists():
                        errors.append(_("Username is already taken"))
                    else:
                        errors.append(_("Invalid username" + error))
                else:
                    errors.append(_("Invalid form error: " + error))
            return JsonResponse({'errors': errors})

class LoginView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            form = forms.UserLoginForm().render("user/form_snippet.html")
            return render(request, "user/login.html", {'form': form})
        else:
            return HttpResponseRedirect(reverse("home"))

    def post(self, request):
        data = JSONParser().parse(request)
        serializer = serializers.UserLoginSerializer(data=data)

        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(request, username=username, password=password)

            if user is not None:
                if user.two_fa_auth_type == get_user_model().TwoFAType.NONE:
                    refresh = RefreshToken.for_user(user)
                    # TODO: set cookies
                    # messages.success(request, _("Login successful"))
                    response_data = {'success': True,
                                     'redirect': reverse('home'),
                                     'message': _("login successful"),
                                     #'refresh': str(refresh),
                                     #'access': str(refresh.access_token)
                                     }
                    response = Response(response_data)
                    response.set_cookie('refresh_token', str(refresh), samesite='Strict', httponly=True)
                    response.set_cookie('access_token', str(refresh.access_token), samesite='Strict')
                    return response
                else:
                    request.session["attempting_user"] = user.id
                    response = {'success': True,
                                'redirect': reverse('user:two-factor'),
                                'message': _("Login successful")}
                    return Response(response)
            else:
                # messages.error(request, _("Incorrect username or password"))
                # return HttpResponseRedirect(reverse("user:login"), status=401)
                response = {'success': False, 'errors': [_("Incorrect username or password")]}
                return Response(response, status=status.HTTP_401_UNAUTHORIZED)
        else:
            # for error in serializer.errors:
            #    messages.error(request, "Invalid Serializer:" + error)
            response = {'success': False, 'errors': serializer.errors}
            return Response(response, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def logoutView(request):
    response = HttpResponseRedirect(reverse('home'))
    response.delete_cookie('refresh_token', samesite='Strict')
    response.delete_cookie('access_token', samesite='Strict')
    return response

class refreshTokenView(APIView):
    def post(self, request):
        data = JSONParser().parse(request)
        serializer = TokenRefreshSerializer(data=data)

        if serializer.is_valid():
            access = serializer.validated_data['access']
            response = Response({'success': True, 'message': _("Refreshed access token")})
            response.set_cookie('access_token', access, samesite='Strict')
            return response
        else:
            response = Response({'success': False, 'errors': [_("Invalid refresh token")]},
                                status=status.HTTP_401_UNAUTHORIZED)
            response.delete_cookie('refresh_token', samesite='Strict')
            response.delete_cookie('access_token', samesite='Strict')
            return response
    def get(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if refresh_token is None:
            return Response({'success': False,
                             'errors': [_("Refresh token not found in cookies")]},
                            status=status.HTTP_400_BAD_REQUEST)
        
        serializer = TokenRefreshSerializer(data={"refresh": refresh_token})

        if serializer.is_valid():
            access = serializer.validated_data['access']
            response = Response({'success': True, 'message': _("Refreshed access token")})
            response.set_cookie('access_token', access, samesite='Strict')
            return response
        else:
            response = Response({'success': False, 'errors': [_("Invalid refresh token")]},
                                status=status.HTTP_401_UNAUTHORIZED)
            response.delete_cookie('refresh_token', samesite='Strict')
            response.delete_cookie('access_token', samesite='Strict')
            return response

def get_oauth_url(request):
    oauth_url = f"{AUTHORIZATION_URL}?client_id={settings.OAUTH_CLIENT_ID}&redirect_uri={settings.OAUTH_REDIRECT_URI}&response_type=code"
    return JsonResponse({'oauth_url': oauth_url, 'redirect': reverse('home')})

@api_view(['GET', 'POST'])
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

            #TODO: Check if access_token is valid

            user, created = get_user_model().objects.get_or_create(
                username=user_info.get('login'),
                defaults={'email': user_info.get('email'), 'is_42authenticated': True}
            )
            if not created:
                # user.is_42authenticated = True
                user.save()

            refresh = RefreshToken.for_user(user)
            response_data = {'success': True,
                             'redirect': reverse('home'),
                             'message': _("login successful"),
                             #'refresh': str(refresh),
                             #'access': str(refresh.access_token)
                             }
            response = Response(response_data)
            response.set_cookie('refresh_token', str(refresh), samesite='Strict', httponly=True)
            response.set_cookie('access_token', str(refresh.access_token), samesite='Strict')
            return response
        else:
            response = {'success': False, 'message': _("Incorrect access token")}
            return Response(response, status=status.HTTP_401_UNAUTHORIZED)
    response = {'success': False, 'message': _("Invalid login request")}
    return Response(response, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def check_session(request):
    is_logged_in = request.user.is_authenticated
    return Response({'isLoggedIn': is_logged_in})

class FriendRequestView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"warning": "unimplemented"})
    def post(self, request):
        data = JSONParser().parse(request)
        serializer = serializers.UserPairSerializer(data=data)

        if serializer.is_valid():
            sender = request.user
            receiver = get_object_or_404(get_user_model(), username=serializer.validated_data['receiver'])

            try:
                if sender.pk < receiver.pk:
                    obj = UserRelationship.objects.get(Q(user1=sender),
                                                       Q(user2=receiver))
                    if obj.is_pending_user2():
                        obj.type = UserRelationship.RelationshipType.FRIENDS
                        obj.save()
                        return Response({'success': 'Accepted friend request'})
                    else:
                        return Response({'error': 'Friend request cannot be sent'})
                else:
                    obj = UserRelationship.objects.get(Q(user2=sender),
                                                       Q(user1=receiver))
                    if obj.is_pending_user1():
                        obj.type = UserRelationship.RelationshipType.FRIENDS
                        obj.save()
                        return Response({'success': 'Accepted friend request'})
                    else:
                        return Response({'error': 'Friend request cannot be sent'})
            except UserRelationship.DoesNotExist:
                # create new relationship
                if sender.pk < receiver.pk:
                    obj = UserRelationship.objects.create(user1=sender, user2=receiver,
                                                          type=UserRelationship.RelationshipType.PENDING12)
                else:
                    obj = UserRelationship.objects.create(user2=sender, user1=receiver,
                                                          type=UserRelationship.RelationshipType.PENDING21)
                if obj is None:
                    return Response({'error': 'Cannot create user relationship'})
                else:
                    return Response({'success': 'Friend request has been sent'})
        else:
            for error in serializer.errors:
                messages.error(request, "Invalid Serializer:" + error)
            return Response({"message": "An error has occured"}, status=status.HTTP_401_UNAUTHORIZED)

class TwoFactorAuthenticationView(APIView):
    def get(self, request):
        user_id = request.session.get("attempting_user", None)
        if user_id is None:
            return render(request, "error.html", {'error': "Unauthorized Request"}, status=401)
            
        else:
            user = get_object_or_404(get_user_model(), id=user_id)
            if user.two_fa_auth_type == get_user_model().TwoFAType.EMAIL:
                pass
                device = get_object_or_404(EmailDevice, user=user)
                # device.generate_challenge()
            else:
                return HttpResponse("No two-factor authentication device registered for the user #" + str(user_id), status=401)
            
            form = OTPTokenForm(user).render("user/2fa_snippet.html")
            context = {'form': form}
            return render(request, "user/two-factor.html", context)
    def post(self, request):
        return Response({'message': "POST request is NOT implemented"})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def paddwordChangeView(request):
    data = JSONParser().parse(request)
    response = {'success': False, 'errors': []}
    serializer = serializers.UserPasswordChangeSerializer(data=data)

    if serializer.is_valid():
        if request.user.check_password(serializer.validated_data['old_password']):
            p1 = serializer.validated_data['new_password1']
            p2 = serializer.validated_data['new_password2']

            if p1 != p2:
                response['errors'].append(_("Passwords do not match"))
                return Response(response, status=status.HTTP_400_BAD_REQUEST)
            request.user.set_password(p1)
            request.user.save()
            response['success'] = True
            response['message'] = _("Password change is successful")
            return Response(response)
        else:
            response['errors'].append(_("Invalid password"))
            return Response(response, status=status.HTTP_401_UNAUTHORIZED)

    else:
        response['errors'].append(_("Invalid data"))
        return Response(response, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteUserView(request):
    response = HttpResponseRedirect(reverse('home'))
    response.delete_cookie('refresh_token', samesite='Strict')
    response.delete_cookie('access_token', samesite='Strict')
    request.user.delete()
    return response

class UserImageView(APIView):
    def get(self, request, user_id=None):
        
        default_path = settings.MEDIA_URL[1:] + "image/default/user.png"

        if request.user.is_authenticated:
            if user_id is None:
                return FileResponse(open(request.user.image, 'rb'))
            else:
                try:
                    target_user = get_user_model().get(pk=user_id)
                    return FileResponse(open(target_user.image), 'rb')
                except get_user_model().DoesNotExist:
                    return FileResponse(open(default_path, 'rb'))
        else:
            return FileResponse(open(default_path, 'rb'))

# =================
#  Views for debug
# =================

@require_GET # Uses default session-based Django authentication
def checkuser(request):
    if request.user.is_authenticated:
        return HttpResponse("request.user.is_authenticated\n request.user.username: " + str(request.user.username))
    else:
        return HttpResponse("NOT request.user.is_authenticated\n request.user.username: " + str(request.user.username), status="401")

@api_view(['GET']) # Restricted view for DRF authentication
@permission_classes([IsAuthenticated])
def checkuser2(request):
    return HttpResponse("You are authenticated\n request.user.username: " + str(request.user.username))

@api_view(['GET']) # Different responses for (un)authenticated requests
def checkuser3(request):
    if request.auth:
        return HttpResponse("You are authenticated\n request.user.username: " + str(request.user.username))
    else:
        return HttpResponse("You are NOT authenticated\n request.user.username: " + str(request.user.username), status="401")

@api_view(['GET'])
def checkuser4(request):
    if request.user.is_authenticated:
        return HttpResponse("request.user.is_authenticated\n request.user.username: " + str(request.user.username))
    else:
        return HttpResponse("NOT request.user.is_authenticated\n request.user.username: " + str(request.user.username), status="401")
