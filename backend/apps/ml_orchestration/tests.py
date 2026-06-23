from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.users.models import HardUser
from apps.listings.models import Category, PhysicalCondition, Listing
from apps.ml_orchestration.models import ListingRiskEvaluation
from rest_framework_simplejwt.tokens import RefreshToken


class MlOrchestrationEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = HardUser.objects.create_user(
            email="mltester@example.com",
            username="mltester",
            password="testpass123",
            reputation=3.5,
        )
        refresh = RefreshToken.for_user(self.user)
        token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        self.category = Category.objects.create(name="GPUs", slug="gpus")
        self.condition = PhysicalCondition.objects.create(code="used", label="Usado")

    def test_predict_risk_endpoint(self):
        url = reverse("ml_orchestration:predict-risk")
        payload = {
            "title": "RTX 3060",
            "description": "Tarjeta de video",
            "price": 200,
            "seller_reputation": 3.5,
            "images_count": 2,
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIn("risk_level", response.data)
        self.assertIn("ml_summary", response.data)

    def test_create_listing_triggers_ml_evaluation(self):
        url = reverse("listings:listing-list")
        payload = {
            "title": "RTX 4090",
            "description": "GPU de alta gama",
            "category": self.category.pk,
            "condition": self.condition.pk,
            "price": 1500,
            "seller": self.user.pk,
            "images": ["x.jpg"],
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 201)
        listing = Listing.objects.get(pk=response.data["id"])
        self.assertIn(listing.status, ["APPROVED_BY_ML", "REJECTED_BY_ML"])
        self.assertIsNotNone(listing.risk_level)
        self.assertTrue(ListingRiskEvaluation.objects.filter(listing=listing).exists())

    def test_listing_risk_detail(self):
        listing = Listing.objects.create(
            title="RTX 3060",
            description="GPU",
            category=self.category,
            condition=self.condition,
            price=250,
            seller=self.user,
            status="APPROVED_BY_ML",
            risk_level="Medio",
            ml_summary="Riesgo medio",
        )
        ListingRiskEvaluation.objects.create(
            listing=listing,
            risk_level="Medio",
            ml_summary="Riesgo medio",
        )
        url = reverse("ml_orchestration:listing-risk", args=[listing.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["risk_level"], "Medio")

    def test_evaluate_listing_endpoint_updates_status(self):
        listing = Listing.objects.create(
            title="CPU i9",
            description="Procesador",
            category=self.category,
            condition=self.condition,
            price=500,
            seller=self.user,
            status="PENDING",
        )
        url = reverse("ml_orchestration:listing-evaluate", args=[listing.pk])
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        listing.refresh_from_db()
        self.assertIn(listing.status, ["APPROVED_BY_ML", "REJECTED_BY_ML"])
        self.assertTrue(ListingRiskEvaluation.objects.filter(listing=listing).exists())
