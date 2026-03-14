from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import MaintenanceRequest
from .serializers import MaintenanceSerializer


class MaintenanceListCreateView(generics.ListCreateAPIView):
    serializer_class = MaintenanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'landlord':
            return MaintenanceRequest.objects.filter(
                property__landlord=user
            ).select_related('student', 'property')
        return MaintenanceRequest.objects.filter(
            student=user
        ).select_related('student', 'property')

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class MaintenanceDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = MaintenanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'landlord':
            return MaintenanceRequest.objects.filter(property__landlord=user)
        return MaintenanceRequest.objects.filter(student=user)

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.status == 'resolved' and not instance.resolved_at:
            instance.resolved_at = timezone.now()
            instance.save()
