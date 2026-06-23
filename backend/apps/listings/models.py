from django.db import models
from apps.users.models import HardUser


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class PhysicalCondition(models.Model):
    code = models.CharField(max_length=30, unique=True)
    label = models.CharField(max_length=120)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.label


class Listing(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pendiente"),
        ("APPROVED_BY_ML", "Aprobada por ML"),
        ("REJECTED_BY_ML", "Rechazada por ML"),
    ]
    RISK_CHOICES = [
        ("Bajo", "Bajo"),
        ("Medio", "Medio"),
        ("Alto", "Alto"),
    ]
    HARDWARE_TYPE_CHOICES = [
        ("gpu", "Tarjeta de video"),
        ("cpu", "Procesador"),
        ("ram", "Memoria RAM"),
        ("ssd", "SSD"),
        ("hdd", "HDD"),
        ("psu", "Fuente de poder"),
        ("motherboard", "Placa madre"),
        ("cooler", "Refrigeración"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="listings")
    condition = models.ForeignKey(PhysicalCondition, on_delete=models.PROTECT, related_name="listings")
    price = models.DecimalField(max_digits=12, decimal_places=2)
    images = models.JSONField(default=list, blank=True)
    seller = models.ForeignKey(HardUser, on_delete=models.CASCADE, related_name="listings")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    risk_level = models.CharField(max_length=10, choices=RISK_CHOICES, blank=True, null=True)
    ml_summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    hardware_type = models.CharField(max_length=30, choices=HARDWARE_TYPE_CHOICES)
    brand = models.CharField(max_length=120, blank=True)
    model = models.CharField(max_length=120, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"
