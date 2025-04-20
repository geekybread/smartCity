# backend/alerts/admin.py

from django.contrib import admin
from .models import EmergencyAlert, SeenAlert

@admin.register(EmergencyAlert)
class EmergencyAlertAdmin(admin.ModelAdmin):
    list_display  = ('city', 'title', 'level', 'expiry_time', 'created_at')
    list_filter   = ('city', 'level')
    search_fields = ('city', 'title', 'message')
    list_editable = ('expiry_time', 'level')  # ✅ allow inline change of level
    ordering      = ('-created_at',)

@admin.register(SeenAlert)
class SeenAlertAdmin(admin.ModelAdmin):
    list_display  = ('user', 'alert', 'seen_at')
    raw_id_fields = ('user', 'alert')
