from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("procurement_officer", "Procurement Officer"),
        ("manager", "Manager"),
        ("vendor", "Vendor"),
    ]

    role = models.CharField(max_length=32, choices=ROLE_CHOICES, default="vendor")
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.username
