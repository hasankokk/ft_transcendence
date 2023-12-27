from django.shortcuts import render
from django.shortcuts import render, redirect
from django.contrib.auth import login,logout, authenticate
from django.contrib import messages
from .forms import CustomUserCreationForm
from .forms import LoginForm
import logging

logger = logging.getLogger(__name__)

def index(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'index.html')

def register_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            logger.info('User %s registered', user.username)
            return redirect('login')
        else:
            # Form geçerli değilse, hata mesajları ile birlikte formu tekrar göster
            return render(request, 'register.html', {'form': form})
    else:
        form = CustomUserCreationForm()
        return render(request, 'register.html', {'form': form})

      
      
def login_view(request):
    if request.user.is_authenticated:
        return redirect('index')
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                logger.info('User logged in successfully')
                return redirect('index')  # Ana sayfaya yönlendir
            else:
                logger.warning('Failed login attempt')
                messages.error(request, 'Invalid username or password')
        else:
            messages.error(request, 'Invalid form submission')
    else:
        form = LoginForm()
    return render(request, 'login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('login')
