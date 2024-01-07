from django.http import JsonResponse, HttpResponse

from django.contrib.auth import logout, authenticate, login, get_user_model
from django.conf import settings

import json
import logging # is this necessary?
import requests # is this necessary?

from . import forms

TOKEN_URL = "https://api.intra.42.fr/oauth/token"
AUTHORIZATION_URL = "https://api.intra.42.fr/oauth/authorize"

logger = logging.getLogger(__name__)

def registerView(request):

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            form = forms.UserRegistrationForm(data)
            if form.is_valid():
                user = form.save()
                logger.info('User %s registered', user.username)
                return JsonResponse({'status': 'success', 'message': 'Registration successful'})
            else:
                errors = form.errors.as_json()
                return JsonResponse({'status': 'error', 'errors': errors}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
        except Exception as e:
            print(e)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

def loginView(request):
    
    # Should use login() here ?

    if request.user.is_authenticated:
        return JsonResponse({'status': 'success', 'message': 'Already authenticated'})

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            if not username or not password:
                return JsonResponse({'status': 'error', 'message': 'Username and password are required'}, status=400)

            user = authenticate(request, username=username, password=password)
            if user != None:
                logger.info('User logged in successfully')
                return JsonResponse({'status': 'success', 'message': 'Login successful'})
            else:
                return JsonResponse({'status': 'error', 'message': 'Invalid username or password'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

def logoutView(request):
    
    logout(request)
    return JsonResponse({'status': 'success', 'message': 'Successfully logged out'})


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
