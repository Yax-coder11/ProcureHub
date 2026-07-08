from rest_framework import serializers

from .models import Invoice, PurchaseOrder, Quotation, RFQ, Vendor


class VendorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Vendor
        fields = ("id", "company_name", "contact_email", "status", "created_at", "username")


class RFQSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    vendor_name = serializers.CharField(
        source="assigned_vendor.company_name", read_only=True, default=None
    )

    class Meta:
        model = RFQ
        fields = (
            "id",
            "title",
            "status",
            "created_by_username",
            "vendor_name",
            "deadline",
            "created_at",
        )


class QuotationSerializer(serializers.ModelSerializer):
    rfq_title = serializers.CharField(source="rfq.title", read_only=True)
    vendor_name = serializers.CharField(source="vendor.company_name", read_only=True)

    class Meta:
        model = Quotation
        fields = (
            "id",
            "rfq_title",
            "vendor_name",
            "total_price",
            "status",
            "submitted_at",
            "created_at",
        )


class PurchaseOrderSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.company_name", read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = (
            "id",
            "po_number",
            "vendor_name",
            "total_amount",
            "status",
            "created_by_username",
            "created_at",
        )


class InvoiceSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.company_name", read_only=True)
    po_number = serializers.CharField(source="purchase_order.po_number", read_only=True)

    class Meta:
        model = Invoice
        fields = (
            "id",
            "invoice_number",
            "vendor_name",
            "po_number",
            "amount",
            "status",
            "due_date",
            "created_at",
        )
