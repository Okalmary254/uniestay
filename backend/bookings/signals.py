"""
bookings/signals.py

Signals fire on key state changes so the system can extend
notifications (email, SMS, push) without touching view logic.
Currently prints to console in dev; wire up django-anymail or
Africa's Talking for real delivery.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Booking, Payment


@receiver(post_save, sender=Booking)
def booking_status_changed(sender, instance, created, **kwargs):
    if created:
        print(
            f'[UniStay] New booking request: {instance.student.get_full_name()} '
            f'→ {instance.property.title}'
        )
    else:
        if instance.status == 'accepted':
            print(
                f'[UniStay] Booking accepted: {instance.student.get_full_name()} '
                f'moves in {instance.move_in_date}'
            )
        elif instance.status == 'declined':
            print(
                f'[UniStay] Booking declined: {instance.student.get_full_name()} '
                f'for {instance.property.title}'
            )


@receiver(post_save, sender=Payment)
def payment_status_changed(sender, instance, created, **kwargs):
    if created:
        print(
            f'[UniStay] Payment recorded: KSh {instance.amount} by '
            f'{instance.booking.student.get_full_name()} — {instance.label}'
        )
    elif instance.status == 'confirmed':
        print(
            f'[UniStay] Payment confirmed: KSh {instance.amount} — {instance.label}'
        )
