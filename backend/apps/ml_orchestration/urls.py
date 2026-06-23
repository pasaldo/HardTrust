from django.urls import path
from .views import listing_risk, predict_risk, evaluate_listing_endpoint

app_name = "ml_orchestration"

urlpatterns = [
    path("listings/<int:pk>/", listing_risk, name="listing-risk"),
    path("listings/<int:pk>/evaluate/", evaluate_listing_endpoint, name="listing-evaluate"),
    path("predict/", predict_risk, name="predict-risk"),
]
