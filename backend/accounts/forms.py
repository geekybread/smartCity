from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser

class RegistrationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password1', 'password2', 'phone')

class LoginForm(forms.Form):
    username = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput)

    def authenticate_user(self):
        from django.contrib.auth import authenticate
        return authenticate(
            username=self.cleaned_data['username'],
            password=self.cleaned_data['password']
        )