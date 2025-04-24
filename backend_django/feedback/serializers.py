# serializers.py
from .models import FeedbackReport, FeedbackUpvote, FeedbackComment
from rest_framework import serializers

class FeedbackSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    has_upvoted = serializers.SerializerMethodField()

    class Meta:
        model = FeedbackReport
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'upvotes', 'approved')

    def get_has_upvoted(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return FeedbackUpvote.objects.filter(user=user, feedback=obj).exists()
        return False
class FeedbackCommentSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()
    class Meta:
        model = FeedbackComment
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'report')

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None
