# UniStay — Student Housing Platform

A full-stack student housing marketplace built with **Django REST Framework** + **React + Vite + Tailwind CSS**.

Landlords list properties. Students browse, book, pay rent, and submit maintenance requests. Both roles have dedicated dashboards that communicate through a shared REST API.

---

## Quick start (recommended)

### Mac / Linux
```bash
bash start.sh
```

### Windows
Double-click `start.bat` or run it from a terminal.

The script will:
1. Create a Python virtual environment and install all backend deps
2. Copy `.env.example` → `.env`
3. Run database migrations (SQLite by default — no setup needed)
4. Seed demo accounts and sample data
5. Start both servers concurrently

Then open **http://localhost:5173** in your browser.

---

## Demo accounts

| Role     | Username    | Password   |
|----------|-------------|------------|
| Student  | `student1`  | `demo1234` |
| Landlord | `landlord1` | `demo1234` |
| Student  | `student2`  | `demo1234` |
| Student  | `student3`  | `demo1234` |

---

## Manual setup

### Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env            # edit .env if needed

# Migrate and seed
python manage.py migrate
python manage.py seed_demo

# Run
python manage.py runserver
```

API available at `http://localhost:8000/api/v1/`  
Django admin at `http://localhost:8000/admin/`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`

---

## Project structure

```
unistay/
├── start.sh                    Mac/Linux one-command launcher
├── start.bat                   Windows one-command launcher
├── docker-compose.yml          Full Docker stack
│
├── backend/
│   ├── unistay/                Django project config
│   │   ├── settings.py         All settings (SQLite/Postgres toggle)
│   │   ├── urls.py             Root URL router
│   │   ├── exceptions.py       Consistent DRF error responses
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── users/                  Custom User model, auth, profile
│   ├── properties/             Property, Amenity, PropertyImage
│   ├── bookings/               Booking, Payment + signals
│   ├── maintenance/            MaintenanceRequest + signals
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api.js              Axios instance + named API helpers
    │   ├── App.jsx             Router + protected routes
    │   ├── context/
    │   │   └── AuthContext.jsx JWT auth state
    │   ├── hooks/
    │   │   ├── useApi.js       Generic data-fetching hook
    │   │   └── useForm.js      Controlled form state hook
    │   ├── components/
    │   │   ├── Topbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── LoadingScreen.jsx
    │   │   └── UI.jsx          Badge, StatCard, Toast, Field…
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Register.jsx
    │       ├── Browse.jsx
    │       ├── PropertyDetail.jsx
    │       ├── NotFound.jsx
    │       ├── student/        Overview, Lease, Payments,
    │       │                   Maintenance, Documents, Profile
    │       └── landlord/       Overview, AddProperty, Listings,
    │                           Bookings, Maintenance, Profile
    ├── index.html
    ├── package.json
    ├── vite.config.js          Proxies /api → localhost:8000
    ├── tailwind.config.js
    ├── nginx.conf              Production SPA + proxy config
    └── Dockerfile              Multi-stage build (Node → nginx)
```

---

## API reference

| Method        | Endpoint                              | Auth     | Description                          |
|---------------|---------------------------------------|----------|--------------------------------------|
| POST          | `/api/v1/auth/register/`              | Public   | Register, returns JWT                |
| POST          | `/api/v1/auth/login/`                 | Public   | Login, returns JWT                   |
| POST          | `/api/v1/auth/token/refresh/`         | Public   | Refresh access token                 |
| GET / PATCH   | `/api/v1/users/me/`                   | Any user | Get / update own profile             |
| GET           | `/api/v1/properties/`                 | Public   | Browse active listings               |
| POST          | `/api/v1/properties/`                 | Landlord | Create property                      |
| GET           | `/api/v1/properties/?search=nairobi`  | Public   | Search by title / city / university  |
| GET / PATCH / DELETE | `/api/v1/properties/<id>/`    | Mixed    | Property detail                      |
| POST          | `/api/v1/properties/<id>/images/`     | Landlord | Upload property photos               |
| GET / POST    | `/api/v1/bookings/`                   | Auth     | List own bookings / create           |
| GET / PATCH   | `/api/v1/bookings/<id>/`              | Auth     | Detail / accept / decline            |
| GET / POST    | `/api/v1/bookings/payments/`          | Auth     | List payments / record new           |
| POST          | `/api/v1/bookings/payments/<id>/confirm/` | Landlord | Confirm a payment                |
| GET / POST    | `/api/v1/maintenance/`                | Auth     | List / submit maintenance requests   |
| GET / PATCH   | `/api/v1/maintenance/<id>/`           | Auth     | Update status + technician note      |

---

## Docker (production-like)

```bash
docker-compose up --build
```

Opens on **http://localhost** (port 80).  
Includes PostgreSQL, Django with gunicorn, and nginx serving React.  
Demo data is seeded automatically on first boot.

### Environment variables for Docker

Create a `.env` file next to `docker-compose.yml`:

```env
SECRET_KEY=your-very-long-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,yourdomain.com
DB_PASSWORD=a-strong-database-password
```

---

## Key implementation details

### Authentication flow
1. User registers or logs in → Django returns JWT access (12h) + refresh (7d) tokens
2. Tokens stored in `localStorage` via `AuthContext`
3. `api.js` Axios instance attaches `Authorization: Bearer <token>` to every request
4. On 401, the interceptor silently refreshes using the refresh token; on failure it redirects to `/login`

### Role-based data isolation
- **Browse** — anyone can see `status=active` properties
- **Landlord** fetching `/api/v1/properties/` sees only their own listings
- **Bookings** — students see their own; landlords see bookings for their properties
- **Payments** — same split, linked through booking ownership
- **Maintenance** — students see their own requests; landlords see all requests on their properties

### Key user flows

| Action | Side effect |
|--------|-------------|
| Student books property | Creates `Booking` with `status=pending` |
| Landlord accepts booking | Sets `status=accepted`, calculates `lease_end_date`, marks property `occupied` |
| Student records payment | Creates `Payment` with `status=pending` |
| Landlord confirms payment | Sets `status=confirmed`, stamps `confirmed_at` |
| Student submits maintenance | Creates `MaintenanceRequest` linked to their active property |
| Landlord updates maintenance | Changes `status`, saves `technician_note`; resolved sets `resolved_at` |

### Signals
`bookings/signals.py` and `maintenance/signals.py` fire on every status change. Currently they print to the console — swap in `django-anymail`, Africa's Talking, or Firebase to send real email/SMS/push notifications without touching any view.
