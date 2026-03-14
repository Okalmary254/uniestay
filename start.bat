@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM UniStay — Windows local dev quick-start
REM Run this file by double-clicking or: start.bat
REM Prerequisites: Python 3.10+, Node 18+
REM ─────────────────────────────────────────────────────────────────────────────

setlocal
set SCRIPT_DIR=%~dp0
set BACKEND=%SCRIPT_DIR%backend
set FRONTEND=%SCRIPT_DIR%frontend

echo.
echo  [UniStay] Setting up backend...
cd /d "%BACKEND%"

if not exist "venv" (
    echo  [UniStay] Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

echo  [UniStay] Installing Python dependencies...
pip install --upgrade pip -q
pip install -r requirements.txt -q

if not exist ".env" (
    echo  [UniStay] Creating .env from .env.example...
    copy .env.example .env
)

echo  [UniStay] Running migrations...
python manage.py migrate --noinput

echo  [UniStay] Seeding demo data...
python manage.py seed_demo 2>nul

echo.
echo  [UniStay] Setting up frontend...
cd /d "%FRONTEND%"

if not exist "node_modules" (
    echo  [UniStay] Installing npm packages...
    npm install
)

echo.
echo  ═══════════════════════════════════════════════════
echo    UniStay is starting...
echo.
echo    Frontend  -^>  http://localhost:5173
echo    Backend   -^>  http://localhost:8000
echo    Admin     -^>  http://localhost:8000/admin
echo.
echo    Student   username: student1   password: demo1234
echo    Landlord  username: landlord1  password: demo1234
echo.
echo    Two windows will open. Close both to stop.
echo  ═══════════════════════════════════════════════════
echo.

REM Start Django in a new window
cd /d "%BACKEND%"
start "UniStay Backend" cmd /k "call venv\Scripts\activate.bat && python manage.py runserver"

REM Start Vite in a new window
cd /d "%FRONTEND%"
start "UniStay Frontend" cmd /k "npm run dev"

echo  [UniStay] Both servers launching in separate windows.
echo  [UniStay] Open http://localhost:5173 in your browser.
pause
