from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser
from .serializers import UserSerializer, GoogleLoginSerializer
from django.contrib.auth import login
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authentication import TokenAuthentication


@method_decorator(csrf_exempt, name='dispatch')
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:3000"
    client_class = OAuth2Client
    serializer_class = GoogleLoginSerializer

    def post(self, request, *args, **kwargs):
        print("📥 Incoming request data:", request.data)
        try:
            response = super().post(request, *args, **kwargs)
            print("✅ Google login data response:", response.data)
            return response
        except Exception as e:
            print("❌ Login Error:", str(e))
            return Response({'error': str(e)}, status=403)





class CheckAdminStatus(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserDetail(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'name': user.get_full_name(),
            'email': user.email,
            'is_admin': user.is_admin,
            'avatar': user.avatar
        })