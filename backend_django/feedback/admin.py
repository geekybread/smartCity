from django.contrib import admin
from .models import FeedbackReport, FeedbackUpvote

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
    )
    list_filter = ('status', 'severity', 'issue_type','location_name', 'created_at')
    list_editable = ['status', 'admin_response']

    search_fields = ('description', 'location_name', 'user__email','city')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'upvotes')

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

    def has_add_permission(self, request):
        return True  # optional: restrict add in admin

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser  # only superusers can delete
    
    actions = ['mark_resolved']

    def mark_resolved(self, request, queryset):
        updated = queryset.update(status='resolved')
        self.message_user(request, f"{updated} feedbacks marked as resolved.")

@admin.register(FeedbackUpvote)
class FeedbackUpvoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'feedback', 'created_at')
    search_fields = ('user__email', 'feedback__location_name')


