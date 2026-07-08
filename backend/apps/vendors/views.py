from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework import permissions

from .models import Vendor, VendorActivityLog, VendorCategory
from .permissions import VendorModulePermission
from .serializers import (
    VendorActivityLogSerializer,
    VendorCategorySerializer,
    VendorDetailSerializer,
    VendorListSerializer,
    VendorWriteSerializer,
)


class VendorCategoryViewSet(ModelViewSet):
    """
    CRUD for vendor categories.
    Only admin and procurement_officer can write; manager can read.
    """

    queryset = VendorCategory.objects.all().order_by("name")
    serializer_class = VendorCategorySerializer
    permission_classes = [VendorModulePermission]

    def get_queryset(self):
        qs = super().get_queryset()
        # Optional ?active_only=true filter
        if self.request.query_params.get("active_only") == "true":
            qs = qs.filter(is_active=True)
        return qs


class VendorViewSet(ModelViewSet):
    """
    Full vendor management endpoint.

    Supports:
      GET    /vendors/              — paginated list with search + filter + sort
      POST   /vendors/              — create
      GET    /vendors/{id}/         — detail (with stats)
      PUT    /vendors/{id}/         — full update
      PATCH  /vendors/{id}/         — partial update
      POST   /vendors/{id}/archive/ — soft-delete (never hard delete)

    Query params for list:
      search=<str>     — searches company_name, contact_person, email, vendor_code
      status=<str>     — filter by status (active/inactive/blacklisted/archived)
      category=<int>   — filter by category id
      ordering=<field> — sort by any field, prefix with - for descending
      page=<int>       — page number (default 1)
      page_size=<int>  — results per page (default 20, max 100)
    """

    permission_classes = [VendorModulePermission]
    filter_backends    = [SearchFilter, OrderingFilter]
    search_fields      = ["company_name", "contact_person", "email", "vendor_code", "phone"]
    ordering_fields    = ["company_name", "vendor_code", "status", "created_at", "city"]
    ordering           = ["-created_at"]

    def get_queryset(self):
        qs = Vendor.objects.select_related("category", "created_by").all()

        # Status filter
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        # Category filter
        category_param = self.request.query_params.get("category")
        if category_param:
            qs = qs.filter(category_id=category_param)

        return qs

    def get_serializer_class(self):
        if self.action in ("list",):
            return VendorListSerializer
        if self.action in ("create", "update", "partial_update"):
            return VendorWriteSerializer
        # retrieve, archive, etc.
        return VendorDetailSerializer

    # ── Manual pagination ──────────────────────────────────────────────

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())

        # Pagination
        try:
            page      = max(1, int(request.query_params.get("page", 1)))
            page_size = min(100, max(1, int(request.query_params.get("page_size", 20))))
        except ValueError:
            page, page_size = 1, 20

        total = qs.count()
        start = (page - 1) * page_size
        end   = start + page_size
        page_qs = qs[start:end]

        serializer = VendorListSerializer(page_qs, many=True)
        return Response({
            "count":     total,
            "page":      page,
            "page_size": page_size,
            "pages":     max(1, -(-total // page_size)),  # ceiling division
            "results":   serializer.data,
        })

    # ── Prevent hard delete ────────────────────────────────────────────

    def destroy(self, request, *args, **kwargs):
        return Response(
            {"detail": "Vendors cannot be deleted. Use the archive action instead."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    # ── Archive action ─────────────────────────────────────────────────

    @action(detail=True, methods=["post"], url_path="archive")
    def archive(self, request, pk=None):
        vendor = self.get_object()

        if vendor.status == Vendor.STATUS_ARCHIVED:
            return Response(
                {"detail": "Vendor is already archived."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        vendor.archive()

        VendorActivityLog.objects.create(
            vendor=vendor,
            action=VendorActivityLog.ACTION_ARCHIVE,
            detail=f"Vendor {vendor.vendor_code} ({vendor.company_name}) archived.",
            performed_by=request.user,
        )

        return Response(
            {"detail": f"Vendor {vendor.vendor_code} has been archived."},
            status=status.HTTP_200_OK,
        )

    # ── Activity log for a single vendor ──────────────────────────────

    @action(detail=True, methods=["get"], url_path="activity")
    def activity(self, request, pk=None):
        vendor = self.get_object()
        logs = vendor.activity_logs.select_related("performed_by").order_by("-created_at")[:50]
        return Response(VendorActivityLogSerializer(logs, many=True).data)


class ActiveVendorListView(APIView):
    """
    Lightweight endpoint used by the RFQ module to populate vendor dropdowns.
    Returns only active, non-blacklisted vendors.
    No pagination — used for select inputs.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        vendors = (
            Vendor.objects
            .filter(status=Vendor.STATUS_ACTIVE)
            .select_related("category")
            .order_by("company_name")
            .values("id", "vendor_code", "company_name", "category__name")
        )
        return Response(list(vendors))
