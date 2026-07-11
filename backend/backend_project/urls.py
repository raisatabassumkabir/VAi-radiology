# pyrefly: ignore [missing-import]
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from core.views import TaskViewSet, AnnotatedImageViewSet, LoginView

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'annotated-images', AnnotatedImageViewSet, basename='annotatedimage')

urlpatterns = [
    path('', RedirectView.as_view(url='/admin/', permanent=False)),  # Auto-redirect root to Admin
    path('admin/', admin.site.urls),
    path('api/login/', LoginView.as_view(), name='api-login'),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
