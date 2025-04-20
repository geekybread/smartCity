from django.db import models

class AccidentZone(models.Model):
    city       = models.CharField(max_length=100)
    name       = models.CharField(max_length=200)
    # store an array of [ [lat, lng], … ] pairs
    polygon    = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.city})"
