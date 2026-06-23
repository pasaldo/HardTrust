@echo off
REM HardTrust Local Deployment Script (Windows)
REM Usage: deploy.bat

setlocal enabledelayedexpansion

echo ==============================
echo  HardTrust Deployment
echo ==============================

set PROJECT_ROOT=C:\Users\pablo\Desktop\proyectos\HardTrust
set BACKEND_DIR=%PROJECT_ROOT%\backend
set ML_DIR=%PROJECT_ROOT%\ml-service
set FRONTEND_DIR=%PROJECT_ROOT%\frontend

echo [1/4] Setting up backend...
cd /d %BACKEND_DIR%
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate
pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt
python manage.py migrate --run-syncdb
python manage.py collectstatic --noinput

echo [2/4] Setting up ML service...
cd /d %ML_DIR%
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate
pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt

echo [3/4] Building frontend for production...
cd /d %FRONTEND_DIR%
call npm ci
call npx ng build --configuration=production

echo [4/4] Starting services...
start "HardTrust-Backend" cmd /c "cd /d %BACKEND_DIR% && call venv\Scripts\activate && python -m uvicorn hardtrust_project.asgi:application --host 0.0.0.0 --port 8000"
start "HardTrust-ML" cmd /c "cd /d %ML_DIR% && call venv\Scripts\activate && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001"
start "HardTrust-Frontend" cmd /c "cd /d %FRONTEND_DIR% && npx http-server ./dist/frontend -p 4200 -c-1"

echo.
echo HardTrust deployed.
echo Backend:    http://127.0.0.1:8000
echo ML Service: http://127.0.0.1:8001
echo Frontend:   http://127.0.0.1:4200
pause
