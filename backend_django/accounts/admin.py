# backend/accounts/serializers.py

from dj_rest_auth.registration.serializers import SocialLoginSerializer
from rest_framework import serializers
from .models import CustomUser
from .serializers import UserSerializer  # assumes you have one

class GoogleLoginSerializer(SocialLoginSerializer):
    def get_response_data(self, user):
        data = super().get_response_data(user)  # e.g. { "key": "<token>" }
        data['user'] = UserSerializer(user).data
        return data
