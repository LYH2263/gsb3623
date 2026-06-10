from rest_framework.permissions import BasePermission


class IsAdminOrOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated and request.user.role == "admin":
            return True
        return getattr(obj, "created_by_id", None) == request.user.id
