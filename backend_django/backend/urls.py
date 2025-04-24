from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from accounts.views import (
    GoogleLogin,
    CheckAdminStatus,
    UserDetail,
    start_phone_verification,
    verify_phone_otp,
    user_profile
)
from feedback.views import (
    FeedbackListCreate,
    FeedbackDetail,
    UpvoteFeedback,
    feedback_comments
)
from alerts.views import EmergencyAlertViewSet  # ✅ import the alert viewset
from accidentzones.views import AccidentZoneViewSet  # ✅ import the accident zone viewset

# Create a router for API endpoints
router = DefaultRouter()
router.register(r'emergency-alerts', EmergencyAlertViewSet, basename='emergency-alert')
router.register(r'accident-zones', AccidentZoneViewSet, basename='accident-zone')


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
    path('api/feedback/<int:feedback_id>/comments/', feedback_comments),

    # Include DRF auth URLs for browsable API
    path('api-auth/', include('rest_framework.urls')),

    # Include allauth URLs (for social auth)
    path('accounts/', include('allauth.urls')),

    path('api/accounts/verify/start/', start_phone_verification),
    path('api/accounts/verify/check/', verify_phone_otp),

    path('api/accounts/profile/', user_profile),

]

# Include router URLs (e.g., alerts/)
urlpatterns += [
    path('api/', include(router.urls))  # ✅ mount all router endpoints under /api/
]

