from django.contrib import admin

from .models import Invoice, PurchaseOrder, Quotation, RFQ, Vendor


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ("company_name", "user", "status", "contact_email", "created_at")
    list_filter = ("status",)
    search_fields = ("company_name", "contact_email", "user__username")


@admin.register(RFQ)
class RFQAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "created_by", "assigned_vendor", "deadline", "created_at")
    list_filter = ("status",)
    search_fields = ("title", "created_by__username")


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ("rfq", "vendor", "total_price", "status", "submitted_at")
    list_filter = ("status",)
    search_fields = ("rfq__title", "vendor__company_name")


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ("po_number", "vendor", "total_amount", "status", "created_by", "created_at")
    list_filter = ("status",)
    search_fields = ("po_number", "vendor__company_name")


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "vendor", "purchase_order", "amount", "status", "due_date")
    list_filter = ("status",)
    search_fields = ("invoice_number", "vendor__company_name")
