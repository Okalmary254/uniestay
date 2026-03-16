from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Property, PropertyImage
from .serializers import PropertySerializer, PropertyListSerializer, PropertyImageSerializer


class IsLandlord(permissions.BasePermission):
    def has_permission(self, request, view):

        return (
            request.user.is_authenticated and
            request.user.role == 'landlord'
        )

    def has_object_permission(self, request, view, obj):
        return (
            request.user.is_authenticated and
            obj.landlord == request.user
        )


class PropertyListCreateView(generics.ListCreateAPIView):
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'city', 'neighbourhood', 'nearest_university']
    ordering_fields = ['rent', 'created_at']

    def get_queryset(self):
        qs = Property.objects.select_related('landlord').prefetch_related('amenities', 'images')
        if self.request.user.is_authenticated and self.request.user.role == 'landlord':
            return qs.filter(landlord=self.request.user)
        return qs.filter(status='active')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PropertyListSerializer
        return PropertySerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsLandlord()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(landlord=self.request.user)


class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Property.objects.select_related('landlord').prefetch_related('amenities', 'images')
    serializer_class = PropertySerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsLandlord()]


class PropertyImageUploadView(APIView):
    permission_classes = [IsLandlord]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        prop = generics.get_object_or_404(Property, pk=pk, landlord=request.user)
        images = request.FILES.getlist('images')
        created = []
        for i, img in enumerate(images):
            is_primary = (i == 0 and not prop.images.filter(is_primary=True).exists())
            pi = PropertyImage.objects.create(property=prop, image=img, is_primary=is_primary)
            created.append(PropertyImageSerializer(pi, context={'request': request}).data)
        return Response(created, status=status.HTTP_201_CREATED)
