from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import FeedbackReport
from .serializers import FeedbackSerializer
from django.db.models import F
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied

from django.shortcuts import get_object_or_404


class FeedbackListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = FeedbackSerializer
    
    def get_queryset(self):
        city = self.request.query_params.get('city', '')
        queryset = FeedbackReport.objects.all()
        if city:
            queryset = queryset.filter(location_name__icontains=city)
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user if self.request.user.is_authenticated else None)

class FeedbackDetail(generics.RetrieveUpdateAPIView):
    queryset = FeedbackReport.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class UpvoteFeedback(APIView):
    def post(self, request, pk):
        feedback = get_object_or_404(FeedbackReport, pk=pk)
        feedback.upvotes = F('upvotes') + 1
        feedback.save()
        feedback.refresh_from_db()
        return Response({'upvotes': feedback.upvotes})
    

# Example Django view
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_feedback(request, pk):
    feedback = get_object_or_404(FeedbackReport, pk=pk)
    if feedback.user != request.user and not request.user.is_staff:
        raise PermissionDenied("You do not have permission to edit this feedback.")
    serializer = FeedbackSerializer(feedback, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)
