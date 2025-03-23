# dashboard/models.py
from django.db import models

class Feedback(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    issue_type = models.CharField(max_length=50)
    description = models.TextField()
    location = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.issue_type} - {self.location}"