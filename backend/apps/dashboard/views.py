from django.contrib.auth import get_user_model
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Invoice, PurchaseOrder, Quotation, RFQ, Vendor
from .serializers import (
    InvoiceSerializer,
    PurchaseOrderSerializer,
    QuotationSerializer,
    RFQSerializer,
    VendorSerializer,
)

User = get_user_model()

# ---------------------------------------------------------------------------
# Sidebar configuration — one source of truth.
# Each item: label, icon (Bootstrap icon class or emoji), path.
# Backend owns the menu so the frontend never needs to know role logic.
# ---------------------------------------------------------------------------

SIDEBAR_CONFIG = {
    "admin": [
        {"label": "Dashboard",      "icon": "bi-speedometer2",    "path": "/admin/dashboard"},
        {"label": "Users",          "icon": "bi-people",           "path": "/admin/users"},
        {"label": "Vendors",        "icon": "bi-building",         "path": "/admin/vendors"},
        {"label": "RFQs",           "icon": "bi-file-earmark-text","path": "/admin/rfqs"},
        {"label": "Quotations",     "icon": "bi-clipboard-data",   "path": "/admin/quotations"},
        {"label": "Approvals",      "icon": "bi-check-circle",     "path": "/admin/approvals"},
        {"label": "Purchase Orders","icon": "bi-bag-check",        "path": "/admin/purchase-orders"},
        {"label": "Invoices",       "icon": "bi-receipt",          "path": "/admin/invoices"},
        {"label": "Reports",        "icon": "bi-bar-chart-line",   "path": "/admin/reports"},
        {"label": "Activity Logs",  "icon": "bi-journal-text",     "path": "/admin/activity-logs"},
        {"label": "Settings",       "icon": "bi-gear",             "path": "/admin/settings"},
    ],
    "procurement_officer": [
        {"label": "Dashboard",      "icon": "bi-speedometer2",    "path": "/procurement/dashboard"},
        {"label": "Vendors",        "icon": "bi-building",         "path": "/procurement/vendors"},
        {"label": "RFQs",           "icon": "bi-file-earmark-text","path": "/procurement/rfqs"},
        {"label": "Quotations",     "icon": "bi-clipboard-data",   "path": "/procurement/quotations"},
        {"label": "Purchase Orders","icon": "bi-bag-check",        "path": "/procurement/purchase-orders"},
        {"label": "Invoices",       "icon": "bi-receipt",          "path": "/procurement/invoices"},
        {"label": "Reports",        "icon": "bi-bar-chart-line",   "path": "/procurement/reports"},
        {"label": "Activity",       "icon": "bi-journal-text",     "path": "/procurement/activity"},
    ],
    "manager": [
        {"label": "Dashboard",      "icon": "bi-speedometer2",    "path": "/manager/dashboard"},
        {"label": "Approvals",      "icon": "bi-check-circle",     "path": "/manager/approvals"},
        {"label": "Reports",        "icon": "bi-bar-chart-line",   "path": "/manager/reports"},
        {"label": "Activity",       "icon": "bi-journal-text",     "path": "/manager/activity"},
    ],
    "vendor": [
        {"label": "Dashboard",      "icon": "bi-speedometer2",    "path": "/vendor/dashboard"},
        {"label": "Assigned RFQs",  "icon": "bi-file-earmark-text","path": "/vendor/rfqs"},
        {"label": "My Quotations",  "icon": "bi-clipboard-data",   "path": "/vendor/quotations"},
        {"label": "Purchase Orders","icon": "bi-bag-check",        "path": "/vendor/purchase-orders"},
        {"label": "Invoices",       "icon": "bi-receipt",          "path": "/vendor/invoices"},
        {"label": "Profile",        "icon": "bi-person-circle",    "path": "/vendor/profile"},
    ],
}

# ---------------------------------------------------------------------------
# Quick actions per role — returned to the frontend as plain data.
# ---------------------------------------------------------------------------

