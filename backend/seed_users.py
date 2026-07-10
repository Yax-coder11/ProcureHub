import os
import sys

backend_dir = r"d:\sem4KaProject\ProcureHub\backend"
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

test_users = [
    {
        "username": "admin",
        "email": "admin@procurehub.com",
        "password": "Abc12345",
        "first_name": "Admin",
        "last_name": "User",
        "role": "admin",
        "is_superuser": True,
        "is_staff": True
    },
    {
        "username": "officer1",
        "email": "officer1@procurehub.com",
        "password": "Abc12345",
        "first_name": "Procurement",
        "last_name": "Officer",
        "role": "procurement_officer"
    },
    {
        "username": "manager1",
        "email": "manager1@procurehub.com",
        "password": "Abc12345",
        "first_name": "Manager",
        "last_name": "User",
        "role": "manager"
    },
    {
        "username": "vendor1",
        "email": "vendor1@example.com",
        "password": "Abc12345",
        "first_name": "Vendor",
        "last_name": "One",
        "role": "vendor"
    }
]

print("Seeding test users...")
for user_data in test_users:
    username = user_data["username"]
    password = user_data.pop("password")
    user, created = User.objects.get_or_create(username=username, defaults=user_data)
    if created:
        user.set_password(password)
        user.save()
        print(f"Created user '{username}' with role '{user.role}'")
    else:
        # update password to ensure it's correct
        user.set_password(password)
        # update fields
        for k, v in user_data.items():
            setattr(user, k, v)
        user.save()
        print(f"Updated user '{username}' with role '{user.role}'")

print("Seeding complete!")
