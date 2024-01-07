from django.contrib.auth.forms import BaseUserCreationForm, UserCreationForm
from django.contrib.auth import get_user_model
from django.conf import settings
from django import forms
from django.utils.translation import gettext_lazy as _

class UserRegistrationForm(UserCreationForm): # Maybe switch to BaseUserCreationForm?

    # email = forms.EmailField(label='Email', max_length=150, help_text=_('Required. Inform a valid email address.'))
    image = forms.ImageField(label='User Image', help_text=_('Optional. Upload an image for user profile.'), required=False)

    class Meta(BaseUserCreationForm.Meta):
        model = get_user_model()
        fields = BaseUserCreationForm.Meta.fields + ("image",)
