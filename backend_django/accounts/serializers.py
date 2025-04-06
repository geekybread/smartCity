from rest_framework import serializers
from .models import CustomUser
from dj_rest_auth.registration.serializers import SocialLoginSerializer

class GoogleLoginSerializer(SocialLoginSerializer):
    id_token = serializers.CharField(required=True, allow_blank=False)

    def validate(self, attrs):
        print("✅ Custom GoogleLoginSerializer is being used")

        # Manually add access_token from id_token
        if 'access_token' not in attrs and 'id_token' in self.initial_data:
            attrs['access_token'] = self.initial_data['id_token']
            print("🔁 Injected id_token as access_token")

        # Call parent validation and catch issues
        try:
            return super().validate(attrs)
        except Exception as e:
            print("❌ Validation error in GoogleLoginSerializer:", e)
            raise

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'is_admin', 'avatar']