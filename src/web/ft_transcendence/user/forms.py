from django.contrib.auth.forms import BaseUserCreationForm, UserCreationForm
from django.contrib.auth import get_user_model
from django.conf import settings
from django import forms
from django.utils.translation import gettext_lazy as _

class UserLoginForm(forms.Form):
    username = forms.CharField(label="Username", max_length=20, widget=forms.TextInput())
    password = forms.CharField(label="Password", widget=forms.PasswordInput())

    class Meta:
        model = get_user_model()
        fields = ['username', 'password']

class UserRegistrationForm(BaseUserCreationForm):
    class Meta(BaseUserCreationForm.Meta):
        model = get_user_model()
        fields = BaseUserCreationForm.Meta.fields + ("email",)