QUICK_ACTIONS_CONFIG = {
    "admin": [
        {"label": "Manage Users",    "path": "/admin/users",          "tone": "primary"},
        {"label": "View Reports",    "path": "/admin/reports",        "tone": "outline-secondary"},
        {"label": "System Settings", "path": "/admin/settings",       "tone": "outline-secondary"},
    ],
    "procurement_officer": [
        {"label": "Create RFQ",          "path": "/procurement/rfqs",           "tone": "primary"},
        {"label": "Add Vendor",          "path": "/procurement/vendors",        "tone": "outline-secondary"},
        {"label": "Compare Quotations",  "path": "/procurement/quotations",     "tone": "outline-secondary"},
    ],
    "manager": [
        {"label": "Pending Approvals", "path": "/manager/approvals", "tone": "primary"},
        {"label": "View Reports",      "path": "/manager/reports",   "tone": "outline-secondary"},
    ],
    "vendor": [
        {"label": "Submit Quotation",    "path": "/vendor/quotations",         "tone": "primary"},
        {"label": "Track Purchase Order","path": "/vendor/purchase-orders",    "tone": "outline-secondary"},
        {"label": "Download Invoice",    "path": "/vendor/invoices",           "tone": "outline-secondary"},
    ],
}


class DashboardView(APIView):
    """
    Single unified dashboard endpoint.
    Returns sidebar config, stats, activities and quick actions
    for the authenticated user's role — everything in one request.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.role

        builder = _ROLE_BUILDERS.get(role, _noop)
        stats, activities = builder(user)

        return Response({
            "role": role,
            "sidebar": SIDEBAR_CONFIG.get(role, []),
            "quick_actions": QUICK_ACTIONS_CONFIG.get(role, []),
            "stats": stats,
            "activities": activities,
        })


# ---------------------------------------------------------------------------
# Legacy endpoints — kept intact so existing integrations don't break.
# ---------------------------------------------------------------------------

class DashboardStatsView(APIView):
    """
    Returns role-specific statistics sourced entirely from the database.
    No hardcoded values — every count is a live DB query.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.role
        builder = _ROLE_BUILDERS.get(role, _noop)
        stats, _ = builder(user)
        return Response({"role": role, "stats": stats})


