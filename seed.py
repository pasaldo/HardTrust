#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hardtrust_project.settings")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
django.setup()

from django.contrib.auth import get_user_model
from apps.listings.models import Category

User = get_user_model()

if not User.objects.filter(email="admin@example.com").exists():
    User.objects.create_superuser(
        email="admin@example.com",
        username="admin",
        password="Admin123!",
        first_name="Admin",
        last_name="HardTrust",
        rut="11.111.111-1",
        phone="+56 9 1111 1111",
    )
    print("Superuser created: admin@example.com / Admin123!")
else:
    print("Superuser already exists")

defaults = [
    ("cpu", "Procesadores"),
    ("gpu", "Tarjetas de video"),
    ("ram", "Memoria RAM"),
    ("ssd", "SSD"),
    ("hdd", "HDD"),
    ("psu", "Fuentes de poder"),
]

for slug, name in defaults:
    _, created = Category.objects.get_or_create(slug=slug, defaults={"name": name, "description": name})
    print(f"Category {name} {'created' if created else 'exists'}")
