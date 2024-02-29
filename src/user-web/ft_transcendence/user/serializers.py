from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(label=_("Username"), max_length=20)
    password = serializers.CharField(label=_("Password"))

    class Meta:
        model = get_user_model()
        fields = ['username', 'password']

class UserPairSerializer(serializers.Serializer):
    sender = serializers.CharField(label=_("Sender"))
    receiver = serializers.CharField(label=_("Receiver"))
