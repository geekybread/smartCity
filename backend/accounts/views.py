from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import CustomUser
from .forms import RegistrationForm, LoginForm
from django.views.decorators.csrf import csrf_exempt

@api_view(['POST'])
@csrf_exempt  # Only for development if CSRF is causing issues
def register(request):
    try:
        # Manual data validation (more flexible than forms for API)
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')
        
        if not username or not password:
            return Response(
                {'status': 'error', 'message': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if CustomUser.objects.filter(username=username).exists():
            return Response(
                {'status': 'error', 'message': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = CustomUser.objects.create_user(
            username=username,
            password=password,
            email=email
        )
        
        token = Token.objects.create(user=user)
        return Response({
            'status': 'success',
            'token': token.key,
            'user_id': user.id,
            'username': user.username
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'status': 'error', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@csrf_exempt  # Only for development
def user_login(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'status': 'error', 'message': 'Both username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        if not user:
            return Response(
                {'status': 'error', 'message': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'status': 'success',
            'token': token.key,
            'user_id': user.id,
            'username': user.username
        })
        
    except Exception as e:
        return Response(
            {'status': 'error', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def user_logout(request):
    try:
        if not request.auth:
            return Response(
                {'status': 'error', 'message': 'Not authenticated'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        request.auth.delete()
        return Response(
            {'status': 'success', 'message': 'Successfully logged out'},
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        return Response(
            {'status': 'error', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )