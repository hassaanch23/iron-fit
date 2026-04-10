# Iron Fit

This repository is initialized with:

- `mobile/`: React Native app using Expo
- `backend/`: Python backend using FastAPI

## Prerequisites

- Node.js 18+ (recommended 20+)
- Python 3.10+
- Expo Go app on iOS/Android simulator or physical device

## Mobile Setup (React Native)

```bash
cd mobile
npm install
npm run start
```

Then press:

- `i` for iOS simulator
- `a` for Android emulator
- `w` for web

## Backend Setup (Python)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Test endpoints:

- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`

## Project Structure

```text
iron-fit/
├── backend/
│   ├── app/
│   │   └── main.py
│   └── requirements.txt
└── mobile/
```
