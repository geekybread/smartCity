# backend/accounts/serializers.py
from django.contrib import admin
import allauth.account.admin
import allauth.socialaccount.admin
from django.contrib.auth.models import Group
from allauth.account.models import EmailAddress
from allauth.socialaccount.models import SocialAccount, SocialApp, SocialToken

from dj_rest_auth.registration.serializers import SocialLoginSerializer
from rest_framework import serializers
from .models import CustomUser
from .serializers import UserSerializer  # assumes you have one

# ✅ Unregister only if registered
for model in [EmailAddress, SocialAccount, SocialApp, SocialToken, Group]:
    try:
        admin.site.unregister(model)
    except admin.sites.NotRegistered:
        pass
    
class GoogleLoginSerializer(SocialLoginSerializer):
    def get_response_data(self, user):
        data = super().get_response_data(user)  # e.g. { "key": "<token>" }
        data['user'] = UserSerializer(user).data
        return data
