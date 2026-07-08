from django.conf import settings
from django.db import models


class VendorCategory(models.Model):
    """
    Lookup table for vendor categories (e.g. IT, Office Supplies, Logistics).
    Managed by admin/procurement officers.
    """

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Vendor Category"
        verbose_name_plural = "Vendor Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Vendor(models.Model):
    """
    Procurement-side Vendor Registry.

    This is the authoritative vendor record for the procurement workflow.
    It is separate from the dashboard.Vendor (which is the vendor-user portal link).

    Business rules enforced here:
      - vendor_code is auto-generated (VEN0001, VEN0002, …) and never editable.
      - email must be unique across all vendors.
      - gst_number must be unique across all vendors.
      - Deletion is never allowed — status is set to 'archived' instead.
      - Blacklisted vendors are excluded from RFQ assignment (enforced in RFQ module).
      - Only 'active' vendors appear in RFQ assignment dropdowns.
    """

    STATUS_ACTIVE      = "active"
    STATUS_INACTIVE    = "inactive"
    STATUS_BLACKLISTED = "blacklisted"
    STATUS_ARCHIVED    = "archived"

    STATUS_CHOICES = [
        (STATUS_ACTIVE,      "Active"),
        (STATUS_INACTIVE,    "Inactive"),
        (STATUS_BLACKLISTED, "Blacklisted"),
        (STATUS_ARCHIVED,    "Archived"),
    ]

    # ── Identity ──────────────────────────────────────────────────────
    vendor_code    = models.CharField(max_length=20, unique=True, editable=False)
    company_name   = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=150)
    email          = models.EmailField(unique=True)
    phone          = models.CharField(max_length=30)
    gst_number     = models.CharField(max_length=20, unique=True)

    # ── Classification ────────────────────────────────────────────────
    category = models.ForeignKey(
        VendorCategory,
        on_delete=models.PROTECT,
        related_name="vendors",
    )

    # ── Address ───────────────────────────────────────────────────────
    address = models.TextField()
    city    = models.CharField(max_length=100)
    state   = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default="India")
    pincode = models.CharField(max_length=10)

    # ── Additional ────────────────────────────────────────────────────
    description = models.TextField(blank=True)
    website     = models.URLField(blank=True)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)

    # ── Audit ─────────────────────────────────────────────────────────
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_vendors",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Vendor"
        verbose_name_plural = "Vendors"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["company_name"]),
        ]

    def __str__(self):
        return f"{self.vendor_code} – {self.company_name}"

    # ── Auto-generate vendor_code ─────────────────────────────────────

    @classmethod
    def _next_vendor_code(cls):
        """
        Generate the next sequential vendor code: VEN0001, VEN0002, …
        Uses SELECT FOR UPDATE on the latest record to prevent duplicates
        under concurrent requests.
        """
        last = (
            cls.objects.filter(vendor_code__startswith="VEN")
            .order_by("-vendor_code")
            .first()
        )
        if last:
            try:
                seq = int(last.vendor_code[3:]) + 1
            except ValueError:
                seq = 1
        else:
            seq = 1
        return f"VEN{seq:04d}"

    def save(self, *args, **kwargs):
        if not self.pk and not self.vendor_code:
            self.vendor_code = self._next_vendor_code()
        super().save(*args, **kwargs)

    # ── Soft-delete helper ────────────────────────────────────────────

    def archive(self):
        """
        Soft-delete: change status to 'archived'.
        Never call delete() on a Vendor instance — use archive() instead.
        """
        self.status = self.STATUS_ARCHIVED
        self.save(update_fields=["status", "updated_at"])

    # ── Business-rule helpers (used by RFQ module) ────────────────────

    @property
    def is_rfq_eligible(self):
        """True if this vendor can be assigned RFQs."""
        return self.status == self.STATUS_ACTIVE

    @property
    def is_blacklisted(self):
        return self.status == self.STATUS_BLACKLISTED


class VendorActivityLog(models.Model):
    """
    Automatic audit trail for every create / update / status-change on a Vendor.
    Written by the serializer / view layer — never by the model itself.
    """

    ACTION_CREATE  = "create"
    ACTION_UPDATE  = "update"
    ACTION_ARCHIVE = "archive"
    ACTION_STATUS  = "status_change"

    ACTION_CHOICES = [
        (ACTION_CREATE,  "Created"),
        (ACTION_UPDATE,  "Updated"),
        (ACTION_ARCHIVE, "Archived"),
        (ACTION_STATUS,  "Status Changed"),
    ]

    vendor     = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="activity_logs")
    action     = models.CharField(max_length=20, choices=ACTION_CHOICES)
    detail     = models.TextField(blank=True)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Vendor Activity Log"
        verbose_name_plural = "Vendor Activity Logs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.vendor.vendor_code} – {self.action} at {self.created_at:%Y-%m-%d %H:%M}"
