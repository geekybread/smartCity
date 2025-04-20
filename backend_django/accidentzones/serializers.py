# yourapp/serializers.py
from rest_framework import serializers
from .models import AccidentZone

class AccidentZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccidentZone
        fields = ('id', 'city', 'name', 'polygon')
