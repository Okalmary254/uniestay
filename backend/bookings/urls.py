from django.urls import path
from .views import BookingListCreateView, BookingDetailView, PaymentListCreateView, ConfirmPaymentView

urlpatterns = [
    path('', BookingListCreateView.as_view(), name='booking-list'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('payments/', PaymentListCreateView.as_view(), name='payment-list'),
    path('payments/<int:pk>/confirm/', ConfirmPaymentView.as_view(), name='confirm-payment'),
]
