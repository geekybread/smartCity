from django.db import models
from django.contrib.auth import get_user_model

class FeedbackReport(models.Model):
    ISSUE_TYPES = [
        ('pothole', 'Pothole'),
        ('streetlight', 'Street Light'),
        ('garbage', 'Garbage'),
        ('other', 'Other'),
    ]
    
    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    STATUS_CHOICES = [
        ('reported', 'Reported'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]

    user = models.ForeignKey(
        get_user_model(), 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Reported by"
    )
    issue_type = models.CharField(max_length=20, choices=ISSUE_TYPES)
    description = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS, default='medium')
    location_name = models.CharField(max_length=200)
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    created_at = models.DateTimeField(auto_now_add=True)
    #is_anonymous = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='reported')
    admin_response = models.TextField(blank=True, default="")
    upvotes = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.get_issue_type_display()} at {self.location_name} ({self.get_status_display()})"

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Feedback Report'
        verbose_name_plural = 'Feedback Reports'
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['latitude', 'longitude']),
        ]

    def clean(self):
        if not -90 <= float(self.latitude) <= 90:
            raise ValidationError("Latitude must be between -90 and 90.")
        if not -180 <= float(self.longitude) <= 180:
            raise ValidationError("Longitude must be between -180 and 180.")