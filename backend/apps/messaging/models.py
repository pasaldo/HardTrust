from django.db import models
from apps.users.models import HardUser


class Conversation(models.Model):
    participants = models.ManyToManyField(HardUser, related_name="conversations")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Conversation({self.pk})"


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(HardUser, on_delete=models.CASCADE, related_name="sent_messages")
    body = models.TextField(max_length=5000)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Message({self.pk}) from {self.sender_id}"
