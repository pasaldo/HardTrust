from django.urls import path
from . import views

app_name = "moderation"

urlpatterns = [
    path("reports/", views.ReportListCreate.as_view(), name="report-list"),
]
