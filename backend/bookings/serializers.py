from rest_framework import serializers
from .models import Booking, Payment
from users.serializers import UserSerializer
from properties.serializers import PropertyListSerializer


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'booking', 'label', 'amount', 'method', 'reference',
                  'payment_date', 'status', 'confirmed_at', 'created_at']
        read_only_fields = ['id', 'confirmed_at', 'created_at']


class BookingSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    property_detail = PropertyListSerializer(source='property', read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'property', 'property_detail', 'student', 'move_in_date',
                  'duration_months', 'message', 'status', 'unit_number',
                  'lease_end_date', 'payments', 'created_at', 'updated_at']
        read_only_fields = ['id', 'student', 'created_at', 'updated_at']
