# dashboard/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Feedback
from .serializers import FeedbackSerializer

@api_view(['POST'])
def submit_feedback(request):
    serializer = FeedbackSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'status': 'success', 'message': 'Feedback submitted successfully!'})
    return Response({'status': 'error', 'message': serializer.errors}, status=400)