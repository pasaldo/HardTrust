from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.users.models import HardUser
from rest_framework_simplejwt.tokens import RefreshToken


class MessagingEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = HardUser.objects.create_user(
            email="msg@example.com",
            username="msguser",
            password="msgpass123",
        )
        refresh = RefreshToken.for_user(self.user)
        token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_conversation_list_allows_read(self):
        url = reverse("messaging:conversation-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_message_list_allows_read(self):
        url = reverse("messaging:message-list", args=[1])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
