# ProcureHub

ProcureHub is a professional procurement and vendor management ERP platform foundation built with React 19 + Vite on the frontend and Django + Django REST Framework on the backend.

## 1. Project structure

```text
ProcureHub/
├── backend/
│   ├── apps/
│   ├── core/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layout/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## 2. Installation commands (Windows PowerShell)

### Step 1: Enter the project directory
```powershell
cd D:\ProcureHub
```
Explanation: This moves you into the root folder for ProcureHub.

### Step 2: Create a Python virtual environment
```powershell
py -m venv .venv
```
Explanation: This creates an isolated Python environment so dependencies do not affect the global Python installation.

### Step 3: Activate the virtual environment
```powershell
.\.venv\Scripts\Activate.ps1
```
Explanation: This activates the environment so the next Python and pip commands use the project-specific packages.

### Step 4: Upgrade pip
```powershell
python -m pip install --upgrade pip
```
Explanation: This ensures pip is current before installing Django and other packages.

### Step 5: Create the backend and frontend folders
```powershell
mkdir backend, frontend
```
Explanation: This creates the separation between the server-side and client-side code.

### Step 6: Install backend packages
```powershell
pip install Django djangorestframework django-cors-headers djangorestframework-simplejwt pandas
```
Explanation: These packages provide the Django web framework, REST API support, JWT authentication, CORS support, and data handling.

### Step 7: Save backend dependencies
```powershell
pip freeze > backend\requirements.txt
```
Explanation: This records the installed packages for reproducible setup on another machine.

### Step 8: Create the Django project
```powershell
django-admin startproject core backend
```
Explanation: This generates the Django project structure inside the backend folder.

### Step 9: Create the React project
```powershell
cd frontend
npm create vite@latest . -- --template react
```
Explanation: This creates the React + Vite application shell for the frontend.

### Step 10: Install frontend packages
```powershell
npm install
npm install axios bootstrap react-router-dom
```
Explanation: This installs the Vite build tool, React dependencies, API client, styling framework, and routing library.

## 3. Required pip packages

```text
Django
 djangorestframework
 django-cors-headers
 djangorestframework-simplejwt
 pandas
```

## 4. Required npm packages

```text
react
react-dom
react-router-dom
axios
bootstrap
vite
@vitejs/plugin-react
```

## 5. Virtual environment creation

Use:
```powershell
py -m venv .venv
```

## 6. React project creation

Use:
```powershell
cd frontend
npm create vite@latest . -- --template react
```

## 7. Django project creation

Use:
```powershell
cd ..
django-admin startproject core backend
```

## 8. Apps to create

The initial architecture reserves the following app space for future ERP modules:

```text
backend/apps/
```

Future apps should be created here, for example:
- procurement
- vendors
- inventory
- approvals
- accounts
- reports

## 9. Required settings.py changes

The generated backend settings include:
- Django project configuration
- SQLite database configuration
- REST Framework configuration
- JWT authentication configuration
- CORS configuration
- static files configuration

## 10. JWT setup

JWT is enabled through:
- rest_framework_simplejwt
- REST_FRAMEWORK authentication classes
- SIMPLE_JWT configuration for access and refresh tokens

## 11. CORS setup

CORS is configured for the frontend dev server at:
```text
http://localhost:5173
```

## 12. SQLite configuration

The default database is configured as:
```python
BASE_DIR / "db.sqlite3"
```

## 13. Clean folder structure

The project is organized so the backend and frontend remain separated and future ERP modules can be added cleanly.

## 14. Git initialization

Use:
```powershell
git init
```

## 15. Recommended .gitignore

A standard Python and Node ignore file is included at the repository root.

## 16. Recommended requirements.txt

The backend dependency list is stored in:
```text
backend/requirements.txt
```

## 17. Recommended package.json dependencies

The frontend dependency list is stored in:
```text
frontend/package.json
```

## 18. Professional project architecture

The architecture is designed around a clean separation of concerns:
- frontend consumes backend APIs only
- backend owns all workflow logic
- database is the single source of truth
- future ERP modules can be added under backend/apps and frontend/src/pages or src/features
