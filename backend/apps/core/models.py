from django.db import models


class AuditLog(models.Model):
    actor = models.ForeignKey("users.HardUser", on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_logs")
    action = models.CharField(max_length=120)
    target_model = models.CharField(max_length=120)
    target_id = models.PositiveIntegerField(null=True, blank=True)
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["created_at"])]

    def __str__(self):
        return f"{self.action} {self.target_model} #{self.target_id}"
