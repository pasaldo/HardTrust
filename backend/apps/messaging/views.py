from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationListCreate(generics.ListCreateAPIView):
    queryset = Conversation.objects.prefetch_related("participants").all()
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]


class MessageListCreate(generics.ListCreateAPIView):
    queryset = Message.objects.select_related("sender", "conversation").all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
