from rest_framework import generics
from .models import Report
from .serializers import ReportSerializer


class ReportListCreate(generics.ListCreateAPIView):
    queryset = Report.objects.select_related("reporter").all()
    serializer_class = ReportSerializer
