from django.db import models
from apps.users.models import HardUser
from apps.listings.models import Listing


class Review(models.Model):
    reviewer = models.ForeignKey(
        HardUser, on_delete=models.CASCADE, related_name="written_reviews"
    )
    reviewee = models.ForeignKey(
        HardUser, on_delete=models.CASCADE, related_name="received_reviews"
    )
    listing = models.ForeignKey(
        Listing, on_delete=models.CASCADE, related_name="reviews"
    )
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["reviewee", "-created_at"])]
        unique_together = [("reviewer", "listing")]

    def __str__(self):
        return f"Review({self.pk}) {self.reviewer_id} -> {self.reviewee_id}"
