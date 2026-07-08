from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include(("apps.authentication.urls", "authentication"), namespace="authentication")),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/dashboard/", include(("apps.dashboard.urls", "dashboard"), namespace="dashboard")),
    path("api/vendors/",   include(("apps.vendors.urls",   "vendors"),   namespace="vendors")),
]
