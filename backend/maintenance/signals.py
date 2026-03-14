from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import MaintenanceRequest


@receiver(post_save, sender=MaintenanceRequest)
def maintenance_status_changed(sender, instance, created, **kwargs):
    if created:
        print(
            f'[UniStay] Maintenance request: "{instance.title}" '
            f'({instance.priority} priority) from {instance.student.get_full_name()} '
            f'at {instance.property.title}'
        )
    elif instance.status == 'resolved':
        print(
            f'[UniStay] Maintenance resolved: "{instance.title}"'
        )
