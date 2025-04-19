from rest_framework import serializers
from .models import FeedbackReport

class FeedbackSerializer(serializers.ModelSerializer):

    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = FeedbackReport
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'upvotes')  #read-only
    def validate_latitude(self, value):
        if not -90 <= float(value) <= 90:
            raise serializers.ValidationError("Invalid latitude.")
        return value
