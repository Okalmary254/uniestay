from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active']
    list_filter   = ['role', 'is_active', 'is_staff']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering      = ['-date_joined']
    fieldsets     = BaseUserAdmin.fieldsets + (
        ('UniStay profile', {
            'fields': (
                'role', 'phone', 'whatsapp',
                'university', 'student_id', 'course', 'year_of_study',
                'emergency_name', 'emergency_phone', 'emergency_relation',
                'national_id', 'bank_name', 'bank_account', 'mpesa_number', 'preferred_contact',
            )
        }),
    )
