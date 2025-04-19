from django.contrib import admin
from .models import FeedbackReport, FeedbackUpvote

@admin.register(FeedbackReport)
class FeedbackReportAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'issue_type',
        'severity',
        'status',
        'location_name',
        'created_at',
        'user',
        'upvotes',
    )
    list_filter = ('status', 'severity', 'issue_type', 'created_at')
    search_fields = ('description', 'location_name', 'user__email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'upvotes')

    fieldsets = (
        (None, {
            'fields': ('issue_type', 'severity', 'description', 'status', 'admin_response')
        }),
        ('Location', {
            'fields': ('location_name', 'latitude', 'longitude'),
        }),
        ('Meta', {
            'fields': ('user', 'created_at', 'upvotes'),
        }),
    )

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


