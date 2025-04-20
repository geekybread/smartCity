# yourapp/admin.py

from django.contrib import admin
from django import forms
from .models import AccidentZone
from .forms import GoogleDrawingWidget

class AccidentZoneAdminForm(forms.ModelForm):
    class Meta:
        model = AccidentZone
        fields = ('city', 'name', 'polygon')
        widgets = {
            'polygon': GoogleDrawingWidget(),
        }

@admin.register(AccidentZone)
class AccidentZoneAdmin(admin.ModelAdmin):
    form = AccidentZoneAdminForm
    list_display  = ('name', 'city', 'created_at')
    search_fields = ('name', 'city')

    def has_module_permission(self, request):       return request.user.is_superuser
    def has_view_permission(self, request, obj=None):   return request.user.is_superuser
    def has_add_permission(self, request):          return request.user.is_superuser
    def has_change_permission(self, request, obj=None): return request.user.is_superuser
    def has_delete_permission(self, request, obj=None): return request.user.is_superuser
