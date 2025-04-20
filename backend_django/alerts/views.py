# backend/alerts/views.py

from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import EmergencyAlert, SeenAlert
from .serializers import EmergencyAlertSerializer

class EmergencyAlertViewSet(viewsets.ModelViewSet):
    queryset = EmergencyAlert.objects.all()
    serializer_class = EmergencyAlertSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        city = self.request.query_params.get('city', '').strip()
        now = timezone.now()
        qs = EmergencyAlert.objects.filter(expiry_time__gt=now)
        if city:
            qs = qs.filter(city__iexact=city)
        return qs

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_seen(self, request, pk=None):
        alert = self.get_object()
        seen, created = SeenAlert.objects.get_or_create(user=request.user, alert=alert)
        return Response({'status': 'marked' if created else 'already_marked'})
