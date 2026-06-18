from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, CustomTokenObtainPairView, LogoutView, ChangePasswordView, UserProfileView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='auth_change_password'),
    path('auth/me/', UserProfileView.as_view(), name='auth_me'),
]

from rest_framework.routers import DefaultRouter
from .views import InternshipViewSet, DocumentViewSet, ChatbotMessageView, NotificationViewSet, UserViewSet, ChatbotSessionListView, ChatbotSessionMessageListView, InternshipMessageView

router = DefaultRouter()
router.register(r'internships', InternshipViewSet, basename='internship')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'users', UserViewSet, basename='user')

urlpatterns += [
    path('chatbot/sessions/', ChatbotSessionListView.as_view(), name='chatbot_sessions'),
    path('chatbot/sessions/<uuid:session_id>/messages/', ChatbotSessionMessageListView.as_view(), name='chatbot_session_messages'),
    path('chatbot/message/', ChatbotMessageView.as_view(), name='chatbot_message'),
    path('internships/<uuid:internship_id>/messages/', InternshipMessageView.as_view(), name='internship_messages'),
]
urlpatterns += router.urls

