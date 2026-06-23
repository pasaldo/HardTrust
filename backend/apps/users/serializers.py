from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models import HardUser


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(queryset=HardUser.objects.all(), message="Este email ya está registrado.")
        ],
    )
    username = serializers.CharField(
        required=True,
        validators=[
            UniqueValidator(queryset=HardUser.objects.all(), message="Este username ya está en uso.")
        ],
    )
    rut = serializers.CharField(
        required=True,
        validators=[
            UniqueValidator(queryset=HardUser.objects.all(), message="Este RUT ya está registrado.")
        ],
    )
    phone = serializers.CharField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = HardUser
        fields = ["email", "username", "password", "first_name", "last_name", "rut", "phone"]

    def create(self, validated_data):
        user = HardUser.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            rut=validated_data["rut"],
            phone=validated_data["phone"],
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        user = authenticate(request=self.context.get("request"), email=email, password=password)
        if not user:
            raise serializers.ValidationError("Credenciales inválidas.")
        attrs["user"] = user
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = HardUser
        fields = ["id", "email", "username", "first_name", "last_name", "rut", "phone", "reputation", "created_at", "updated_at"]
        read_only_fields = ["id", "email", "username", "reputation", "created_at", "updated_at"]
