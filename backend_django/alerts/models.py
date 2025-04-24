# backend/alerts/models.py

from django.db import models
from django.contrib.auth import get_user_model

# backend/alerts/models.py

class EmergencyAlert(models.Model):
    LEVEL_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ]

    title        = models.CharField(max_length=200, default='Alert Title')  # ← ✅ added default
    message      = models.TextField()
    city         = models.CharField(max_length=100)
    level        = models.CharField(max_length=10, choices=LEVEL_CHOICES, default='info')
    created_at   = models.DateTimeField(auto_now_add=True)
    expiry_time  = models.DateTimeField()

    def __str__(self):
        return f"[{self.level.upper()}] {self.city} – {self.title}"

class SeenAlert(models.Model):
    user       = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    alert      = models.ForeignKey(EmergencyAlert, on_delete=models.CASCADE)
    seen_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'alert')


