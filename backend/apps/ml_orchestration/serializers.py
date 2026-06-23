from rest_framework import serializers
from .models import ListingRiskEvaluation


class ListingRiskEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingRiskEvaluation
        fields = "__all__"
        read_only_fields = ("evaluated_at",)
