from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):

	username = forms.CharField(label='Username', max_length=150, help_text='Required. 3-150 characters.')
	email = forms.EmailField(label='Email', max_length=150, help_text='Required. Inform a valid email address.')
	password1 = forms.CharField(label='Password', widget=forms.PasswordInput, help_text='Required. 8-128 characters.')
	password2 = forms.CharField(label='Confirm Password', widget=forms.PasswordInput, help_text='Required. Enter the same password as before, for verification.')

	class Meta:
		model = CustomUser
		fields = ['username', 'email', 'password1', 'password2']

class LoginForm(forms.Form):
	username = forms.CharField(label='Username', max_length=150)
	password = forms.CharField(label='Password', widget=forms.PasswordInput)

	class Meta:
		model = CustomUser
		fields = ['username', 'password']
