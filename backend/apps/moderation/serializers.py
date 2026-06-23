from rest_framework import serializers


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = __import__("apps.moderation.models", fromlist=["Report"]).Report
        fields = "__all__"