class DashboardActivityView(APIView):
    """
    Returns role-specific recent activity list sourced from the database.
    Returns up to 10 most recent items per section for the logged-in user's role.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.role
        builder = _ROLE_BUILDERS.get(role, _noop)
        _, activities = builder(user)
        return Response({"role": role, "activities": activities})


# ---------------------------------------------------------------------------
# Internal builder functions — each returns (stats_list, activities_list).
# ---------------------------------------------------------------------------

def _noop(_user):
    return [], []


def _build_admin(user):
    stats = [
        {
            "key": "total_users",
            "title": "Total Users",
            "value": User.objects.count(),
            "detail": f"{User.objects.filter(is_active=True).count()} active",
            "icon": "bi-people",
            "tone": "primary",
        },
        {
            "key": "total_vendors",
            "title": "Total Vendors",
            "value": Vendor.objects.count(),
            "detail": f"{Vendor.objects.filter(status='active').count()} active",
            "icon": "bi-building",
            "tone": "info",
        },
        {
            "key": "open_rfqs",
            "title": "Open RFQs",
            "value": RFQ.objects.exclude(status__in=["approved", "closed", "rejected"]).count(),
            "detail": f"{RFQ.objects.filter(status='open').count()} unassigned",
            "icon": "bi-file-earmark-text",
            "tone": "warning",
        },
        {
            "key": "pending_approvals",
            "title": "Pending Approvals",
            "value": PurchaseOrder.objects.filter(status="pending_approval").count(),
            "detail": "Purchase orders awaiting approval",
            "icon": "bi-check-circle",
            "tone": "danger",
        },
        {
            "key": "purchase_orders",
            "title": "Purchase Orders",
            "value": PurchaseOrder.objects.count(),
            "detail": f"{PurchaseOrder.objects.filter(status='approved').count()} approved",
            "icon": "bi-bag-check",
            "tone": "success",
        },
        {
            "key": "total_invoices",
            "title": "Invoices",
            "value": Invoice.objects.count(),
            "detail": f"{Invoice.objects.filter(status='pending_payment').count()} pending payment",
            "icon": "bi-receipt",
            "tone": "secondary",
        },
    ]

    rfqs = RFQ.objects.select_related("created_by", "assigned_vendor").order_by("-created_at")[:10]
    pos = PurchaseOrder.objects.select_related("vendor", "created_by").order_by("-created_at")[:10]

    activities = [
        {
            "section": "Recent RFQs",
            "columns": [
                {"key": "title",               "label": "Title"},
                {"key": "created_by_username", "label": "Created By"},
                {"key": "vendor_name",         "label": "Assigned Vendor"},
                {"key": "status",              "label": "Status"},
                {"key": "created_at",          "label": "Date"},
            ],
            "rows": RFQSerializer(rfqs, many=True).data,
        },
        {
            "section": "Recent Purchase Orders",
            "columns": [
                {"key": "po_number",           "label": "PO Number"},
                {"key": "vendor_name",         "label": "Vendor"},
                {"key": "total_amount",        "label": "Amount"},
                {"key": "status",              "label": "Status"},
                {"key": "created_by_username", "label": "Requested By"},
            ],
            "rows": PurchaseOrderSerializer(pos, many=True).data,
        },
    ]

    return stats, activities


def _build_procurement(user):
    stats = [
        {
            "key": "active_vendors",
            "title": "Active Vendors",
            "value": Vendor.objects.filter(status="active").count(),
            "detail": "Available for assignment",
            "icon": "bi-building",
            "tone": "success",
        },
        {
            "key": "open_rfqs",
            "title": "Open RFQs",
            "value": RFQ.objects.filter(status="open").count(),
            "detail": "Not yet assigned to vendors",
            "icon": "bi-file-earmark-text",
            "tone": "primary",
        },
        {
            "key": "pending_quotations",
            "title": "Pending Quotations",
            "value": Quotation.objects.filter(status__in=["submitted", "under_review"]).count(),
            "detail": "Awaiting review or comparison",
            "icon": "bi-clipboard-data",
            "tone": "warning",
        },
        {
            "key": "purchase_orders",
            "title": "Purchase Orders",
            "value": PurchaseOrder.objects.count(),
            "detail": f"{PurchaseOrder.objects.filter(status='pending_approval').count()} awaiting approval",
            "icon": "bi-bag-check",
            "tone": "info",
        },
        {
            "key": "total_invoices",
            "title": "Invoices",
            "value": Invoice.objects.count(),
            "detail": f"{Invoice.objects.filter(status='pending_payment').count()} pending payment",
            "icon": "bi-receipt",
            "tone": "secondary",
        },
    ]

    open_rfqs = (
        RFQ.objects.filter(status__in=["open", "assigned", "comparison_pending"])
        .select_related("created_by", "assigned_vendor")
        .order_by("-created_at")[:10]
    )
    recent_pos = (
        PurchaseOrder.objects.select_related("vendor", "created_by")
        .order_by("-created_at")[:5]
    )

    activities = [
        {
            "section": "Active RFQs",
            "columns": [
                {"key": "title",               "label": "Title"},
                {"key": "vendor_name",         "label": "Assigned Vendor"},
                {"key": "deadline",            "label": "Deadline"},
                {"key": "status",              "label": "Status"},
            ],
            "rows": RFQSerializer(open_rfqs, many=True).data,
        },
        {
            "section": "Recent Procurement Activity",
            "columns": [
                {"key": "po_number",           "label": "PO Number"},
                {"key": "vendor_name",         "label": "Vendor"},
                {"key": "total_amount",        "label": "Amount"},
                {"key": "status",              "label": "Status"},
            ],
            "rows": PurchaseOrderSerializer(recent_pos, many=True).data,
        },
    ]

    return stats, activities


def _build_manager(user):
    stats = [
        {
            "key": "pending_approvals",
            "title": "Pending Approvals",
            "value": PurchaseOrder.objects.filter(status="pending_approval").count(),
            "detail": "Purchase orders awaiting your review",
            "icon": "bi-hourglass-split",
            "tone": "warning",
        },
        {
            "key": "approved_pos",
            "title": "Approved Today",
            "value": PurchaseOrder.objects.filter(
                status="approved",
                updated_at__date=_today(),
            ).count(),
            "detail": "Purchase orders approved today",
            "icon": "bi-check-circle",
            "tone": "success",
        },
        {
            "key": "rejected_pos",
            "title": "Rejected Today",
            "value": PurchaseOrder.objects.filter(
                status="rejected",
                updated_at__date=_today(),
            ).count(),
            "detail": "Purchase orders rejected today",
            "icon": "bi-x-circle",
            "tone": "danger",
        },
        {
            "key": "rfqs_in_comparison",
            "title": "RFQs in Comparison",
            "value": RFQ.objects.filter(status="comparison_pending").count(),
            "detail": "Awaiting vendor comparison decision",
            "icon": "bi-bar-chart-line",
            "tone": "info",
        },
    ]

    pending_pos = (
        PurchaseOrder.objects.filter(status="pending_approval")
        .select_related("vendor", "created_by")
        .order_by("-created_at")[:10]
    )
    comparison_rfqs = (
        RFQ.objects.filter(status="comparison_pending")
        .select_related("created_by", "assigned_vendor")
        .order_by("-created_at")[:5]
    )

    activities = [
        {
            "section": "Approval Queue",
            "columns": [
                {"key": "po_number",           "label": "PO Number"},
                {"key": "vendor_name",         "label": "Vendor"},
                {"key": "total_amount",        "label": "Amount"},
                {"key": "status",              "label": "Status"},
                {"key": "created_by_username", "label": "Requested By"},
            ],
            "rows": PurchaseOrderSerializer(pending_pos, many=True).data,
        },
        {
            "section": "RFQs in Comparison",
            "columns": [
                {"key": "title",               "label": "RFQ Title"},
                {"key": "created_by_username", "label": "Created By"},
                {"key": "vendor_name",         "label": "Assigned Vendor"},
                {"key": "status",              "label": "Status"},
            ],
            "rows": RFQSerializer(comparison_rfqs, many=True).data,
        },
    ]

    return stats, activities


def _build_vendor(user):
    try:
        vendor = user.vendor_profile
    except Vendor.DoesNotExist:
        return _vendor_no_profile(), []

    stats = [
        {
            "key": "assigned_rfqs",
            "title": "Assigned RFQs",
            "value": RFQ.objects.filter(assigned_vendor=vendor).exclude(
                status__in=["closed", "rejected"]
            ).count(),
            "detail": f"{RFQ.objects.filter(assigned_vendor=vendor, status='open').count()} open",
            "icon": "bi-file-earmark-text",
            "tone": "primary",
        },
        {
            "key": "submitted_quotations",
            "title": "Submitted Quotations",
            "value": Quotation.objects.filter(
                vendor=vendor, status__in=["submitted", "under_review", "accepted"]
            ).count(),
            "detail": f"{Quotation.objects.filter(vendor=vendor, status='accepted').count()} accepted",
            "icon": "bi-clipboard-data",
            "tone": "info",
        },
        {
            "key": "approved_quotations",
            "title": "Approved Quotations",
            "value": Quotation.objects.filter(vendor=vendor, status="accepted").count(),
            "detail": "Quotations accepted by procurement",
            "icon": "bi-check2-circle",
            "tone": "success",
        },
        {
            "key": "purchase_orders",
            "title": "Purchase Orders",
            "value": PurchaseOrder.objects.filter(vendor=vendor).count(),
            "detail": f"{PurchaseOrder.objects.filter(vendor=vendor, status='approved').count()} approved",
            "icon": "bi-bag-check",
            "tone": "warning",
        },
        {
            "key": "invoices",
            "title": "Invoices",
            "value": Invoice.objects.filter(vendor=vendor).count(),
            "detail": f"{Invoice.objects.filter(vendor=vendor, status='pending_payment').count()} pending payment",
            "icon": "bi-receipt",
            "tone": "secondary",
        },
        {
            "key": "pending_payments",
            "title": "Pending Payments",
            "value": Invoice.objects.filter(vendor=vendor, status="pending_payment").count(),
            "detail": "Invoices awaiting payment",
            "icon": "bi-clock",
            "tone": "danger",
        },
    ]

    assigned_rfqs = (
        RFQ.objects.filter(assigned_vendor=vendor)
        .order_by("-created_at")[:10]
    )
    quotations = (
        Quotation.objects.filter(vendor=vendor)
        .select_related("rfq")
        .order_by("-created_at")[:10]
    )

    activities = [
        {
            "section": "Assigned RFQs",
            "columns": [
                {"key": "title",    "label": "RFQ Title"},
                {"key": "deadline", "label": "Deadline"},
                {"key": "status",   "label": "Status"},
            ],
            "rows": RFQSerializer(assigned_rfqs, many=True).data,
        },
        {
            "section": "My Quotations",
            "columns": [
                {"key": "rfq_title",   "label": "RFQ"},
                {"key": "total_price", "label": "Total Price"},
                {"key": "status",      "label": "Status"},
                {"key": "submitted_at","label": "Submitted"},
            ],
            "rows": QuotationSerializer(quotations, many=True).data,
        },
    ]

    return stats, activities


def _vendor_no_profile():
    return [
        {
            "key": "assigned_rfqs",
            "title": "Assigned RFQs",
            "value": 0,
            "detail": "Complete your vendor profile to get started",
            "icon": "bi-file-earmark-text",
            "tone": "primary",
        },
    ]


# Map role → builder function
_ROLE_BUILDERS = {
    "admin": _build_admin,
    "procurement_officer": _build_procurement,
    "manager": _build_manager,
    "vendor": _build_vendor,
}


# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------

def _today():
    from django.utils import timezone
    return timezone.localdate()
