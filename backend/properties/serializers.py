from rest_framework import serializers
from .models import Property, Amenity, PropertyImage
from users.serializers import UserSerializer


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ['id', 'name']


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'caption', 'is_primary', 'uploaded_at']


class PropertySerializer(serializers.ModelSerializer):
    amenities = AmenitySerializer(many=True, read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)
    landlord = UserSerializer(read_only=True)
    amenity_names = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )

    class Meta:
        model = Property
        fields = [
            'id', 'landlord', 'title', 'property_type', 'description', 'status',
            'rent', 'deposit', 'address', 'neighbourhood', 'city',
            'nearest_university', 'distance_to_campus', 'google_maps_link',
            'bedrooms', 'bathrooms', 'max_occupants', 'available_from',
            'amenities', 'images', 'amenity_names', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'landlord', 'created_at', 'updated_at']

    def create(self, validated_data):
        amenity_names = validated_data.pop('amenity_names', [])
        prop = Property.objects.create(**validated_data)
        for name in amenity_names:
            Amenity.objects.create(property=prop, name=name)
        return prop

    def update(self, instance, validated_data):
        amenity_names = validated_data.pop('amenity_names', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if amenity_names is not None:
            instance.amenities.all().delete()
            for name in amenity_names:
                Amenity.objects.create(property=instance, name=name)
        return instance


class PropertyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for browse/listing views."""
    amenities = AmenitySerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    landlord_name = serializers.CharField(source='landlord.get_full_name', read_only=True)

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'property_type', 'status', 'rent', 'deposit',
            'neighbourhood', 'city', 'nearest_university', 'distance_to_campus',
            'bedrooms', 'bathrooms', 'available_from', 'amenities',
            'primary_image', 'landlord_name',
        ]

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img:
            request = self.context.get('request')
            return request.build_absolute_uri(img.image.url) if request else img.image.url
        return None
