from django.conf import settings
from django.db import models


class Vendor(models.Model):
    """
    Represents a registered vendor in the system.
    Linked to a User with role='vendor'.
    """

    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("pending", "Pending Approval"),
        ("rejected", "Rejected"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="vendor_profile",
        limit_choices_to={"role": "vendor"},
    )
    company_name = models.CharField(max_length=255)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=32, blank=True)
    address = models.TextField(blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Vendor"
        verbose_name_plural = "Vendors"
        ordering = ["-created_at"]

    def __str__(self):
        return self.company_name


class RFQ(models.Model):
    """
    Request for Quotation. Created by Procurement Officers.
    Assigned to Vendors who submit quotations.
    """

    STATUS_CHOICES = [
        ("open", "Open"),
        ("assigned", "Assigned"),
        ("quoted", "Quoted"),
        ("comparison_pending", "Comparison Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("closed", "Closed"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_rfqs",
        limit_choices_to={"role": "procurement_officer"},
    )
    assigned_vendor = models.ForeignKey(
        Vendor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_rfqs",
    )
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="open")
    deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "RFQ"
        verbose_name_plural = "RFQs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.status})"

    def advance_status(self):
        """Automatically progress status through the workflow."""
        workflow = {
            "open": "assigned",
            "assigned": "quoted",
            "quoted": "comparison_pending",
            "comparison_pending": "approved",
        }
        next_status = workflow.get(self.status)
        if next_status:
            self.status = next_status
            self.save(update_fields=["status", "updated_at"])


class Quotation(models.Model):
    """
    Submitted by a Vendor in response to an RFQ.
    """

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("submitted", "Submitted"),
        ("under_review", "Under Review"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]

    rfq = models.ForeignKey(RFQ, on_delete=models.CASCADE, related_name="quotations")
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="quotations")
    unit_price = models.DecimalField(max_digits=14, decimal_places=2)
    total_price = models.DecimalField(max_digits=14, decimal_places=2)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="draft")
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Quotation"
        verbose_name_plural = "Quotations"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Quotation by {self.vendor} for {self.rfq}"


class PurchaseOrder(models.Model):
    """
    Purchase Order raised after an approved RFQ/Quotation.
    Requires Manager approval.
    """

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("pending_approval", "Pending Approval"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("fulfilled", "Fulfilled"),
        ("cancelled", "Cancelled"),
    ]

    rfq = models.ForeignKey(
        RFQ,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="purchase_orders",
    )
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="purchase_orders")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_purchase_orders",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_purchase_orders",
        limit_choices_to={"role": "manager"},
    )
    po_number = models.CharField(max_length=64, unique=True)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Purchase Order"
        verbose_name_plural = "Purchase Orders"
        ordering = ["-created_at"]

    def __str__(self):
        return f"PO #{self.po_number} ({self.status})"

    def advance_status(self):
        """Automatically progress status through the workflow."""
        workflow = {
            "draft": "pending_approval",
            "pending_approval": "approved",
            "approved": "fulfilled",
        }
        next_status = workflow.get(self.status)
        if next_status:
            self.status = next_status
            self.save(update_fields=["status", "updated_at"])


class Invoice(models.Model):
    """
    Invoice raised against a Purchase Order.
    """

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("submitted", "Submitted"),
        ("pending_payment", "Pending Payment"),
        ("paid", "Paid"),
        ("overdue", "Overdue"),
        ("cancelled", "Cancelled"),
    ]

    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.CASCADE,
        related_name="invoices",
    )
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="invoices")
    invoice_number = models.CharField(max_length=64, unique=True)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Invoice"
        verbose_name_plural = "Invoices"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Invoice #{self.invoice_number} ({self.status})"
