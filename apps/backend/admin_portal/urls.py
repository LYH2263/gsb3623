from django.urls import path

from admin_portal.views import AdminOverviewView, AdminUserDetailView, AdminUserListView

urlpatterns = [
    path("users/", AdminUserListView.as_view(), name="admin-users"),
    path("users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("overview/", AdminOverviewView.as_view(), name="admin-overview"),
]
