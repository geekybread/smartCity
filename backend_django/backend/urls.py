from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from accounts.views import (
    GoogleLogin,
    CheckAdminStatus,
    UserDetail
)
from feedback.views import (
    FeedbackListCreate,
    FeedbackDetail,
    UpvoteFeedback
)

# Create a router for API endpoints
router = DefaultRouter()

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication endpoints
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('api/auth/status/', CheckAdminStatus.as_view(), name='auth_status'),
    path('api/auth/user/', UserDetail.as_view(), name='user_detail'),
    
    # Feedback endpoints
    path('api/feedback/', FeedbackListCreate.as_view(), name='feedback-list'),
    path('api/feedback/<int:pk>/', FeedbackDetail.as_view(), name='feedback-detail'),
    path('api/feedback/<int:pk>/upvote/', UpvoteFeedback.as_view(), name='feedback-upvote'),
    
    # Include DRF auth URLs for browsable API
    path('api-auth/', include('rest_framework.urls')),
    
    # Include allauth URLs (for social auth)
    path('accounts/', include('allauth.urls')),
]

# Include router URLs
urlpatterns += router.urls