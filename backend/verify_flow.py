import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()
from django.test import Client
import json

c = Client()
reg = c.post('/api/auth/register/', data=json.dumps({'username':'vendor2','email':'vendor2@example.com','password':'Abc12345','password_confirm':'Abc12345','first_name':'Vendor','last_name':'Two','role':'vendor'}), content_type='application/json')
print('reg', reg.status_code, reg.content.decode())
login = c.post('/api/auth/login/', data=json.dumps({'username':'vendor2','password':'Abc12345'}), content_type='application/json')
print('login', login.status_code, login.content.decode())
