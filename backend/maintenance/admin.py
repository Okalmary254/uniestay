from django.contrib import admin
from .models import MaintenanceRequest


@admin.register(MaintenanceRequest)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display    = ['title', 'property', 'student', 'category', 'priority', 'status', 'created_at']
    list_filter     = ['status', 'priority', 'category']
    search_fields   = ['title', 'student__username', 'property__title']
    readonly_fields = ['created_at', 'updated_at', 'resolved_at']
    ordering        = ['-created_at']
