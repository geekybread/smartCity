from rest_framework import viewsets
from .models import EmergencyAlert
from .serializers import EmergencyAlertSerializer

class EmergencyAlertViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EmergencyAlert.objects.all().order_by('-created_at')
    serializer_class = EmergencyAlertSerializer

    def get_queryset(self):
        queryset = EmergencyAlert.objects.all().order_by('-created_at')
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__iexact=city.strip())
        return queryset

