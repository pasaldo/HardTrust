@echo off
REM HardTrust Production Start Script (Windows)
REM Usage: start_prod.bat

setlocal enabledelayedexpansion

echo ==============================
echo  HardTrust Production Start
echo ==============================

set PROJECT_ROOT=%~dp0..
set BACKEND_DIR=%PROJECT_ROOT%\backend
set ML_DIR=%PROJECT_ROOT%\ml-service
set FRONTEND_DIR=%PROJECT_ROOT%\frontend

echo [1/4] Starting backend...
start "HardTrust-Backend" cmd /c "cd /d %BACKEND_DIR% && call venv\Scripts\activate && python -m uvicorn hardtrust_project.asgi:application --host 0.0.0.0 --port 8000 --workers 4"

echo [2/4] Starting ML service...
start "HardTrust-ML" cmd /c "cd /d %ML_DIR% && call venv\Scripts\activate && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 2"

echo [3/4] Building frontend for production...
cd /d %FRONTEND_DIR%
call npm install
call npx ng build --configuration=production

echo [4/4] Starting frontend server...
start "HardTrust-Frontend" cmd /c "cd /d %FRONTEND_DIR% && npx http-server ./dist/frontend -p 4200 -c-1"

echo.
echo HardTrust is starting in production mode.
echo Backend:    http://127.0.0.1:8000
echo ML Service: http://127.0.0.1:8001
echo Frontend:   http://127.0.0.1:4200
pause
