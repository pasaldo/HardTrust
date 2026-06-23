from django.db import models
from apps.users.models import HardUser
from apps.listings.models import Listing


class ListingRiskEvaluation(models.Model):
    RISK_CHOICES = [
        ("Bajo", "Bajo"),
        ("Medio", "Medio"),
        ("Alto", "Alto"),
    ]
    listing = models.OneToOneField(Listing, on_delete=models.CASCADE, related_name="risk_evaluation")
    risk_level = models.CharField(max_length=20, choices=RISK_CHOICES)
    ml_summary = models.TextField()
    evaluated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-evaluated_at"]
