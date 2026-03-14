from django.contrib import admin
from .models import Property, Amenity, PropertyImage


class AmenityInline(admin.TabularInline):
    model   = Amenity
    extra   = 1


class PropertyImageInline(admin.TabularInline):
    model   = PropertyImage
    extra   = 1
    readonly_fields = ['uploaded_at']


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display    = ['title', 'property_type', 'landlord', 'rent', 'city', 'status', 'created_at']
    list_filter     = ['status', 'property_type', 'city']
    search_fields   = ['title', 'address', 'city', 'nearest_university']
    readonly_fields = ['created_at', 'updated_at']
    inlines         = [AmenityInline, PropertyImageInline]
    ordering        = ['-created_at']
