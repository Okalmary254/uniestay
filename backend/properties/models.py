from django.db import models
from users.models import User


class Property(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('pending', 'Pending review'),
        ('occupied', 'Occupied'),
        ('inactive', 'Inactive'),
    ]
    TYPE_CHOICES = [
        ('single_room', 'Single room'),
        ('bedsitter', 'Bedsitter'),
        ('1br', '1 Bedroom'),
        ('2br', '2 Bedrooms'),
        ('3br', '3 Bedrooms'),
        ('shared', 'Shared house'),
    ]

    landlord = models.ForeignKey(User, on_delete=models.CASCADE, related_name='properties')
    title = models.CharField(max_length=200)
    property_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    # Pricing
    rent = models.DecimalField(max_digits=10, decimal_places=2)
    deposit = models.DecimalField(max_digits=10, decimal_places=2)

    # Location
    address = models.CharField(max_length=300)
    neighbourhood = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, default='Nairobi')
    nearest_university = models.CharField(max_length=200, blank=True)
    distance_to_campus = models.CharField(max_length=50, blank=True)
    google_maps_link = models.URLField(blank=True)

    # Details
    bedrooms = models.PositiveSmallIntegerField(default=1)
    bathrooms = models.PositiveSmallIntegerField(default=1)
    max_occupants = models.PositiveSmallIntegerField(default=1)
    available_from = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'properties'

    def __str__(self):
        return f'{self.title} — {self.city}'


class Amenity(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='amenities')
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='properties/')
    caption = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Image for {self.property.title}'
