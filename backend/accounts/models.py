from django.contrib.auth.models import AbstractUser
from django.db import models
import re

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        (1, 'Admin'),
        (2, 'Regular User'),
    )
    
    # Existing fields
    user_type = models.PositiveSmallIntegerField(choices=USER_TYPE_CHOICES, default=2)
    
    # Updated fields to match frontend requirements
    name = models.CharField(max_length=100)  # Full name (required)
    email = models.EmailField(unique=True)   # Make email unique and required
    mobile = models.CharField(max_length=15, unique=True)  # Renamed from phone to mobilell
    
    # Add any additional fields you need
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        # Validate mobile number format
        if self.mobile and not re.match(r'^\d{10}$', self.mobile):
            raise ValidationError({'mobile': 'Enter a valid mobile number (10 digits)'})

    def save(self, *args, **kwargs):
        self.full_clean()  # Runs clean() and other validations
        super().save(*args, **kwargs)

    def is_admin(self):
        return self.user_type == 1

    def __str__(self):
        return f"{self.name} ({self.username})"