from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator


class HardUser(AbstractUser):
    email = models.EmailField(unique=True)
    rut = models.CharField(
        max_length=20,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$',
                message='Ingresa un RUT válido (ej: 20.522.298-8).',
            )
        ],
    )
    phone = models.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r'^\+56\s?9\s?\d{4}\s?\d{4}$',
                message='Ingresa un teléfono válido (ej: +56 9 1234 5678).',
            )
        ],
    )
    first_name = models.CharField(max_length=150, blank=False, null=False)
    last_name = models.CharField(max_length=150, blank=False, null=False)
    reputation = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "first_name", "last_name", "rut", "phone"]
