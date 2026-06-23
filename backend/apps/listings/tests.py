from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.users.models import HardUser
from apps.listings.models import Category, PhysicalCondition
from rest_framework_simplejwt.tokens import RefreshToken


class ListingEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = HardUser.objects.create_user(
            email="list@example.com",
            username="listuser",
            password="listpass123",
            reputation=4.0,
        )
        self.category = Category.objects.create(name="GPUs", slug="gpus")
        self.condition = PhysicalCondition.objects.create(code="used", label="Usado")

    def test_list_listings_allows_read(self):
        url = reverse("listings:listing-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_create_listing_requires_auth(self):
        url = reverse("listings:listing-list")
        payload = {
            "title": "GPU Test",
            "description": "Test",
            "category": self.category.pk,
            "condition": self.condition.pk,
            "price": 100,
            "seller": self.user.pk,
            "images": [],
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 401)

    def test_create_listing_with_auth(self):
        refresh = RefreshToken.for_user(self.user)
        token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        url = reverse("listings:listing-list")
        payload = {
            "title": "GPU Auth",
            "description": "Auth test",
            "category": self.category.pk,
            "condition": self.condition.pk,
            "price": 100,
            "seller": self.user.pk,
            "images": [],
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 201)
