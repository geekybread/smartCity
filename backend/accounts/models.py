from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        (1, 'Admin'),
        (2, 'Regular User'),
    )
    user_type = models.PositiveSmallIntegerField(choices=USER_TYPE_CHOICES, default=2)
    phone = models.CharField(max_length=15, blank=True)
    
    def is_admin(self):
        return self.user_type == 1