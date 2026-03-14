from rest_framework import serializers
from .models import MaintenanceRequest


class MaintenanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    property_title = serializers.CharField(source='property.title', read_only=True)

    class Meta:
        model = MaintenanceRequest
        fields = [
            'id', 'property', 'property_title', 'student', 'student_name',
            'title', 'category', 'priority', 'description', 'location_in_unit',
            'preferred_visit_time', 'status', 'technician_note',
            'resolved_at', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'student', 'resolved_at', 'created_at', 'updated_at']
