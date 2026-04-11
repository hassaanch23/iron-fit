# Iron Fit

Iron Fit is a full-stack fitness tracking app with:

- `mobile/`: Expo + React Native frontend
- `backend/`: FastAPI + SQLAlchemy backend

Current MVP includes:

- **Mobile auth:** Supabase (email/password + Google OAuth)
- **Backend:** FastAPI API; accepts **Supabase** access tokens when `SUPABASE_JWT_SECRET` is set, or **local** JWTs from `/auth/login`
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

### Backend environment variables (`backend/.env`)

| Variable | Required | Where to find it |
|----------|----------|------------------|
| `SECRET_KEY` | Yes (production) | Any long random string you generate (used only for **local** email/password JWT from `/auth/login`) |
| `DATABASE_URL` | Optional | Default `sqlite:///./ironfit.db`. For Postgres, use your host connection string |
| `GOOGLE_CLIENT_ID` | Optional | Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID (for `/auth/google` on the API) |
| `SUPABASE_JWT_SECRET` | Optional but **recommended** with Supabase mobile auth | **Supabase Dashboard** → **Project Settings** (gear) → **API** → scroll to **JWT Settings** → **JWT Secret** (long string; click “Reveal”). Same value signs user `access_token`s from the mobile app |

After adding `SUPABASE_JWT_SECRET`, run migrations so `users.supabase_sub` exists:

```bash
cd backend && source .venv/bin/activate && alembic upgrade head
```

How auth works on the API:

1. If `SUPABASE_JWT_SECRET` is set, `Authorization: Bearer <supabase_access_token>` is verified first; the user is created or linked by `sub` + `email`.
2. Otherwise the API expects your **local** JWT from `POST /auth/login` (subject = numeric user id).

### Optional: Alembic migration commands

Run from `backend` with the app on `PYTHONPATH` (or set `PYTHONPATH=.` in your shell):

```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. alembic upgrade head
```

If SQLite already has tables from an older setup but `alembic_version` is empty, either use a fresh `ironfit.db` or **stamp** the revision that matches your schema, then `upgrade head` (see Alembic docs for `alembic stamp`).

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

### Mobile environment (`mobile/.env`)

Copy `mobile/.env.example` to `mobile/.env`.

| Variable | Where to find it |
|----------|------------------|
| `EXPO_PUBLIC_SUPABASE_URL` | **Supabase Dashboard** → **Project Settings** → **API** → **Project URL** (e.g. `https://abcdefgh.supabase.co`) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Same page → **Project API keys** → **anon** / **public** (safe to put in the app; never use the **service_role** key in mobile) |
| `EXPO_PUBLIC_API_BASE_URL` (optional) | Your machine: `http://127.0.0.1:8000/api/v1`. **Simulator:** often `http://127.0.0.1:8000/api/v1` works. **Physical device:** use your computer’s LAN IP, e.g. `http://192.168.1.10:8000/api/v1` |

Example:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Restart Expo after changing `.env` (`npx expo start -- --clear`).

### Supabase redirect URLs (required for Google + deep links)

In **Supabase Dashboard → Authentication → URL configuration**:

1. **Site URL** (pick one primary entry point; you can change later):
   - Example: `mobile://auth/callback` or your production web URL.

2. **Redirect URLs** — add these so OAuth can return to the Expo app (`scheme` is `mobile` in `app.json`):

   | URL | Purpose |
   |-----|---------|
   | `mobile://**` | Covers all paths for the dev client / standalone app using scheme `mobile` |
   | `mobile://auth/callback` | Matches `makeRedirectUri({ scheme: 'mobile', path: 'auth/callback' })` |
   | `exp://**` | Expo Go (wildcard; add if your Supabase project allows `**` patterns) |
   | `exp://127.0.0.1:8081/--/**` | Expo Go on simulator (localhost) |
   | `exp://192.168.*.*:8081/--/**` | Not always supported as a pattern — if login fails on a physical device, open the app once and check Metro logs for the exact `exp://...` redirect, then add that **exact** URL |

**Google Cloud Console:** under your **Web** OAuth client, **Authorized redirect URIs** must include:

`https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

(That is Supabase’s callback, not your app scheme.)

**Tip:** Log `getAuthRedirectUri()` once from `mobile/lib/supabase.ts` in dev (`console.log`) and ensure that **exact** string appears in Supabase **Redirect URLs** if wildcards do not match.

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
