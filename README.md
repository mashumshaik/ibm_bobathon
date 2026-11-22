# Prajaakeeya+ 🗳️

An extended civic engagement platform for Bengaluru residents — built on top of [prajaakeeya.org](https://prajaakeeya.org).

## What's New

| Feature | Description |
|---------|-------------|
| **Upvote Priority Queue** | Issues float to the top by community votes; MLAs see a ranked ward action list |
| **Duplicate Detection** | Tag + category + AI embedding (OpenAI) matching surfaces similar reports |
| **Gamification** | Points, badges, and ward leaderboards for civic participation |

## Stack

- **Backend:** Python + FastAPI + SQLAlchemy
- **Database:** PostgreSQL + pgvector
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Auth:** Phone OTP + JWT (OTP logged to console in DEBUG mode)
- **AI:** OpenAI `text-embedding-3-small` (optional — tag-only fallback if no key)

## Quickstart

```bash
# 1. Copy and configure environment
cp .env.example .env
# Fill in JWT_SECRET; leave OPENAI_API_KEY blank for tag-only duplicate detection

# 2. Start everything
docker-compose up --build

# 3. Open the app
open http://localhost:5173

# 4. Login
# Enter any Indian phone number (10 digits, starts with 6-9)
# OTP is printed to backend logs: docker-compose logs -f backend

# 5. Explore
# - Post an issue (set your ward first)
# - Upvote issues from the feed
# - Check the ward dashboard for the MLA priority view
# - See the leaderboard
```

## Development (without Docker)

```bash
# Backend
cd backend
pip install -r requirements.txt
export DATABASE_URL=postgresql://localhost/prajaakeeya
export DEBUG=true
export JWT_SECRET=dev-secret
python db/seed.py        # seed 243 Bengaluru wards
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev              # http://localhost:5173
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP, get JWT |
| GET | `/api/auth/me` | Current user profile |
| GET | `/api/wards` | All 243 Bengaluru wards |
| GET | `/api/wards/{id}/priority-feed` | Ward MLA priority queue |
| GET | `/api/wards/{id}/stats` | Ward statistics |
| POST | `/api/issues` | Create issue (auth required) |
| GET | `/api/issues` | Paginated issue feed |
| GET | `/api/issues/{id}` | Issue detail |
| POST | `/api/issues/{id}/vote` | Upvote |
| DELETE | `/api/issues/{id}/vote` | Remove upvote |
| GET | `/api/leaderboard/global` | Global top 10 |
| GET | `/api/leaderboard?ward_id=` | Ward top 10 |

## Smoke Tests

```bash
cd backend
pytest tests/test_smoke.py -v
```

## Architecture

```
React Frontend (Vite + Tailwind)
        │ /api/*
FastAPI Backend (Python)
        │
PostgreSQL + pgvector ←→ OpenAI Embeddings (async background)
```
