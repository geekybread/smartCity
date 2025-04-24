from django.contrib import admin
from .models import FeedbackReport, FeedbackUpvote
from accounts.models import CustomUser
from alerts.twilio_utils import send_bulk_sms 

@admin.register(FeedbackReport)
class FeedbackReportAdmin(admin.ModelAdmin):
    list_display = (
        'issue_type',
        'severity',
        'status',
        'location_name',
        'created_at',
        'user',
        'admin_response',
        'approved',
    )
    list_filter = ('status', 'severity', 'issue_type','location_name', 'created_at', 'approved')
    list_editable = ['status', 'admin_response']

    search_fields = ('description', 'location_name', 'user__email','city')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'upvotes')
    actions = ['approve_and_broadcast_emergency', 'mark_resolved']

    # ✅ Group form fields for clarity:
    fieldsets = (
        ('Issue Details', {
            'fields': ('issue_type', 'description', 'severity')
        }),
        ('Location Information', {
            'fields': ('location_name', 'latitude', 'longitude')
        }),
        ('Status & Response', {
            'fields': ('status', 'admin_response')
        }),
        ('Meta', {
            'fields': ('user', 'created_at')
        }),
    )

    readonly_fields = ['created_at']

    def approve_and_broadcast_emergency(self, request, queryset):
        for report in queryset.filter(is_emergency=True, approved=False):
            # Send SMS to verified users
            msg = f"🚨 Emergency Alert: {report.description}"
            users = CustomUser.objects.filter(is_phone_verified=True)\
                .exclude(phone_number__isnull=True)\
                .exclude(phone_number='')
            numbers = list(users.values_list('phone_number', flat=True))
            send_bulk_sms(numbers, msg)

            report.approved = True
            report.save()

        self.message_user(request, f"Sent {queryset.count()} emergency alert(s) via SMS.")

    approve_and_broadcast_emergency.short_description = "✅ Approve & Send Emergency Alerts"


    def has_add_permission(self, request):
        return True  # optional: restrict add in admin

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser  # only superusers can delete
    

    def mark_resolved(self, request, queryset):
        updated = queryset.update(status='resolved')
        self.message_user(request, f"{updated} feedbacks marked as resolved.")

@admin.register(FeedbackUpvote)
class FeedbackUpvoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'feedback', 'created_at')
    search_fields = ('user__email', 'feedback__location_name')


