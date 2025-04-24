# settings.py

from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-h@p_)o75r$m2@)6p%p&8r3nv-$3^0wp-uunwt5l-pthlt^q@gy'
DEBUG = True
ALLOWED_HOSTS = []

GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY', '')  # ensure this is set in your .env

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
TWILIO_VERIFY_SERVICE_SID = os.getenv("TWILIO_VERIFY_SERVICE_SID", "")

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'accounts',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',

    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
    'csp',

    'feedback',
    'alerts',
    'accidentzones',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'csp.middleware.CSPMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [ BASE_DIR / "templates" ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'smartcity_db',
        'USER': 'root',
        'PASSWORD': 'zxcvbnm@123$',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}

AUTH_USER_MODEL = 'accounts.CustomUser'

AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator' },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator' },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator' },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator' },
]

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': os.getenv('GOOGLE_CLIENT_ID'),
            'secret':    os.getenv('GOOGLE_CLIENT_SECRET'),
            'key':       ''
        },
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {
            'access_type': 'online',
            'redirect_uri': os.getenv(
                'GOOGLE_REDIRECT_URI',
                'http://localhost:3000/accounts/google/login/callback/'
            )
        }
    }
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}

SITE_ID = 1

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
]
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
]

SECURE_CROSS_ORIGIN_OPENER_POLICY = None

# Content Security Policy
CSP_DEFAULT_SRC   = ("'self'",)
CSP_SCRIPT_SRC    = (
    "'self'",
    "https://accounts.google.com",
    "https://maps.googleapis.com",
    "https://maps.gstatic.com",
)
CSP_CONNECT_SRC   = (
    "'self'",
    "https://maps.googleapis.com",
    "https://api.openweathermap.org",
    "https://api.waqi.info",
    "https://restcountries.com",
    "https://accounts.google.com",
)
CSP_STYLE_SRC     = (
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com", 
)


CSP_FONT_SRC = (
    "'self'",
    "https://fonts.gstatic.com",    
)


CSP_IMG_SRC       = (
    "'self'",
    "data:",
    "blob:",
    "https://*.googleapis.com",
    "https://*.gstatic.com",
    "https://openweathermap.org",
)
CSP_FRAME_SRC     = ("'self'", "https://accounts.google.com", "https://maps.googleapis.com")

# Static files
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR /"accidentzones"/ "static",
]

STATIC_ROOT = BASE_DIR / "accidentzones"/"staticfiles"