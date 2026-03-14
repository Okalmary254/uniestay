from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [('student', 'Student'), ('landlord', 'Landlord')]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=20, blank=True)
    whatsapp = models.CharField(max_length=20, blank=True)

    # Student-specific
    university = models.CharField(max_length=200, blank=True)
    student_id = models.CharField(max_length=50, blank=True)
    course = models.CharField(max_length=200, blank=True)
    year_of_study = models.CharField(max_length=20, blank=True)

    # Emergency contact
    emergency_name = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)
    emergency_relation = models.CharField(max_length=50, blank=True)

    # Landlord-specific
    national_id = models.CharField(max_length=20, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    bank_account = models.CharField(max_length=50, blank=True)
    mpesa_number = models.CharField(max_length=20, blank=True)
    preferred_contact = models.CharField(max_length=20, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.get_full_name()} ({self.role})'
