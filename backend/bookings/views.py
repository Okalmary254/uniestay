from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from .models import Booking, Payment
from .serializers import BookingSerializer, PaymentSerializer


class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'landlord':
            return Booking.objects.filter(property__landlord=user).select_related('student', 'property')
        return Booking.objects.filter(student=user).select_related('student', 'property')

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class BookingDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = BookingSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'landlord':
            return Booking.objects.filter(property__landlord=user)
        return Booking.objects.filter(student=user)

    def perform_update(self, serializer):
        instance = serializer.save()
        # When landlord accepts, set property to occupied and calculate lease end
        if instance.status == 'accepted' and not instance.lease_end_date:
            from dateutil.relativedelta import relativedelta
            end = instance.move_in_date + relativedelta(months=instance.duration_months)
            instance.lease_end_date = end
            instance.save()
            instance.property.status = 'occupied'
            instance.property.save()


class PaymentListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'landlord':
            return Payment.objects.filter(booking__property__landlord=user)
        return Payment.objects.filter(booking__student=user)

    def perform_create(self, serializer):
        serializer.save()


class ConfirmPaymentView(APIView):
    def post(self, request, pk):
        payment = generics.get_object_or_404(
            Payment, pk=pk, booking__property__landlord=request.user
        )
        payment.status = 'confirmed'
        payment.confirmed_at = timezone.now()
        payment.save()
        return Response(PaymentSerializer(payment).data)
