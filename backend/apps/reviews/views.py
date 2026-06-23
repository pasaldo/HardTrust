from rest_framework import generics
from django.shortcuts import get_object_or_404
from .models import Review
from .serializers import ReviewSerializer


class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.select_related("reviewer", "reviewee", "listing").all()
    serializer_class = ReviewSerializer

    def perform_create(self, serializer):
        serializer.save()
