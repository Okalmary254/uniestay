from django.db import models
from users.models import User
from properties.models import Property


class MaintenanceRequest(models.Model):
    PRIORITY_CHOICES = [('low', 'Low'), ('medium', 'Medium'), ('high', 'High')]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    CATEGORY_CHOICES = [
        ('plumbing', 'Plumbing'),
        ('electrical', 'Electrical'),
        ('furniture', 'Furniture'),
        ('appliances', 'Appliances'),
        ('doors_locks', 'Doors & locks'),
        ('walls_ceiling', 'Walls & ceiling'),
        ('pest_control', 'Pest control'),
        ('other', 'Other'),
    ]
    TIME_CHOICES = [
        ('morning', 'Morning (8am–12pm)'),
        ('afternoon', 'Afternoon (12pm–5pm)'),
        ('evening', 'Evening (5pm–8pm)'),
        ('any', 'Any time'),
    ]

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='maintenance_requests')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='maintenance_requests')
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    description = models.TextField()
    location_in_unit = models.CharField(max_length=100, blank=True)
    preferred_visit_time = models.CharField(max_length=20, choices=TIME_CHOICES, default='any')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    technician_note = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} ({self.priority} / {self.status})'
