# backend/accidentzones/views.py

from rest_framework import viewsets, permissions
from .models import AccidentZone
from .serializers import AccidentZoneSerializer

class AccidentZoneViewSet(viewsets.ModelViewSet):
    serializer_class = AccidentZoneSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        Return only the zones for the 'city' query parameter (case‐insensitive match).
        If no city is provided, return an empty queryset.
        """
        city = self.request.query_params.get('city', '').strip()
        if city:
            return AccidentZone.objects.filter(city__iexact=city)
        return AccidentZone.objects.none()
    
    def get_permissions(self):
        # Allow GET for anyone; only admins may create/update/delete
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
