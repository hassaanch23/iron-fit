# Iron Fit

Iron Fit is a full-stack fitness tracking app with:

- `mobile/`: Expo + React Native frontend
- `backend/`: FastAPI + SQLAlchemy backend

Current MVP includes:

- Email/password auth + Google sign-in endpoint
- Onboarding/profile flow
- Activity logging
- Dashboard aggregates and history insights

## Prerequisites

- Node.js 18+ (20+ recommended)
- Python 3.10+
- Expo Go app and/or simulator

## Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Backend Environment Variables

`backend/.env` supports:

- `SECRET_KEY`: JWT signing secret
- `DATABASE_URL`: default `sqlite:///./ironfit.db`
- `GOOGLE_CLIENT_ID`: OAuth client id used for Google ID token validation

### Optional: Alembic Migration Commands

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

### Optional: Seed Demo Data

```bash
cd backend
source .venv/bin/activate
python scripts/seed_demo_data.py
```

Demo seed credentials:

- Email: `demo@ironfit.app`
- Password: `DemoPass123!`

## Mobile Setup

```bash
cd mobile
npm install
npm run start
```

Then use:

- `i` for iOS simulator
- `a` for Android emulator
- `w` for web

### Mobile Environment Variables

Create `mobile/.env` and add:

```bash
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

API base URL defaults to `http://127.0.0.1:8000/api/v1`.
To override, set `expo.extra.apiBaseUrl` in `mobile/app.json`.

## API Endpoint Catalog

Base prefix: `/api/v1`

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/google`
- `GET /auth/me`
- `GET /profile`
- `PUT /profile`
- `POST /activities`
- `GET /activities`
- `DELETE /activities/{activity_id}`
- `GET /analytics/dashboard`
- `GET /analytics/history?timeframe=week|month`

Health/documentation endpoints:

- `GET /health`
- `GET /docs`

## Project Structure

```text
iron-fit/
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── schemas.py
│   │   └── main.py
│   ├── scripts/
│   └── requirements.txt
└── mobile/
    ├── app/
    ├── components/
    ├── context/
    ├── constants/
    ├── lib/
    └── types/
```
