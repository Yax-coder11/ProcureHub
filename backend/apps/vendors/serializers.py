from rest_framework import serializers

from .models import Vendor, VendorActivityLog, VendorCategory


# ── Category ──────────────────────────────────────────────────────────────

class VendorCategorySerializer(serializers.ModelSerializer):
    vendor_count = serializers.SerializerMethodField()

    class Meta:
        model = VendorCategory
        fields = ("id", "name", "description", "is_active", "vendor_count", "created_at")
        read_only_fields = ("id", "created_at", "vendor_count")

    def get_vendor_count(self, obj):
        return obj.vendors.exclude(status=Vendor.STATUS_ARCHIVED).count()


# ── Activity log (read-only) ──────────────────────────────────────────────

class VendorActivityLogSerializer(serializers.ModelSerializer):
    performed_by_username = serializers.CharField(
        source="performed_by.username", read_only=True, default=None
    )

    class Meta:
        model = VendorActivityLog
        fields = ("id", "action", "detail", "performed_by_username", "created_at")
        read_only_fields = fields


# ── Vendor — list (lightweight, used in table) ────────────────────────────

class VendorListSerializer(serializers.ModelSerializer):
    category_name   = serializers.CharField(source="category.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True, default=None)

    class Meta:
        model = Vendor
        fields = (
            "id",
            "vendor_code",
            "company_name",
            "contact_person",
            "email",
            "phone",
            "category",
            "category_name",
            "status",
            "created_by_name",
            "created_at",
        )
        read_only_fields = ("id", "vendor_code", "created_at")


# ── Vendor — detail (full record, used in view/edit) ─────────────────────

class VendorDetailSerializer(serializers.ModelSerializer):
    category_name   = serializers.CharField(source="category.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True, default=None)
    activity_logs   = VendorActivityLogSerializer(many=True, read_only=True)

    # Stats from related modules — all live DB queries, nothing hardcoded
    assigned_rfqs       = serializers.SerializerMethodField()
    submitted_quotations = serializers.SerializerMethodField()
    purchase_orders     = serializers.SerializerMethodField()
    invoices            = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = (
            "id",
            "vendor_code",
            "company_name",
            "contact_person",
            "email",
            "phone",
            "gst_number",
            "category",
            "category_name",
            "address",
            "city",
            "state",
            "country",
            "pincode",
            "description",
            "website",
            "status",
            "created_by_name",
            "created_at",
            "updated_at",
            # Stats
            "assigned_rfqs",
            "submitted_quotations",
            "purchase_orders",
            "invoices",
            # Audit trail
            "activity_logs",
        )
        read_only_fields = ("id", "vendor_code", "created_at", "updated_at")

    def get_assigned_rfqs(self, obj):
        # Import here to avoid circular import with dashboard models
        try:
            from apps.dashboard.models import RFQ
            return RFQ.objects.filter(assigned_vendor__company_name=obj.company_name).count()
        except Exception:
            return 0

    def get_submitted_quotations(self, obj):
        try:
            from apps.dashboard.models import Quotation
            return Quotation.objects.filter(
                vendor__company_name=obj.company_name
            ).count()
        except Exception:
            return 0

    def get_purchase_orders(self, obj):
        try:
            from apps.dashboard.models import PurchaseOrder
            return PurchaseOrder.objects.filter(
                vendor__company_name=obj.company_name
            ).count()
        except Exception:
            return 0

    def get_invoices(self, obj):
        try:
            from apps.dashboard.models import Invoice
            return Invoice.objects.filter(
                vendor__company_name=obj.company_name
            ).count()
        except Exception:
            return 0


# ── Vendor — write (create / update) ─────────────────────────────────────

class VendorWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = (
            "company_name",
            "contact_person",
            "email",
            "phone",
            "gst_number",
            "category",
            "address",
            "city",
            "state",
            "country",
            "pincode",
            "description",
            "website",
            "status",
        )

    def validate_email(self, value):
        qs = Vendor.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A vendor with this email already exists.")
        return value.lower()

    def validate_gst_number(self, value):
        qs = Vendor.objects.filter(gst_number__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A vendor with this GST number already exists.")
        return value.upper()

    def validate_status(self, value):
        # Archived status must be set via the dedicated archive action, not directly.
        if value == Vendor.STATUS_ARCHIVED:
            raise serializers.ValidationError(
                "Use the archive action to archive a vendor."
            )
        return value

    def create(self, validated_data):
        request = self.context.get("request")
        vendor = Vendor(**validated_data)
        if request and request.user.is_authenticated:
            vendor.created_by = request.user
        vendor.save()

        # Write initial activity log
        VendorActivityLog.objects.create(
            vendor=vendor,
            action=VendorActivityLog.ACTION_CREATE,
            detail=f"Vendor {vendor.vendor_code} ({vendor.company_name}) created.",
            performed_by=request.user if request else None,
        )
        return vendor

    def update(self, instance, validated_data):
        request = self.context.get("request")
        old_status = instance.status

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Determine log action
        new_status = instance.status
        if old_status != new_status:
            action = VendorActivityLog.ACTION_STATUS
            detail = f"Status changed from '{old_status}' to '{new_status}'."
        else:
            action = VendorActivityLog.ACTION_UPDATE
            detail = f"Vendor {instance.vendor_code} ({instance.company_name}) updated."

        VendorActivityLog.objects.create(
            vendor=instance,
            action=action,
            detail=detail,
            performed_by=request.user if request else None,
        )
        return instance
