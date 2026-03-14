"""
python manage.py seed_demo

Creates two demo accounts and sample properties/bookings/maintenance
so you can explore the app immediately after setup.

  Student  → username: student1   password: demo1234
  Landlord → username: landlord1  password: demo1234
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta


class Command(BaseCommand):
    help = 'Seed the database with demo data'

    def handle(self, *args, **options):
        from users.models import User
        from properties.models import Property, Amenity
        from bookings.models import Booking, Payment
        from maintenance.models import MaintenanceRequest

        self.stdout.write('Seeding demo data…')

        # ── Users ──────────────────────────────────────────────────────────────
        landlord, _ = User.objects.get_or_create(
            username='landlord1',
            defaults=dict(
                email='landlord@demo.com',
                first_name='James', last_name='Mwangi',
                role='landlord',
                phone='+254 722 123 456',
                whatsapp='+254 722 123 456',
                preferred_contact='whatsapp',
                mpesa_number='+254 722 123 456',
            )
        )
        landlord.set_password('demo1234')
        landlord.save()

        student, _ = User.objects.get_or_create(
            username='student1',
            defaults=dict(
                email='student@demo.com',
                first_name='Amina', last_name='Kariuki',
                role='student',
                phone='+254 712 456 789',
                university='University of Nairobi',
                student_id='UON/BS/2023/045',
                course='BSc Computer Science',
                year_of_study='Year 3',
                emergency_name='Grace Kariuki',
                emergency_phone='+254 700 111 222',
                emergency_relation='Mother',
            )
        )
        student.set_password('demo1234')
        student.save()

        # ── Properties ─────────────────────────────────────────────────────────
        props_data = [
            dict(
                title='Modern bedsitter — Parklands',
                property_type='bedsitter',
                description='Bright, airy bedsitter a 10-minute walk from the University of Nairobi. Ensuite bathroom and fitted kitchenette.',
                rent=13500, deposit=13500,
                address='14 Harry Thuku Rd', neighbourhood='Parklands', city='Nairobi',
                nearest_university='University of Nairobi', distance_to_campus='10 min walk',
                bedrooms=1, bathrooms=1, max_occupants=1, status='active',
                available_from=date.today(),
                amenities=['WiFi', 'Water 24/7', 'Security guard', 'CCTV'],
            ),
            dict(
                title='1 Bedroom apartment — Rongai',
                property_type='1br',
                description='Spacious one-bedroom apartment with separate living area near Strathmore.',
                rent=18000, deposit=18000,
                address='Rongai Malls Rd', neighbourhood='Rongai', city='Nairobi',
                nearest_university='Strathmore University', distance_to_campus='15 min matatu',
                bedrooms=2, bathrooms=1, max_occupants=2, status='active',
                available_from=date.today() + timedelta(days=14),
                amenities=['WiFi', 'Water 24/7', 'Electricity', 'Parking', 'Security guard'],
            ),
            dict(
                title='Budget single room — Githurai',
                property_type='single_room',
                description='Affordable single room perfect for first-year students. Bus stop right outside.',
                rent=8500, deposit=8500,
                address='Githurai 44', neighbourhood='Githurai', city='Nairobi',
                nearest_university='JKUAT', distance_to_campus='20 min matatu',
                bedrooms=1, bathrooms=0, max_occupants=1, status='active',
                available_from=date.today(),
                amenities=['Water 24/7', 'Security guard'],
            ),
            dict(
                title='Executive bedsitter — Kilimani',
                property_type='bedsitter',
                description='Premium bedsitter in Kilimani with rooftop gym access. Ideal for postgrads.',
                rent=21000, deposit=21000,
                address='Rose Ave', neighbourhood='Kilimani', city='Nairobi',
                nearest_university='University of Nairobi', distance_to_campus='12 min matatu',
                bedrooms=1, bathrooms=1, max_occupants=1, status='active',
                available_from=date.today(),
                amenities=['WiFi', 'Water 24/7', 'Electricity', 'Gym', 'Parking', 'Security guard', 'CCTV'],
            ),
        ]

        created_props = []
        for pd in props_data:
            amenity_names = pd.pop('amenities')
            prop, created = Property.objects.get_or_create(
                title=pd['title'], landlord=landlord, defaults=pd
            )
            if created:
                for name in amenity_names:
                    Amenity.objects.create(property=prop, name=name)
                self.stdout.write(f'  Created property: {prop.title}')
            created_props.append(prop)

        # ── Booking (student1 → first property) ────────────────────────────────
        main_prop = created_props[0]
        booking, created = Booking.objects.get_or_create(
            student=student, property=main_prop,
            defaults=dict(
                move_in_date=date(2026, 1, 15),
                duration_months=12,
                message='I am a 3rd year student at UoN looking for stable accommodation.',
                status='accepted',
                unit_number='Unit 4B',
                lease_end_date=date(2027, 1, 14),
            )
        )
        if created:
            main_prop.status = 'occupied'
            main_prop.save()
            self.stdout.write(f'  Created booking: {booking}')

            # Payments
            payments_data = [
                dict(label='Security deposit', amount=13500, method='bank', reference='DEP-0115', payment_date=date(2026, 1, 14), status='confirmed'),
                dict(label='January 2026 rent', amount=13500, method='mpesa', reference='QHJ4X9TK2M', payment_date=date(2026, 1, 15), status='confirmed'),
                dict(label='February 2026 rent', amount=13500, method='mpesa', reference='RPK3W8MN4X', payment_date=date(2026, 2, 1), status='confirmed'),
                dict(label='March 2026 rent', amount=13500, method='mpesa', reference='TUV7Q2LP9Z', payment_date=date(2026, 3, 1), status='confirmed'),
            ]
            for pd in payments_data:
                p, _ = Payment.objects.get_or_create(booking=booking, label=pd['label'], defaults=pd)
                if _:
                    p.confirmed_at = timezone.now()
                    p.save()

        # ── Maintenance requests ───────────────────────────────────────────────
        maint_data = [
            dict(
                title='Broken window latch — bedroom', category='doors_locks', priority='high',
                description='Bedroom window latch broke — cannot lock properly. Security concern.',
                location_in_unit='Bedroom', preferred_visit_time='morning',
                status='in_progress', technician_note='Technician assigned. Expected visit: Mar 16, 2026',
            ),
            dict(
                title='Leaking kitchen tap', category='plumbing', priority='medium',
                description='Kitchen cold tap drips constantly. Wasting water.',
                location_in_unit='Kitchen', preferred_visit_time='afternoon',
                status='pending', technician_note='',
            ),
            dict(
                title='Flickering bathroom light', category='electrical', priority='low',
                description='Bathroom light flickers when switched on.',
                location_in_unit='Bathroom', preferred_visit_time='any',
                status='resolved', technician_note='Bulb replaced. Fixed Feb 23, 2026',
            ),
        ]
        for md in maint_data:
            req, created = MaintenanceRequest.objects.get_or_create(
                title=md['title'], student=student,
                defaults=dict(property=main_prop, **md)
            )
            if created:
                self.stdout.write(f'  Created maintenance: {req.title}')

        # ── Pending booking requests (other students) ──────────────────────────
        other_students = [
            dict(username='student2', first_name='Tom',   last_name='Otieno',   university='Strathmore University'),
            dict(username='student3', first_name='Faith', last_name='Njeri',    university='JKUAT'),
            dict(username='student4', first_name='Brian', last_name='Odhiambo', university='KCA University'),
        ]
        for sd in other_students:
            u, _ = User.objects.get_or_create(
                username=sd['username'],
                defaults=dict(role='student', email=f"{sd['username']}@demo.com", **{k: v for k, v in sd.items() if k != 'username'})
            )
            if _:
                u.set_password('demo1234')
                u.save()
            Booking.objects.get_or_create(
                student=u, property=created_props[1],
                defaults=dict(
                    move_in_date=date(2026, 4, 1),
                    duration_months=6,
                    message=f'Hello, I am {sd["first_name"]} from {sd["university"]}.',
                    status='pending',
                )
            )

        self.stdout.write(self.style.SUCCESS('\nDemo data seeded successfully!'))
        self.stdout.write('\n  Student  → username: student1   password: demo1234')
        self.stdout.write('  Landlord → username: landlord1  password: demo1234')
        self.stdout.write('\n  Extra students: student2, student3, student4 (password: demo1234)\n')
