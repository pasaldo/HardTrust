from rest_framework import generics, filters
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404
from pathlib import Path
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError
from apps.listings.models import Category, PhysicalCondition, Listing, SavedListing
from apps.listings.serializers import CategorySerializer, CategoryCreateSerializer, PhysicalConditionSerializer, ListingSerializer, SavedListingSerializer
from apps.ml_orchestration.services import evaluate_listing
from apps.ml_orchestration.models import ListingRiskEvaluation


class BrandList(generics.ListAPIView):
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        brands = Listing.objects.values_list("brand", flat=True).distinct().order_by("brand")
        return Response(sorted([b for b in brands if b]))


class CategoryListCreate(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CategoryCreateSerializer
        return CategorySerializer


class PhysicalConditionListCreate(generics.ListCreateAPIView):
    queryset = PhysicalCondition.objects.all()
    serializer_class = PhysicalConditionSerializer
    permission_classes = [AllowAny]


class ListingListCreate(generics.ListAPIView):
    serializer_class = ListingSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "brand", "model", "hardware_type"]
    ordering_fields = ["created_at", "price"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Listing.objects.select_related("seller", "category", "condition").all()
        params = self.request.query_params

        category = params.get("category")
        if category:
            queryset = queryset.filter(category__id=category)

        condition = params.get("condition")
        if condition:
            queryset = queryset.filter(condition__id=condition)

        hardware_type = params.get("hardware_type")
        if hardware_type:
            queryset = queryset.filter(hardware_type=hardware_type)

        brand = params.get("brand")
        if brand:
            queryset = queryset.filter(brand__icontains=brand)

        model = params.get("model")
        if model:
            queryset = queryset.filter(model__icontains=model)

        min_price = params.get("min_price")
        max_price = params.get("max_price")
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        vram = params.get("vram")
        if vram:
            queryset = queryset.filter(description__icontains=f"VRAM: {vram} GB")

        # Filtros especializados por tipo de hardware (basados en description)
        socket = params.get("socket")
        if socket:
            queryset = queryset.filter(description__icontains=f"Socket: {socket}")

        ram_type = params.get("ram_type")
        if ram_type:
            queryset = queryset.filter(description__icontains=f"Tipo: {ram_type}")

        ram_ddr = params.get("ram_ddr")
        if ram_ddr:
            queryset = queryset.filter(description__icontains=ram_ddr)

        ram_capacity = params.get("ram_capacity")
        if ram_capacity:
            queryset = queryset.filter(description__icontains=f"{ram_capacity} GB")

        gpu_brand = params.get("gpu_brand")
        if gpu_brand:
            queryset = queryset.filter(brand__icontains=gpu_brand)

        gpu_vram = params.get("gpu_vram")
        if gpu_vram:
            queryset = queryset.filter(description__icontains=f"VRAM: {gpu_vram} GB")

        seller = params.get("seller")
        if seller:
            queryset = queryset.filter(seller__id=seller)

        return queryset


class ListingCreate(generics.CreateAPIView):
    queryset = Listing.objects.select_related("seller", "category", "condition").all()
    serializer_class = ListingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        seller = self.request.user
        with transaction.atomic():
            listing = serializer.save(seller=seller, status="PENDING")
            payload = {
                "title": listing.title or "",
                "description": listing.description or "",
                "price": float(listing.price or 0),
                "seller_reputation": float(getattr(seller, "reputation", 0) or 0),
                "images_count": len(listing.images or []),
            }

            try:
                risk_level, ml_summary = evaluate_listing(payload)
            except Exception as exc:
                risk_level, ml_summary = "Alto", "Error en la evaluación automática."

            listing.risk_level = risk_level
            listing.ml_summary = ml_summary
            listing.status = (
                "REJECTED_BY_ML" if risk_level == "Alto" else "APPROVED_BY_ML"
            )
            listing.save(update_fields=["status", "risk_level", "ml_summary", "updated_at"])

            ListingRiskEvaluation.objects.create(
                listing=listing,
                risk_level=risk_level,
                ml_summary=ml_summary,
            )


class ListingRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Listing.objects.select_related("seller", "category", "condition").all()
    serializer_class = ListingSerializer
    permission_classes = [AllowAny]


class SavedListingsList(generics.ListAPIView):
    serializer_class = SavedListingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedListing.objects.filter(user=self.request.user).select_related("listing").order_by("-created_at")


class SavedToggle(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SavedListingSerializer

    def post(self, request, *args, **kwargs):
        listing = get_object_or_404(Listing, pk=kwargs.get("pk"))
        saved_qs = SavedListing.objects.filter(user=request.user, listing=listing)
        if saved_qs.exists():
            saved_qs.delete()
            return Response({"saved": False}, status=200)
        SavedListing.objects.create(user=request.user, listing=listing)
        return Response({"saved": True}, status=201)


class SavedDelete(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SavedListingSerializer

    def delete(self, request, *args, **kwargs):
        saved = get_object_or_404(SavedListing, pk=kwargs.get("pk"), user=request.user)
        saved.delete()
        return Response(status=204)


class MyListingDelete(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        listing = get_object_or_404(Listing, pk=kwargs.get("pk"), seller=request.user)
        listing.delete()
        return Response(status=204)


class MyListingMarkSold(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        listing = get_object_or_404(Listing, pk=kwargs.get("pk"), seller=request.user)
        listing.status = "SOLD"
        listing.save(update_fields=["status", "updated_at"])
        return Response({"status": listing.status}, status=200)


class MyListingUpdate(generics.UpdateAPIView):
    queryset = Listing.objects.select_related("seller", "category", "condition").all()
    serializer_class = ListingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Listing.objects.filter(seller=self.request.user)

    def perform_update(self, serializer):
        serializer.save()
        return super().perform_update(serializer)


def serve_listing_asset(request, filename):
    base = Path(__file__).resolve().parent.parent.parent / "assets" / "images" / "listings"
    safe = (base / filename).resolve()
    if not str(safe).startswith(str(base.resolve())):
        raise Http404
    if not safe.exists():
        raise Http404
    ct = "image/png"
    if safe.suffix.lower() == ".jpg" or safe.suffix.lower() == ".jpeg":
        ct = "image/jpeg"
    return FileResponse(open(safe, "rb"), content_type=ct)
