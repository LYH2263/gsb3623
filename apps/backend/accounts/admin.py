from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from accounts.models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (("扩展信息", {"fields": ("role", "created_at")}),)
    readonly_fields = ("created_at",)
    list_display = ("username", "email", "role", "is_active", "is_staff", "created_at")
    list_filter = ("role", "is_active", "is_staff")
