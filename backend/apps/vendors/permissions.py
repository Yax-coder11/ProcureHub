from rest_framework.permissions import BasePermission, SAFE_METHODS


class VendorModulePermission(BasePermission):
    """
    Permission matrix for the Vendor Management module:

      Admin              — full CRUD + archive
      Procurement Officer — full CRUD + archive
      Manager            — read-only (GET, HEAD, OPTIONS)
      Vendor (user role) — no access
    """

    FULL_ACCESS_ROLES = {"admin", "procurement_officer"}
    READ_ONLY_ROLES   = {"manager"}

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        role = getattr(request.user, "role", None)

        if role in self.FULL_ACCESS_ROLES:
            return True

        if role in self.READ_ONLY_ROLES:
            return request.method in SAFE_METHODS

        # vendor role and any unknown role — no access
        return False
