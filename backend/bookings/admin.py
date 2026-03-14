from django.contrib import admin
from .models import Booking, Payment


class PaymentInline(admin.TabularInline):
    model          = Payment
    extra          = 0
    readonly_fields = ['created_at', 'confirmed_at']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display    = ['student', 'property', 'status', 'move_in_date', 'duration_months', 'created_at']
    list_filter     = ['status']
    search_fields   = ['student__username', 'student__email', 'property__title']
    readonly_fields = ['created_at', 'updated_at']
    inlines         = [PaymentInline]
    ordering        = ['-created_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display    = ['label', 'booking', 'amount', 'method', 'status', 'payment_date']
    list_filter     = ['status', 'method']
    readonly_fields = ['created_at', 'confirmed_at']
    ordering        = ['-payment_date']
