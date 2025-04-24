# backend/alerts/admin.py

from django.contrib import admin
from .models import EmergencyAlert, SeenAlert
from accounts.models import CustomUser
from .twilio_utils import send_bulk_sms

@admin.register(EmergencyAlert)
class EmergencyAlertAdmin(admin.ModelAdmin):
    list_display  = ('city', 'title', 'level', 'expiry_time', 'created_at')
    list_filter   = ('city', 'level')
    search_fields = ('city', 'title', 'message')
    list_editable = ('expiry_time', 'level')
    ordering      = ('-created_at',)
    actions       = ['send_sms_to_verified_users', 'approve_and_send_sms']

    def send_sms_to_verified_users(self, request, queryset):
        for alert in queryset:
            msg = f"[{alert.level.upper()}] {alert.title}\n{alert.message}"

            # ✅ Full queryset — NO `.values()` here!
            users = CustomUser.objects.filter(is_phone_verified=True)\
                .exclude(phone_number__isnull=True)\
                .exclude(phone_number='')

            #print("🧠 Matched users:", list(users.values('email', 'phone_number', 'is_phone_verified')))

            # ✅ This now works because `users` is still a queryset, not a list
            numbers = list(users.values_list('phone_number', flat=True))
            #print("📨 Sending to numbers:", numbers)

            send_bulk_sms(numbers, msg)

        self.message_user(request, f"SMS sent for {queryset.count()} alert(s).")
    


    send_sms_to_verified_users.short_description = "📲 Send SMS to verified users"


@admin.register(SeenAlert)
class SeenAlertAdmin(admin.ModelAdmin):
    list_display  = ('user', 'alert', 'seen_at')
    raw_id_fields = ('user', 'alert')
