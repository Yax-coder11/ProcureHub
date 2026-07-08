import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
User = get_user_model()

user = User.objects.filter(username='vendor1').first()
print('user', user)
if user:
    print('check_password', user.check_password('Abc12345'))
    print('authenticate', authenticate(username='vendor1', password='Abc12345'))
