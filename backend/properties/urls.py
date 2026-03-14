from django.urls import path
from .views import PropertyListCreateView, PropertyDetailView, PropertyImageUploadView

urlpatterns = [
    path('', PropertyListCreateView.as_view(), name='property-list'),
    path('<int:pk>/', PropertyDetailView.as_view(), name='property-detail'),
    path('<int:pk>/images/', PropertyImageUploadView.as_view(), name='property-images'),
]
