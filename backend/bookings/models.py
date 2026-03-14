from django.db import models
from users.models import User
from properties.models import Property


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='bookings')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    move_in_date = models.DateField()
    duration_months = models.PositiveSmallIntegerField(default=12)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    unit_number = models.CharField(max_length=20, blank=True)
    lease_end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.student} → {self.property} ({self.status})'


class Payment(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('confirmed', 'Confirmed'), ('failed', 'Failed')]
    METHOD_CHOICES = [('mpesa', 'M-Pesa'), ('bank', 'Bank transfer'), ('cash', 'Cash')]

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payments')
    label = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    reference = models.CharField(max_length=100, blank=True)
    payment_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    confirmed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-payment_date']

    def __str__(self):
        return f'{self.label} — KSh {self.amount} ({self.status})'
