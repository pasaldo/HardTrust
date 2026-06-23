from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/listings/', include('apps.listings.urls')),
    path('api/messaging/', include('apps.messaging.urls')),
    path('api/moderation/', include('apps.moderation.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/ml/', include('apps.ml_orchestration.urls')),
    path('', include('apps.core.urls')),
]
