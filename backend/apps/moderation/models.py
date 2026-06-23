from django.db import models
from apps.users.models import HardUser
from apps.listings.models import Listing


class Report(models.Model):
    TARGET_TYPE = [
        ("listing", "Publicación"),
        ("user", "Usuario"),
    ]
    STATUS_CHOICES = [
        ("open", "Abierto"),
        ("resolved", "Resuelto"),
        ("dismissed", "Descartado"),
    ]
    reporter = models.ForeignKey(HardUser, on_delete=models.CASCADE, related_name="reports_sent")
    target_type = models.CharField(max_length=20, choices=TARGET_TYPE)
    target = models.PositiveIntegerField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    resolved_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Reporte #{self.id} ({self.get_target_type_display()}) {self.get_status_display()}"
