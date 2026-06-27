from rest_framework import serializers
from .models import Category, PhysicalCondition, Listing, SavedListing


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class CategoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

    def create(self, validated_data):
        validated_data.setdefault("slug", validated_data["name"].lower().replace(" ", "-"))
        return super().create(validated_data)


class PhysicalConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhysicalCondition
        fields = "__all__"


class ListingSerializer(serializers.ModelSerializer):
    seller_name = serializers.SerializerMethodField()
    seller_reputation = serializers.FloatField(source="seller.reputation", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    condition_name = serializers.CharField(source="condition.name", read_only=True)

    class Meta:
        model = Listing
        fields = [
            "id",
            "title",
            "description",
            "price",
            "status",
            "risk_level",
            "ml_summary",
            "analysis_message",
            "analysis_sections",
            "images",
            "category",
            "category_name",
            "condition",
            "condition_name",
            "hardware_type",
            "brand",
            "model",
            "seller",
            "seller_name",
            "seller_reputation",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("seller",)

    def get_seller_name(self, obj):
        user = getattr(obj, "seller", None)
        if not user:
            return None
        return f"{user.first_name} {user.last_name}".strip()


class SavedListingSerializer(serializers.ModelSerializer):
    listing = ListingSerializer(read_only=True)
    class Meta:
        model = SavedListing
        fields = ["id", "user", "listing", "created_at"]
        read_only_fields = ["user"]

