from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.conf import settings

ISSUE_TYPES = [
    ('emergency', 'Emergency'),
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

class FeedbackReport(models.Model):
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Reported by",
        related_name='feedback_reports'
    )

    issue_type = models.CharField(max_length=20, choices=ISSUE_TYPES)
    description = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS, default='medium')
    location_name = models.CharField(max_length=200)
    city = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='reported')
    admin_response = models.TextField(blank=True, default="")
    upvotes = models.PositiveIntegerField(default=0)
    is_emergency = models.BooleanField(default=False) 
    approved = models.BooleanField(default=False)  

    def __str__(self):
        return f"{self.get_issue_type_display()} at {self.location_name} ({self.get_status_display()})"

    def clean(self):
    # Validate coordinates only if they are provided
        if self.latitude is not None:
            if not -90 <= float(self.latitude) <= 90:
                raise ValidationError({'latitude': 'Latitude must be between -90 and 90 degrees.'})
        
        if self.longitude is not None:
            if not -180 <= float(self.longitude) <= 180:
                raise ValidationError({'longitude': 'Longitude must be between -180 and 180 degrees.'})


    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Feedback Report'
        verbose_name_plural = 'Feedback Reports'
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['latitude', 'longitude']),
        ]



class FeedbackUpvote(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    feedback = models.ForeignKey('FeedbackReport', on_delete=models.CASCADE, related_name='upvotes_set')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'feedback')
        verbose_name = 'Feedback Upvote'
        verbose_name_plural = 'Feedback Upvotes'

    def __str__(self):
        return f"{self.user} upvoted {self.feedback}"
    
    
class FeedbackComment(models.Model):
    report = models.ForeignKey(FeedbackReport, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    text = models.TextField()
    is_official = models.BooleanField(default=False)  # ✅ True = admin response
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment on {self.report.id} by {self.user}"
