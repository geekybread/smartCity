import os
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token

from .models import CustomUser
from .serializers import UserSerializer, ProfileSerializer

from twilio.rest import Client
from rest_framework.decorators import api_view, permission_classes

@method_decorator(csrf_exempt, name='dispatch')
class GoogleLogin(APIView):
    """
    Accepts a Google OIDC id_token from the front-end, verifies it,
    auto-provisions a CustomUser, and returns a DRF token.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        raw_token = request.data.get('id_token')
        if not raw_token:
            return Response(
                {'error': 'id_token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1) Verify the token against Google's public keys
        try:
            client_id = os.getenv('GOOGLE_CLIENT_ID', '').strip()

            idinfo = google_id_token.verify_oauth2_token(
                raw_token,
                google_requests.Request(),
                client_id or
                    settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
            )
        except ValueError as e:
            print("🔴 id_token verification failed:", e)
            return Response(
                {'error': f'Invalid id_token: {e}'},
                status=status.HTTP_403_FORBIDDEN
            )

        # 2) Extract user information from the token
        email      = idinfo.get('email')
        google_sub = idinfo.get('sub')
        first      = idinfo.get('given_name', '')
        last       = idinfo.get('family_name', '')
        avatar     = idinfo.get('picture', '')

        # 3) Get or create the CustomUser
        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={
                'username':   email.split('@')[0],
                'first_name': first,
                'last_name':  last,
                'google_id':  google_sub,
                'avatar':     avatar,
            }
        )

        # 4) Issue or retrieve a DRF token for the user
        token, _ = Token.objects.get_or_create(user=user)

        # 5) Return the token key and serialized user data
        return Response(
            {
                'key':  token.key,
                'user': UserSerializer(user).data
            },
            status=status.HTTP_200_OK
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_phone_verification(request):
    phone = request.data.get("phone")
    if not phone:
        return Response({"error": "Phone number required"}, status=400)

    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    verification = client.verify.v2.services(settings.TWILIO_VERIFY_SERVICE_SID).verifications.create(
        to=phone,
        channel="sms"
    )
    return Response({"status": verification.status})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_phone_otp(request):
    phone = request.data.get("phone")
    code = request.data.get("code")

    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    try:
        verification_check = client.verify.v2.services(settings.TWILIO_VERIFY_SERVICE_SID).verification_checks.create(
            to=phone,
            code=code
        )
    except Exception as e:
        return Response({"error": str(e)}, status=400)

    if verification_check.status == "approved":
        user = request.user
        user.phone_number = phone
        user.is_phone_verified = True
        user.save()
        return Response({"verified": True})
    return Response({"verified": False}, status=400)



class CheckAdminStatus(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "email": user.email,
            "first_name": user.get_full_name(),
            "is_admin": user.is_admin,
            "phone_number": user.phone_number,
            "is_phone_verified": user.is_phone_verified
        })



class UserDetail(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'name':     user.get_full_name(),
            'email':    user.email,
            'is_admin': user.is_admin,
            'avatar':   user.avatar
        })
    
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    if request.method == 'GET':
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
