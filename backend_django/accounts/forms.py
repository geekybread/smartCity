from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser
from regex import RegexValidator

class RegistrationForm(UserCreationForm):
    mobile = forms.CharField(max_length=15, validators=[RegexValidator(r'^\d{10,15}$')])
    
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'name', 'mobile', 'password1', 'password2')

class LoginForm(forms.Form):
    username = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput)

    def authenticate_user(self):
        from django.contrib.auth import authenticate
        return authenticate(
            username=self.cleaned_data['username'],
            password=self.cleaned_data['password']
        )