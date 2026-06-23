#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hardtrust_project.settings")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
django.setup()

from django.contrib.auth import get_user_model
from apps.listings.models import Category, PhysicalCondition, Listing

User = get_user_model()
seller = User.objects.filter(is_superuser=False).first() or User.objects.first()
condition = PhysicalCondition.objects.first()
if not condition:
    condition = PhysicalCondition.objects.create(code="used", label="Usado")

cpus = Category.objects.filter(slug="cpu").first()
gpus = Category.objects.filter(slug="gpu").first()
rams = Category.objects.filter(slug="ram").first()
psus = Category.objects.filter(slug="psu").first()

items = []
if cpus and seller and condition:
    items.append(Listing(
        title="Intel Core i5-10400F",
        description="Procesador usado en buen estado, incluye cooler stock.",
        price=95,
        seller=seller,
        category=cpus,
        condition=condition,
        hardware_type="cpu",
        brand="Intel",
        model="Core i5-10400F",
        images=["https://via.placeholder.com/800x600.png?text=i5-10400F"],
    ))
if gpus and seller and condition:
    items.append(Listing(
        title="RTX 3070 Ti",
        description="Tarjeta de video usada, VRAM: 8 GB.",
        price=320,
        seller=seller,
        category=gpus,
        condition=condition,
        hardware_type="gpu",
        brand="NVIDIA",
        model="RTX 3070 Ti",
        images=["https://via.placeholder.com/800x600.png?text=RTX+3070+Ti"],
    ))
if rams and seller and condition:
    items.append(Listing(
        title="Corsair Vengeance 16GB DDR4",
        description="Kit DDR4 16GB (2x8GB) 3200MHz.",
        price=38,
        seller=seller,
        category=rams,
        condition=condition,
        hardware_type="ram",
        brand="Corsair",
        model="Vengeance LPX",
        images=["https://via.placeholder.com/800x600.png?text=RAM"],
    ))

for obj in items:
    obj.save()
    print("listing created:", obj.title)
