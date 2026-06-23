from rest_framework import serializers
from .models import Category, PhysicalCondition, Listing


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

    class Meta:
        model = Listing
        fields = "__all__"
        read_only_fields = ("seller",)

    def get_seller_name(self, obj):
        user = getattr(obj, "seller", None)
        if not user:
            return None
        return f"{user.first_name} {user.last_name}".strip()
