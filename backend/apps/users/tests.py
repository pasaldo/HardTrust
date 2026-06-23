from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.users.models import HardUser
from rest_framework_simplejwt.tokens import RefreshToken


class AuthEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_returns_tokens(self):
        url = reverse("users:register")
        payload = {
            "email": "new@example.com",
            "username": "newuser",
            "password": "newpass123",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_returns_tokens(self):
        HardUser.objects.create_user(
            email="auth@example.com", username="authuser", password="authpass123"
        )
        url = reverse("users:login")
        payload = {"email": "auth@example.com", "password": "authpass123"}
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)

    def test_profile_requires_auth(self):
        url = reverse("users:profile")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 401)

    def test_profile_returns_user(self):
        user = HardUser.objects.create_user(
            email="profile@example.com", username="prof", password="prof123"
        )
        refresh = RefreshToken.for_user(user)
        token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        url = reverse("users:profile")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], user.email)
