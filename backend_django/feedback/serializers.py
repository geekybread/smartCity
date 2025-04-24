# serializers.py
from .models import FeedbackReport, FeedbackUpvote
from rest_framework import serializers

class FeedbackSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    has_upvoted = serializers.SerializerMethodField()

    class Meta:
        model = FeedbackReport
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'upvotes')

    def get_has_upvoted(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return FeedbackUpvote.objects.filter(user=user, feedback=obj).exists()
        return False
