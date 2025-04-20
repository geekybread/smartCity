# backend/alerts/serializers.py

from rest_framework import serializers
from .models import EmergencyAlert, SeenAlert  # ensure SeenAlert is imported

class EmergencyAlertSerializer(serializers.ModelSerializer):
    is_seen = serializers.SerializerMethodField()

    class Meta:
        model = EmergencyAlert
        fields = [
            'id',
            'title',
            'message',
            'city',
            'level',
            'created_at',
            'expiry_time',
            'is_seen',
        ]

    def get_is_seen(self, obj):
        request = self.context.get('request', None)
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            # return True if a SeenAlert record exists
            return SeenAlert.objects.filter(user=user, alert=obj).exists()
        return False
