from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ActiveVendorListView, VendorCategoryViewSet, VendorViewSet

# ── Router ────────────────────────────────────────────────────────────────
# Automatically creates the standard REST URL patterns for each ViewSet.
#
# VendorCategoryViewSet  →  /categories/          GET, POST
#                           /categories/{id}/     GET, PUT, PATCH, DELETE
#
# VendorViewSet          →  /                     GET, POST
#                           /{id}/                GET, PUT, PATCH
#                           /{id}/archive/        POST   (soft-delete)
#                           /{id}/activity/       GET    (audit log)
#
# DELETE /{id}/ is intentionally blocked inside VendorViewSet.destroy().

router = DefaultRouter()
router.register(r"categories", VendorCategoryViewSet, basename="vendor-category")
router.register(r"",           VendorViewSet,         basename="vendor")

urlpatterns = [
    # Lightweight active-vendor list for RFQ dropdown (no auth-role restriction)
    path("active/", ActiveVendorListView.as_view(), name="vendor-active-list"),

    # All ViewSet routes
    path("", include(router.urls)),
]
