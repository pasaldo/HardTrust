from django.urls import path
from . import views

app_name = "messaging"

urlpatterns = [
    path("conversations/", views.ConversationListCreate.as_view(), name="conversation-list"),
    path("conversations/<int:pk>/messages/", views.MessageListCreate.as_view(), name="message-list"),
]
