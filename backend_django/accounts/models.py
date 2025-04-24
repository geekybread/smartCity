from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator

class CustomUser(AbstractUser):
    is_admin = models.BooleanField(default=False)
    google_id = models.CharField(max_length=255, unique=True, null=True)
    avatar = models.URLField(blank=True)

    phone_number = models.CharField(
        max_length=15,
        unique=True,
        null=True,
        blank=True,
        validators=[RegexValidator(regex=r'^\+?\d{10,15}$')],
        help_text="Include country code, e.g., +919876543210"
    )

    is_phone_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return self.email
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'