from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied
from django.db.models import F
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import FeedbackReport, FeedbackUpvote, FeedbackComment
from .serializers import FeedbackSerializer, FeedbackCommentSerializer


class FeedbackListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = FeedbackSerializer

    def get_queryset(self):
        queryset = FeedbackReport.objects.all()
        city = self.request.query_params.get('city', '')
        status = self.request.query_params.get('status', '')
        severity = self.request.query_params.get('severity', '')

        if city:
            queryset = queryset.filter(location_name__icontains=city)
        if status:
            queryset = queryset.filter(status=status)
        if severity:
            queryset = queryset.filter(severity=severity)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user if self.request.user.is_authenticated else None)

    def get_serializer_context(self):
        return {'request': self.request}


class FeedbackDetail(generics.RetrieveUpdateAPIView):
    queryset = FeedbackReport.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        return {'request': self.request}


class UpvoteFeedback(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        feedback = get_object_or_404(FeedbackReport, pk=pk)
        user = request.user

        # Prevent duplicate upvotes
        if FeedbackUpvote.objects.filter(user=user, feedback=feedback).exists():
            return Response({'detail': 'You have already upvoted this feedback.'}, status=400)

        # Create upvote record
        FeedbackUpvote.objects.create(user=user, feedback=feedback)

        # Update total upvote count manually
        feedback.upvotes = FeedbackUpvote.objects.filter(feedback=feedback).count()
        feedback.save()

        return Response({'upvotes': feedback.upvotes})


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


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def feedback_comments(request, feedback_id):
    if request.method == 'GET':
        comments = FeedbackComment.objects.filter(report_id=feedback_id).order_by('created_at')
        print("🎯 Loaded comments:", list(comments.values('text', 'is_official', 'user')))
        serializer = FeedbackCommentSerializer(comments, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = FeedbackCommentSerializer(data=request.data)
        if serializer.is_valid():
            report = get_object_or_404(FeedbackReport, id=feedback_id)
            serializer.save(user=request.user, report=report)
            return Response(serializer.data, status=201)
        else:
            print("❌ Comment Validation Error:", serializer.errors)
            return Response(serializer.errors, status=400)
