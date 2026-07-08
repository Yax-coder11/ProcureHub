import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()
from apps.authentication.serializers import RegisterSerializer


data = {'username':'vendor1','email':'vendor1@example.com','password':'Abc12345','password_confirm':'Abc12345','first_name':'Vendor','last_name':'One','role':'vendor'}
serializer = RegisterSerializer(data=data)
print('is_valid', serializer.is_valid())
print(serializer.errors)
if serializer.is_valid():
    user = serializer.save()
    print('created', user)
    print('password_ok', user.check_password('Abc12345'))
