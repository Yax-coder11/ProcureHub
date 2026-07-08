import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()
from apps.authentication.serializers import LoginSerializer

s = LoginSerializer(data={'username': 'vendor1', 'password': 'Abc12345'})
print('valid', s.is_valid())
print(s.errors)
print(getattr(s, 'validated_data', None))
