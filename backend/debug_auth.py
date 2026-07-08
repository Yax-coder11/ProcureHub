import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()
from django.test import Client
import json

c = Client()
data = {
    'username': 'vendor1',
    'email': 'vendor1@example.com',
    'password': 'StrongPass123!',
    'password_confirm': 'StrongPass123!',
    'first_name': 'Vendor',
    'last_name': 'One',
    'role': 'vendor',
}
r = c.post('/api/auth/register/', data=json.dumps(data), content_type='application/json')
print('STATUS', r.status_code)
print(r.content.decode())
