from django.urls import path
from . import views

app_name = "listings"

urlpatterns = [
    path("categories/", views.CategoryListCreate.as_view(), name="category-list"),
    path("conditions/", views.PhysicalConditionListCreate.as_view(), name="condition-list"),
    path("brands/", views.BrandList.as_view(), name="brand-list"),
    path("browse/", views.ListingListCreate.as_view(), name="listing-list"),
    path("listings/", views.ListingListCreate.as_view(), name="listing-list-alt"),
    path("listings/<int:pk>/", views.ListingRetrieveUpdateDestroy.as_view(), name="listing-detail"),
]
