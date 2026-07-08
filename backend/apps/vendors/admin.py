from django.contrib import admin
from django.utils.html import format_html

from .models import Vendor, VendorActivityLog, VendorCategory


# ── VendorCategory ────────────────────────────────────────────────────────

@admin.register(VendorCategory)
class VendorCategoryAdmin(admin.ModelAdmin):
    list_display  = ("name", "is_active", "vendor_count", "created_at")
    list_filter   = ("is_active",)
    search_fields = ("name",)
    ordering      = ("name",)

    @admin.display(description="Vendors")
    def vendor_count(self, obj):
        return obj.vendors.exclude(status=Vendor.STATUS_ARCHIVED).count()


# ── VendorActivityLog inline ──────────────────────────────────────────────

class VendorActivityLogInline(admin.TabularInline):
    model          = VendorActivityLog
    extra          = 0
    readonly_fields = ("action", "detail", "performed_by", "created_at")
    can_delete     = False

    def has_add_permission(self, request, obj=None):
        return False


# ── Vendor ────────────────────────────────────────────────────────────────

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display   = (
        "vendor_code",
        "company_name",
        "contact_person",
        "email",
        "phone",
        "category",
        "status_badge",
        "created_at",
    )
    list_filter    = ("status", "category", "country")
    search_fields  = (
        "vendor_code",
        "company_name",
        "contact_person",
        "email",
        "gst_number",
        "phone",
    )
    readonly_fields = ("vendor_code", "created_by", "created_at", "updated_at")
    ordering        = ("-created_at",)
    inlines         = [VendorActivityLogInline]

    fieldsets = (
        ("Identity", {
            "fields": (
                "vendor_code",
                "company_name",
                "contact_person",
                "email",
                "phone",
                "gst_number",
            ),
        }),
        ("Classification", {
            "fields": ("category", "status"),
        }),
        ("Address", {
            "fields": ("address", "city", "state", "country", "pincode"),
        }),
        ("Additional", {
            "fields": ("description", "website"),
            "classes": ("collapse",),
        }),
        ("Audit", {
            "fields": ("created_by", "created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    @admin.display(description="Status")
    def status_badge(self, obj):
        colours = {
            Vendor.STATUS_ACTIVE:      "#198754",   # green
            Vendor.STATUS_INACTIVE:    "#6c757d",   # grey
            Vendor.STATUS_BLACKLISTED: "#dc3545",   # red
            Vendor.STATUS_ARCHIVED:    "#adb5bd",   # light grey
        }
        colour = colours.get(obj.status, "#6c757d")
        label  = obj.get_status_display()
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:4px;font-size:0.8em">{}</span>',
            colour, label,
        )

    def save_model(self, request, obj, form, change):
        """Ensure created_by is set when saving via admin."""
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def delete_model(self, request, obj):
        """Block hard deletes from admin — archive instead."""
        obj.archive()

    def delete_queryset(self, request, queryset):
        """Block bulk deletes from admin — archive instead."""
        queryset.update(status=Vendor.STATUS_ARCHIVED)

    def get_actions(self, request):
        actions = super().get_actions(request)
        # Remove the default 'delete_selected' bulk action
        if "delete_selected" in actions:
            del actions["delete_selected"]
        return actions

    # ── Custom admin actions ──────────────────────────────────────────

    @admin.action(description="Archive selected vendors")
    def archive_vendors(self, request, queryset):
        count = queryset.exclude(status=Vendor.STATUS_ARCHIVED).count()
        queryset.exclude(status=Vendor.STATUS_ARCHIVED).update(
            status=Vendor.STATUS_ARCHIVED
        )
        self.message_user(request, f"{count} vendor(s) archived successfully.")

    @admin.action(description="Mark selected vendors as Active")
    def activate_vendors(self, request, queryset):
        count = queryset.exclude(status=Vendor.STATUS_ACTIVE).count()
        queryset.exclude(status=Vendor.STATUS_ACTIVE).update(
            status=Vendor.STATUS_ACTIVE
        )
        self.message_user(request, f"{count} vendor(s) activated successfully.")

    @admin.action(description="Blacklist selected vendors")
    def blacklist_vendors(self, request, queryset):
        count = queryset.exclude(status=Vendor.STATUS_BLACKLISTED).count()
        queryset.exclude(status=Vendor.STATUS_BLACKLISTED).update(
            status=Vendor.STATUS_BLACKLISTED
        )
        self.message_user(request, f"{count} vendor(s) blacklisted.")

    actions = [archive_vendors, activate_vendors, blacklist_vendors]


# ── VendorActivityLog (standalone view) ──────────────────────────────────

@admin.register(VendorActivityLog)
class VendorActivityLogAdmin(admin.ModelAdmin):
    list_display   = ("vendor", "action", "performed_by", "created_at")
    list_filter    = ("action",)
    search_fields  = ("vendor__vendor_code", "vendor__company_name", "detail")
    readonly_fields = ("vendor", "action", "detail", "performed_by", "created_at")
    ordering        = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
