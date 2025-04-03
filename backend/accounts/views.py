# accounts/views.py
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import CustomUser
from django.views.decorators.csrf import csrf_exempt
import re

@api_view(['POST'])
@csrf_exempt
def register(request):
    try:
        # Get all fields
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        name = request.data.get('name')
        mobile = request.data.get('mobile')
        
        # Validation
        if not all([username, password, email, name, mobile]):
            return Response(
                {'status': 'error', 'message': 'All fields are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if CustomUser.objects.filter(username=username).exists():
            return Response(
                {'status': 'error', 'message': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not re.match(r'^\d{10,15}$', mobile):
            return Response(
                {'status': 'error', 'message': 'Invalid mobile number format'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if CustomUser.objects.filter(email=email).exists():
            return Response(
                {'status': 'error', 'message': 'Email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user with all fields
        user = CustomUser.objects.create_user(
            username=username,
            password=password,
            email=email,
            name=name,
            mobile=mobile
        )
        
        token = Token.objects.create(user=user)
        return Response({
            'status': 'success',
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'name': user.name,
            'mobile': user.mobile
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'status': 'error', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@csrf_exempt
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
            'username': user.username,
            'email': user.email,
            'name': user.name,
            'mobile': user.mobile
        })
        
    except Exception as e:
        return Response(
            {'status': 'error', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def update_account(request):
    try:
        if not request.auth:
            return Response(
                {'status': 'error', 'message': 'Not authenticated'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        user = request.auth.user
        email = request.data.get('email')
        mobile = request.data.get('mobile')
        password = request.data.get('password')
        
        # Validate mobile if provided
        if mobile and not re.match(r'^\d{10,15}$', mobile):
            return Response(
                {'status': 'error', 'message': 'Invalid mobile number format'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update fields if provided
        if email:
            user.email = email
        if mobile:
            user.mobile = mobile
        if password:
            user.set_password(password)
        
        user.save()
        
        return Response({
            'status': 'success',
            'message': 'Account updated successfully',
            'user': {
                'username': user.username,
                'email': user.email,
                'name': user.name,
                'mobile': user.mobile
            }
        })
        
    except Exception as e:
        return Response(
            {'status': 'error', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['POST'])
@csrf_exempt
def user_logout(request):
    try:
        request.auth.delete()
        return Response(
            {'status': 'success', 'message': 'Logged out successfully'},
            status=status.HTTP_200_OK
        )
    except:
        return Response(
            {'status': 'error', 'message': 'Logout failed'},
            status=status.HTTP_400_BAD_REQUEST
        )