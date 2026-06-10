from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "is_active", "created_at"]


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["role", "is_active"]

    def validate_role(self, value):
        if value not in ["admin", "user"]:
            raise serializers.ValidationError("角色仅支持 admin 或 user")
        return value

    def update(self, instance, validated_data):
        update_fields = []

        if "role" in validated_data:
            role = validated_data["role"]
            instance.role = role
            instance.is_staff = role == "admin"
            if role != "admin":
                instance.is_superuser = False
                update_fields.append("is_superuser")
            update_fields.extend(["role", "is_staff"])

        if "is_active" in validated_data:
            instance.is_active = validated_data["is_active"]
            update_fields.append("is_active")

        if update_fields:
            instance.save(update_fields=list(dict.fromkeys(update_fields)))
        return instance
