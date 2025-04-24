from django.contrib import admin
from .models import FeedbackReport, FeedbackUpvote, FeedbackComment
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
    list_filter = ('status', 'severity', 'issue_type', 'location_name', 'created_at', 'approved')
    list_editable = ['status', 'admin_response']
    search_fields = ('description', 'location_name', 'user__email', 'city')
    ordering = ('-created_at',)
    readonly_fields = ['created_at', 'upvotes']
    actions = ['approve_and_broadcast_emergency', 'mark_resolved']

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

    def save_model(self, request, obj, form, change):
        is_new_response = False
        response_text = form.cleaned_data.get('admin_response', '').strip() if 'admin_response' in form.cleaned_data else ''

        # Check if admin_response is newly added or changed
        if 'admin_response' in form.changed_data and response_text:
            is_new_response = True

        super().save_model(request, obj, form, change)

        if is_new_response:
            # Prevent duplicate comment if already exists
            exists = FeedbackComment.objects.filter(
                report=obj,
                text=response_text,
                is_official=True,
                user=request.user
            ).exists()

            if not exists:
                FeedbackComment.objects.create(
                    report=obj,
                    user=request.user,
                    text=response_text,
                    is_official=True
                )

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for obj in instances:
            if not obj.user:
                obj.user = request.user
            if request.user.is_staff:
                obj.is_official = True
            obj.save()
        formset.save_m2m()

    def approve_and_broadcast_emergency(self, request, queryset):
        for report in queryset.filter(is_emergency=True, approved=False):
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
        return True

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser

    def mark_resolved(self, request, queryset):
        updated = queryset.update(status='resolved')
        self.message_user(request, f"{updated} feedbacks marked as resolved.")


@admin.register(FeedbackUpvote)
class FeedbackUpvoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'feedback', 'created_at')
    search_fields = ('user__email', 'feedback__location_name')


@admin.register(FeedbackComment)
class FeedbackCommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'report', 'is_official', 'created_at')
    list_filter = ('is_official', 'created_at')
    readonly_fields = ('created_at',)

    fieldsets = (
        (None, {
            'fields': ('report', 'user', 'text', 'is_official')
        }),
        ('Meta', {
            'fields': ('created_at',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not obj.user:
            obj.user = request.user
        if request.user.is_staff:
            obj.is_official = True
        if not obj.report:
            raise ValueError("Missing report: admin comment will not save without report.")
        obj.save()
