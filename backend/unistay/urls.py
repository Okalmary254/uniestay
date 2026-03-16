from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse                          
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import LoginView, RegisterView



def api_root(request):
    return JsonResponse({
        'status': 'ok',
        'message': 'UniStay API is running',
        'docs': {
            'properties':  '/api/v1/properties/',
            'bookings':    '/api/v1/bookings/',
            'maintenance': '/api/v1/maintenance/',
            'admin':       '/admin/',
        }
    })

urlpatterns = [
    path('', api_root),
    path('run-setup/', run_migrations),                                    

    path('admin/', admin.site.urls),

    path('api/v1/auth/register/', RegisterView.as_view(),          name='register'),
    path('api/v1/auth/login/',    LoginView.as_view(),             name='login'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/v1/users/',        include('users.urls')),
    path('api/v1/properties/',   include('properties.urls')),
    path('api/v1/bookings/',     include('bookings.urls')),
    path('api/v1/maintenance/',  include('maintenance.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)