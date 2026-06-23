from django.urls import path
from . import views

app_name = "listings"

urlpatterns = [
    path("categories/", views.CategoryListCreate.as_view(), name="category-list"),
    path("conditions/", views.PhysicalConditionListCreate.as_view(), name="condition-list"),
    path("listings/", views.ListingListCreate.as_view(), name="listing-list"),
    path("listings/create/", views.ListingCreate.as_view(), name="listing-create"),
    path("listings/<int:pk>/", views.ListingRetrieveUpdateDestroy.as_view(), name="listing-detail"),
    path("browse/", views.ListingListCreate.as_view(), name="browse"),
]
