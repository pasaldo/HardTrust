import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hardtrust_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.listings.models import Listing
from decimal import Decimal

HardUser = get_user_model()

USERS = [
    {
        'username': 'vendedor_demo',
        'email': 'vendedor@test.cl',
        'password': 'Test123456',
        'first_name': 'Carlos',
        'last_name': 'Mendoza',
        'rut': '12.345.678-5',
        'phone': '+56 9 8765 4321',
    },
    {
        'username': 'comprador_demo',
        'email': 'comprador@test.cl',
        'password': 'Test123456',
        'first_name': 'Ana',
        'last_name': 'Rojas',
        'rut': '23.456.789-2',
        'phone': '+56 9 1234 5678',
    },
]

created = []
for data in USERS:
    user, created_flag = HardUser.objects.get_or_create(
        email=data['email'],
        defaults={
            'username': data['username'],
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'rut': data['rut'],
            'phone': data['phone'],
            'reputation': 0.0,
            'is_active': True,
        },
    )
    if created_flag:
        user.set_password(data['password'])
        user.save()
        created.append(data['email'])

print(f'Creados: {created if created else "ninguno (ya existían)"}')
