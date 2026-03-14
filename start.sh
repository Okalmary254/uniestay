#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# UniStay — local dev quick-start
#
# Usage:  bash start.sh
#
# What it does:
#   1. Creates a Python venv, installs backend deps
#   2. Copies .env.example → .env  (if .env doesn't exist)
#   3. Runs migrations + seeds demo data
#   4. Installs frontend npm packages
#   5. Starts both servers in parallel (Django :8000, Vite :5173)
#
# Prerequisites: Python 3.10+, Node 18+
# ─────────────────────────────────────────────────────────────────────────────
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[UniStay]${NC} $1"; }
warn()  { echo -e "${YELLOW}[UniStay]${NC} $1"; }
error() { echo -e "${RED}[UniStay]${NC} $1"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$SCRIPT_DIR/backend"
FRONTEND="$SCRIPT_DIR/frontend"

# ── Check prerequisites ───────────────────────────────────────────────────────
command -v python3 &>/dev/null || error "Python 3 is required. Install from https://python.org"
command -v node    &>/dev/null || error "Node.js is required. Install from https://nodejs.org"
command -v npm     &>/dev/null || error "npm is required (comes with Node.js)"

PYTHON_VERSION=$(python3 -c "import sys; print(sys.version_info.minor)")
if [ "$PYTHON_VERSION" -lt 10 ]; then
  error "Python 3.10+ required. Found Python 3.$PYTHON_VERSION"
fi

# ── Backend setup ─────────────────────────────────────────────────────────────
info "Setting up Django backend..."
cd "$BACKEND"

if [ ! -d "venv" ]; then
  info "Creating virtual environment..."
  python3 -m venv venv
fi

# Activate venv
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null || \
  error "Could not activate virtual environment"

info "Installing Python dependencies..."
pip install --upgrade pip -q
pip install -r requirements.txt -q

if [ ! -f ".env" ]; then
  info "Creating .env from .env.example..."
  cp .env.example .env
fi

info "Running database migrations..."
python manage.py migrate --noinput

info "Seeding demo data..."
python manage.py seed_demo 2>/dev/null || warn "Demo data already seeded or seed failed (non-fatal)"

deactivate

# ── Frontend setup ────────────────────────────────────────────────────────────
info "Setting up React frontend..."
cd "$FRONTEND"

if [ ! -d "node_modules" ]; then
  info "Installing npm packages (this may take a minute)..."
  npm install --silent
else
  info "node_modules found, skipping npm install"
fi

# ── Launch both servers ───────────────────────────────────────────────────────
info ""
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info "  Starting UniStay development servers..."
info ""
info "  Frontend  →  http://localhost:5173"
info "  Backend   →  http://localhost:8000"
info "  Admin     →  http://localhost:8000/admin"
info ""
info "  Demo accounts:"
info "    Student   username: student1   password: demo1234"
info "    Landlord  username: landlord1  password: demo1234"
info ""
info "  Press Ctrl+C to stop both servers"
info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
info ""

# Start Django in background
cd "$BACKEND"
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
python manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!

# Start Vite in foreground
cd "$FRONTEND"
npm run dev &
VITE_PID=$!

# Trap Ctrl+C and kill both
trap "info 'Shutting down...'; kill $DJANGO_PID $VITE_PID 2>/dev/null; exit 0" INT TERM

# Wait for either to exit
wait $DJANGO_PID $VITE_PID
