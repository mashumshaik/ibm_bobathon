# Prajaakeeya+ — Extended Civic Platform Plan

## Overview

**Goal:** Extend and improve upon the existing [prajaakeeya.org](https://prajaakeeya.org) platform
(source: [prajaakeeya-frontend](https://github.com/prajaakeeya/prajaakeeya-frontend) +
[prajaakeeya-backend](https://github.com/prajaakeeya/prajaakeeya-backend)) with three core
differentiators that make civic engagement more transparent, fun, and effective for Bengaluru residents.

**What prajaakeeya already has (do not rebuild, only extend):**
- Issue posting by area
- Area aspirants & all-aspirants listing
- Real-time issue status tracking

**What we are adding:**
1. **Upvote-driven priority queue** — issues float to the top by community votes; MLA sees a ranked ward action list
2. **Duplicate detection** — tag+category+ward+time-window matching combined with LLM semantic similarity (embeddings)
3. **Gamification** — points, badges, and ward leaderboards for civic participation

**Target repo:** `ibm_bobathon`

**Stack:**
- **Backend:** Python + FastAPI (async, RESTful)
- **Database:** PostgreSQL + pgvector extension (relational + vector search for duplicates)
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Auth:** Phone OTP (Indian numbers) + JWT
- **AI/Embeddings:** OpenAI `text-embedding-3-small` stored in pgvector (falls back to tag-only if no API key)
- **Infra:** Docker Compose (single `docker-compose.yml` for local dev)

**Non-goals for this prototype:**
- MLA login portal (static seed data only — 243 BBMP wards → MLA mapping)
- Native mobile app
- File/photo uploads (URL reference only)
- Multi-city support

---

## Architecture

```
┌────────────────────────────────────────┐
│           React Frontend               │
│  Feed · Post · Ward · Leaderboard      │
└──────────────┬─────────────────────────┘
               │ REST/JSON  (/api/*)
┌──────────────▼─────────────────────────┐
│        FastAPI Backend (Python)        │
│  /auth  /issues  /votes  /wards        │
│  /leaderboard  /users  /duplicates     │
└──────┬─────────────────────────────────┘
       │
┌──────▼──────────────────┐   ┌─────────────────────┐
│  PostgreSQL + pgvector  │   │  OpenAI Embeddings  │
│  issues, users, votes,  │   │  (async background) │
│  wards, badges, MLAs    │   └─────────────────────┘
└─────────────────────────┘
```

---

## Sub-Tasks

---

### Sub-Task 1 — Audit Existing Prajaakeeya Repos & Define Integration Points

**Status:** `[ ] pending`

**Intent:**
Before writing any new code, read the existing `prajaakeeya-frontend` and `prajaakeeya-backend`
repositories to understand their data models, API contracts, component structure, and tech stack.
This prevents duplicating work and ensures new features extend existing patterns cleanly.

**Expected Outcomes:**
- A short `AUDIT.md` file in the repo documenting: existing API routes, DB models/schema,
  frontend component tree, and auth mechanism
- A clear list of files/models to extend vs leave untouched
- Stack confirmed (e.g. what DB ORM they use, what frontend framework/state library)

**Todo List:**
1. Clone both repos locally and read directory structure
2. Read `prajaakeeya-backend`: `README.md`, models/schema files, routes/controllers, auth implementation, DB migrations
3. Read `prajaakeeya-frontend`: `README.md`, `package.json`, page components, API client, state management approach
4. Document existing endpoints: list all `GET`/`POST`/`PATCH`/`DELETE` routes found
5. Document existing DB tables/models (fields and relationships)
6. Identify auth mechanism (JWT? session? OAuth?)
7. Write `AUDIT.md` summarising findings with sections: Stack, Models, Routes, Frontend Pages, Integration Points
8. Based on audit, update Sub-Tasks 2–8 if stack differs from assumptions in this plan

**Relevant Context:**
- Repos: `https://github.com/prajaakeeya/prajaakeeya-frontend` and `https://github.com/prajaakeeya/prajaakeeya-backend`
- Key things to look for in backend: `models.py` / `schema.py` / migration files / `requirements.txt`
- Key things to look for in frontend: `package.json` / `src/pages/` / `src/api/` or `src/services/`

---

### Sub-Task 2 — Project Scaffolding & Docker Setup

**Status:** `[ ] pending`

**Intent:**
Set up the monorepo folder structure for the new features inside `ibm_bobathon`, wire up Docker
Compose with PostgreSQL+pgvector, FastAPI backend, and React frontend, so every subsequent
sub-task has a consistent local dev environment.

**Expected Outcomes:**
- `docker-compose up --build` starts DB, backend, and frontend with no errors
- `GET /api/health` returns `{"status": "ok"}`
- Frontend loads at `localhost:5173`
- `.env.example` documents all required environment variables

**Todo List:**
1. Create folder structure in repo root:
   ```
   backend/
     app/
       routers/
       models/
       schemas/
       services/
       db/
     main.py
     requirements.txt
     alembic.ini
   frontend/
     src/
       pages/
       components/
       api/
     package.json
     vite.config.ts
   docker-compose.yml
   .env.example
   README.md
   ```
2. Write `backend/main.py` with FastAPI app, CORS config, router registration, and `/api/health` endpoint
3. Write `backend/requirements.txt` with: `fastapi`, `uvicorn`, `sqlalchemy`, `alembic`, `psycopg2-binary`, `pgvector`, `python-jose`, `passlib`, `httpx`, `openai`, `python-dotenv`
4. Write `frontend/package.json` with React 18, Vite, TypeScript, Tailwind CSS, React Router v6, TanStack Query
5. Write `docker-compose.yml` with services:
   - `db`: `postgres:16` image, with `pgvector` extension, volume mount, healthcheck
   - `backend`: FastAPI via `uvicorn`, depends on `db`, env vars from `.env`
   - `frontend`: Vite dev server, proxy `/api` → `http://backend:8000`
6. Write `backend/db/init.sql`: `CREATE EXTENSION IF NOT EXISTS vector;`
7. Write `.env.example`:
   ```
   DATABASE_URL=postgresql://postgres:postgres@db:5432/prajaakeeya
   OPENAI_API_KEY=sk-...
   JWT_SECRET=changeme
   OTP_PROVIDER_KEY=
   DEBUG=true
   CORS_ORIGIN=http://localhost:5173
   ```
8. Write `frontend/vite.config.ts` with proxy config: `/api` → `http://localhost:8000`

**Relevant Context:**
- pgvector Docker image: use `postgres:16` and install pgvector via init SQL or use `pgvector/pgvector:pg16`
- FastAPI lifespan for DB pool init: use `asynccontextmanager` on `lifespan` param

---

### Sub-Task 3 — Database Schema & Bengaluru Ward Seed Data

**Status:** `[ ] pending`

**Intent:**
Define the full PostgreSQL schema for all new features — wards, users, issues, votes, duplicate
links, badges — and seed all 243 Bengaluru BBMP wards with their MLA constituency data from
public records.

**Expected Outcomes:**
- Alembic migration creates all tables cleanly
- `python seed.py` populates 243 wards + MLA records
- `GET /api/wards` returns full ward list with MLA info
- pgvector `embedding` column exists on `issues` table

**Todo List:**
1. Define SQLAlchemy ORM models in `backend/app/models/`:
   - `Ward`: `id`, `name`, `zone`, `constituency`, `mla_name`, `mla_party`, `mla_contact`
   - `User`: `id`, `phone` (unique), `name`, `ward_id` (FK→Ward), `points`, `is_verified`, `created_at`
   - `Issue`: `id`, `title`, `description`, `category` (enum), `ward_id` (FK→Ward), `reporter_id` (FK→User), `status` (enum: `open/in_progress/resolved`), `upvote_count`, `has_duplicates`, `embedding` (vector 1536), `created_at`, `updated_at`
   - `Vote`: `id`, `user_id` (FK→User), `issue_id` (FK→Issue), `created_at` — unique constraint on `(user_id, issue_id)`
   - `DuplicateLink`: `id`, `source_issue_id` (FK→Issue), `target_issue_id` (FK→Issue), `similarity_score`, `method` (enum: `tag_match/semantic`)
   - `Badge`: `id`, `user_id` (FK→User), `badge_type` (enum), `awarded_at`
2. Write Alembic `env.py` and generate initial migration
3. Create `backend/data/bengaluru_wards.json` — compile all 243 BBMP wards with zone, constituency, MLA name + party from public BBMP/KA Election Commission data
4. Write `backend/db/seed.py` to load `bengaluru_wards.json` and upsert into `Ward` table
5. Add `GET /api/wards` and `GET /api/wards/{ward_id}` router endpoints

**Relevant Context:**
- pgvector SQLAlchemy column: `from pgvector.sqlalchemy import Vector` → `Column(Vector(1536))`
- Issue category enum values: `ROADS`, `WATER`, `ELECTRICITY`, `GARBAGE`, `PARKS`, `SAFETY`, `DRAINAGE`, `OTHER`
- BBMP has 243 wards across 4 zones; wards map to 28 assembly constituencies (not 1:1 with MLAs)
- Public data source: Karnataka Election Commission website / BBMP ward list

---

### Sub-Task 4 — Phone OTP Authentication

**Status:** `[ ] pending`

**Intent:**
Implement phone-number-based OTP auth so every upvote and issue post is tied to a verified
Bengaluru resident, preventing fake votes and linking issues to real wards.

**Expected Outcomes:**
- `POST /api/auth/send-otp` accepts an Indian phone number, sends a 6-digit OTP via SMS
- `POST /api/auth/verify-otp` accepts phone + OTP, creates/updates User, returns JWT
- All protected endpoints reject missing/invalid JWT with `401`
- In `DEBUG=true` mode, OTP is printed to console (no SMS cost during dev)

**Todo List:**
1. Write `backend/app/services/otp_service.py`:
   - In-memory OTP store: `dict[phone → {otp, expires_at}]` with 5-minute TTL
   - `send_otp(phone)`: generate 6-digit OTP, store with expiry, send via SMS provider
   - `verify_otp(phone, otp)`: check existence + expiry + match, return bool
   - When `DEBUG=true`: log OTP to console instead of sending SMS
2. Integrate MSG91 (Indian provider) as default SMS backend; abstract behind interface so it's swappable
3. Write `backend/app/routers/auth.py`:
   - `POST /api/auth/send-otp` — validate `^[6-9]\d{9}$` Indian phone format, call `send_otp`
   - `POST /api/auth/verify-otp` — verify OTP, upsert `User` record, return JWT + user profile
4. Write `backend/app/services/auth_service.py`:
   - JWT creation with payload: `{sub: user_id, phone, ward_id, exp}`
   - `get_current_user(token)` FastAPI dependency — decode JWT, fetch user from DB
5. Add `GET /api/auth/me` — returns current user profile + ward info + points + badges

**Relevant Context:**
- Use `python-jose` for JWT: `from jose import jwt`
- Phone validation regex: `^[6-9]\d{9}$`
- JWT expiry: 30 days for prototype (no refresh token needed yet)
- MSG91 free tier supports Indian numbers; Twilio is the fallback

---

### Sub-Task 5 — Issue Posting & Feed API

**Status:** `[ ] pending`

**Intent:**
Core issue CRUD — residents post issues with title, description, category, and their ward is
auto-populated from their profile. The feed is filterable by ward/category and sortable by votes,
recency, or trending score.

**Expected Outcomes:**
- `POST /api/issues` creates an issue tied to the authenticated user's ward
- `GET /api/issues` returns paginated feed with filter/sort support
- `GET /api/issues/{id}` returns full detail including duplicate links
- Embedding generation and duplicate detection run as background tasks after creation

**Todo List:**
1. Write `backend/app/routers/issues.py`:
   - `POST /api/issues` — auth required; auto-set `ward_id` from `current_user.ward_id`; validate title (5–200 chars), description (10–1000 chars), category; persist; trigger background tasks
   - `GET /api/issues` — query params: `ward_id`, `category`, `status`, `sort` (`votes`/`recent`/`trending`), `page`, `page_size` (default 20)
   - `GET /api/issues/{id}` — full detail with reporter (first name + ward only), vote count, duplicate links, `has_duplicates` flag
   - `PATCH /api/issues/{id}/status` — admin only (`User.is_admin=true`); update status to `in_progress` or `resolved`
2. Implement trending sort formula: `score = upvote_count / (hours_since_created + 2) ** 1.5`
3. Write `backend/app/services/embedding_service.py`:
   - `generate_embedding(text)`: call OpenAI `text-embedding-3-small` API with `title + " " + description`
   - Falls back gracefully if `OPENAI_API_KEY` not set (returns `None`, duplicate detection uses tag-only)
   - Stores result in `Issue.embedding` column
4. Register background tasks on issue creation:
   - Task 1: `embedding_service.generate_and_store(issue_id)`
   - Task 2: `duplicate_service.detect_and_link(issue_id)` (runs after embedding stored)
5. Add Pydantic schemas in `backend/app/schemas/issue.py` for request/response validation

**Relevant Context:**
- FastAPI `BackgroundTasks`: inject `background_tasks: BackgroundTasks` in route handler
- Pagination: use offset-based (`skip = (page-1) * page_size`) — simple enough for prototype
- Reporter privacy: return only `first_name` + `ward_name`, never phone number

---

### Sub-Task 6 — Upvoting & Priority Ranking

**Status:** `[ ] pending`

**Intent:**
Residents upvote issues they care about. The system maintains a live priority-ranked list per ward
that becomes the MLA's action queue — the most upvoted open issues appear at the top.

**Expected Outcomes:**
- `POST /api/issues/{id}/vote` toggles an upvote (one per user per issue, DB-enforced)
- `DELETE /api/issues/{id}/vote` removes a vote
- `GET /api/wards/{ward_id}/priority-feed` returns open issues ranked by upvotes
- A user cannot vote on their own issue
- `upvote_count` on issue updates immediately and accurately

**Todo List:**
1. Write `backend/app/routers/votes.py`:
   - `POST /api/issues/{id}/vote` — auth required; check `issue.reporter_id != current_user.id`; check not already voted (unique constraint); insert `Vote`; increment `Issue.upvote_count`; call `gamification_service.award_points(user_id, "UPVOTE_GIVEN")`; return `{upvote_count: N, voted: true}`
   - `DELETE /api/issues/{id}/vote` — delete `Vote` record; decrement `Issue.upvote_count`; return `{upvote_count: N, voted: false}`
2. Handle DB unique constraint violation on duplicate vote with a clean `409 Conflict` response
3. Add `GET /api/wards/{ward_id}/priority-feed` to `wards` router:
   - Return open issues sorted by `upvote_count DESC`, grouped by category
   - Include MLA info card at the top of the response
4. Add `GET /api/wards/{ward_id}/stats`:
   - `total_open`, `total_in_progress`, `total_resolved`
   - Top 3 issues by upvotes
   - Most active category this month

**Relevant Context:**
- `upvote_count` is a denormalized counter on `Issue` — faster for sorting than a `COUNT(votes)` join
- DB unique constraint: already defined in Sub-Task 3 on `Vote(user_id, issue_id)`
- Priority feed is publicly readable (no auth required) — this is the MLA transparency view

---

### Sub-Task 7 — Duplicate Detection

**Status:** `[ ] pending`

**Intent:**
When a new issue is posted, automatically check for similar existing issues in the same ward using
two layered strategies: fast tag+category+time-window matching first, then semantic LLM embedding
similarity. Duplicate pairs are linked and surfaced to the reporter.

**Expected Outcomes:**
- After posting, `GET /api/issues/{id}` includes a `duplicates` array with similar issues + score
- Two issues with same ward + category + semantically similar title/description (cosine similarity > 0.85) are flagged
- Reporter sees "X similar issues already reported in your ward" immediately in the API response
- `GET /api/issues/{id}/duplicates` returns full duplicate list

**Todo List:**
1. Write `backend/app/services/duplicate_service.py` with two strategies:
   - **Strategy A — Tag match:** Query DB for issues with same `ward_id` + `category` created within last 30 days; create `DuplicateLink` with `method="tag_match"` and `similarity_score=0.7`
   - **Strategy B — Semantic:** Use pgvector cosine distance to find top-5 nearest issues in same ward; create `DuplicateLink` for any with distance `< 0.15` (similarity `> 0.85`) with `method="semantic"` and actual score
2. pgvector query: `SELECT id, embedding <=> :query_vec AS distance FROM issues WHERE ward_id = :ward_id ORDER BY distance LIMIT 5`
3. Persist `DuplicateLink` records (deduplicated — don't insert if link already exists)
4. After linking, set `Issue.has_duplicates = true` on both source and target issues
5. Add `GET /api/issues/{id}/duplicates` endpoint
6. Add admin endpoint `GET /api/admin/duplicate-clusters` grouping all linked issues for manual review

**Relevant Context:**
- pgvector operator `<=>` = cosine distance; `<->` = L2 distance — use `<=>` for text embeddings
- Run Strategy A first (no API cost); run Strategy B only if embedding exists on the new issue
- Duplicate detection is idempotent — running twice must not create duplicate `DuplicateLink` rows

---

### Sub-Task 8 — Gamification (Points, Badges, Leaderboard)

**Status:** `[ ] pending`

**Intent:**
Make civic participation addictive and visible. Users earn points for every civic action; badges
reward milestones; ward leaderboards create healthy neighbourhood competition and social proof.

**Point System:**
| Action | Points |
|--------|--------|
| Post an issue | +10 |
| Issue gets an upvote (per upvote received) | +2 |
| Upvote someone else's issue | +1 |
| Issue marked resolved | +50 |
| Post verified as non-duplicate | +5 |
| First reporter in ward this week | +20 |

**Badge Types:**
| Badge | Trigger |
|-------|---------|
| `FIRST_REPORTER` | First issue posted in your ward |
| `CIVIC_CHAMPION` | 10 issues posted |
| `COMMUNITY_VOICE` | 50 upvotes given |
| `PROBLEM_SOLVER` | 3 issues resolved |
| `WARD_HERO` | Rank #1 on ward leaderboard |

**Expected Outcomes:**
- Points awarded automatically at each trigger event
- `GET /api/leaderboard?ward_id=` returns top 10 users in a ward by points
- `GET /api/leaderboard/global` returns top 10 users across all wards
- User profile shows total points, badges, issues posted, issues resolved

**Todo List:**
1. Write `backend/app/services/gamification_service.py`:
   - `award_points(user_id, action, db)` — increment `User.points` based on action type
   - `check_and_award_badges(user_id, db)` — query DB counts, award badge if threshold crossed; idempotent (check `Badge` table before inserting)
2. Call `award_points` from the right places (as background tasks):
   - Issue created → `+10` to reporter
   - Vote cast → `+1` to voter, `+2` to issue reporter
   - Issue status → `resolved` → `+50` to reporter
   - Issue confirmed non-duplicate → `+5` to reporter
3. Call `check_and_award_badges` after each point award
4. Write `backend/app/routers/leaderboard.py`:
   - `GET /api/leaderboard` — optional `ward_id` param; return top 10 users sorted by `points DESC` with badge count
   - `GET /api/leaderboard/global` — top 10 globally
5. Update `GET /api/auth/me` and `GET /api/users/{id}/profile` to include `points`, `badges[]`, `issues_posted`, `issues_resolved`

**Relevant Context:**
- Badge awarding must be idempotent: `INSERT INTO badges ... WHERE NOT EXISTS (SELECT 1 FROM badges WHERE user_id=... AND badge_type=...)`
- Run gamification as background tasks — never block the main response
- `WARD_HERO` badge: check after leaderboard query; award if user is rank 1 for their ward

---

### Sub-Task 9 — React Frontend

**Status:** `[ ] pending`

**Intent:**
Build the interactive web UI — mobile-friendly pages for issue feed, posting, ward explorer,
leaderboard, and profile — all wired to the live backend API.

**Pages:**
| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Hero section, how-it-works, ward selector CTA |
| `/feed` | Issue Feed | Filterable list with upvote buttons |
| `/issues/new` | Post Issue | Form: title, description, category (ward auto-filled) |
| `/issues/:id` | Issue Detail | Full detail, upvote, duplicate warning, status badge |
| `/ward/:wardId` | Ward Dashboard | Priority feed, MLA info card, ward stats |
| `/leaderboard` | Leaderboard | Ward + global tabs, user rows with points + badges |
| `/profile` | My Profile | My issues, points, badges showcase |
| `/login` | Login | Phone input → OTP input → JWT stored |

**Expected Outcomes:**
- All 8 routes navigable, connected to live API
- Upvote button toggles with optimistic UI update (no page reload)
- Duplicate warning banner shown on issue detail when `has_duplicates=true`
- Leaderboard shows rank, points, badge icons
- Mobile-responsive (Tailwind CSS)

**Todo List:**
1. Set up React Router v6 with all 8 routes in `frontend/src/App.tsx`
2. Configure Tailwind CSS + install `shadcn/ui` for consistent component library
3. Set up TanStack Query (`@tanstack/react-query`) for all API calls with caching
4. Write `frontend/src/api/client.ts` — typed fetch wrapper that injects JWT from localStorage
5. Write API modules: `auth.ts`, `issues.ts`, `wards.ts`, `votes.ts`, `leaderboard.ts`, `users.ts`
6. Build auth flow in `/login`:
   - Step 1: Phone number input + "Send OTP" button
   - Step 2: 6-digit OTP input + "Verify" button
   - On success: store JWT in localStorage, redirect to `/feed`
7. Build `IssueCard` component: category tag, title, ward name, upvote count + button, duplicate badge, status chip
8. Build `IssueFeed` page: filter bar (ward dropdown, category pills, sort toggle: votes/recent/trending) + paginated `IssueCard` list
9. Build `PostIssue` form: title, description, category dropdown — ward auto-filled from user profile; show duplicate warning inline if API returns `has_duplicates=true`
10. Build `IssueDetail` page: full description, upvote button, status badge, **"Similar Issues" section** listing duplicates
11. Build `WardDashboard` page: MLA info card (name, party, constituency), ward stats strip, priority-ranked issue list
12. Build `Leaderboard` page: ward/global tab toggle, ranked user rows with avatar initial, points, badge icons
13. Build `UserProfile` page: stats cards (points, issues posted, resolved), badge showcase grid, issue history list

**Relevant Context:**
- Vite proxy in `vite.config.ts`: `{ '/api': { target: 'http://localhost:8000', changeOrigin: true } }`
- TanStack Query `useMutation` for upvote with `onMutate` optimistic update + `onError` rollback
- Use `shadcn/ui` Card, Button, Badge, Tabs, Select components — no custom CSS needed

---

### Sub-Task 10 — Integration, Smoke Tests & README

**Status:** `[ ] pending`

**Intent:**
Wire all services together, verify the full user journey works end-to-end in Docker Compose, write
smoke tests for critical paths, and document setup clearly.

**Expected Outcomes:**
- `docker-compose up --build` starts cleanly; migrations + seed run automatically on first start
- Full journey works: Phone OTP login → Post issue → Upvote → See duplicates → Check leaderboard
- Smoke tests pass for all critical endpoints
- README documents setup in under 5 steps

**Todo List:**
1. Add Docker healthchecks: backend waits for DB `pg_isready`; frontend waits for backend `/api/health`
2. Write `backend/db/entrypoint.sh`:
   - Run `alembic upgrade head` on startup
   - Run `python db/seed.py` only if `Ward` table is empty
3. Write `backend/tests/test_smoke.py` with `pytest` + `httpx.AsyncClient`:
   - `GET /api/health` → `200`
   - `GET /api/wards` → `200`, list non-empty
   - `POST /api/auth/send-otp` with mock phone → `200` (OTP logged in DEBUG mode)
   - `GET /api/issues` → `200`, valid pagination response
   - `GET /api/leaderboard/global` → `200`
4. Update `README.md`:
   ```
   ## Quickstart
   1. cp .env.example .env   # fill in JWT_SECRET; leave OPENAI_API_KEY blank for tag-only duplicate detection
   2. docker-compose up --build
   3. Open http://localhost:5173
   4. Login with any Indian phone number (OTP printed to backend logs in DEBUG mode)
   5. Post an issue, upvote, check the ward dashboard and leaderboard
   ```
5. Manual smoke walkthrough: register, post 2 similar issues (verify duplicate link appears), upvote, check ward priority feed, check leaderboard position

---

## Data Model Summary

```
Ward (243 BBMP Bengaluru wards)
  ├── has many Issues
  ├── has many Users (residents of that ward)
  └── belongs to a constituency → MLA

User
  ├── posts many Issues
  ├── casts many Votes
  └── earns many Badges

Issue
  ├── has many Votes
  ├── has DuplicateLinks (as source or target)
  └── has one embedding vector (pgvector)

DuplicateLink
  └── source Issue ←→ target Issue
      (similarity_score + method: tag_match | semantic)
```

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend language | Python / FastAPI | User preference; async, clean, well-typed |
| Database | PostgreSQL + pgvector | Relational integrity + native vector search |
| Auth | Phone OTP + JWT | Ties votes to real Bengaluru residents; prevents spam |
| Duplicate detection | Tag match + LLM embeddings | Two-layer: cheap fast filter, then accurate AI |
| MLA assignment | Static JSON seed data | Avoids complexity for prototype |
| Gamification | DB-backed points + badges | Queryable, no extra infrastructure |
| Frontend | React + Vite + Tailwind + shadcn/ui | Fast to build, mobile-friendly |
| Deployment | Docker Compose | Single command local dev; easy to hand off |

---

## Post-Prototype Roadmap

- MLA login portal with issue acknowledgement and status update workflow
- WhatsApp/SMS notifications when issue status changes
- Photo/media attachments with object storage
- Kannada language support (i18n)
- PWA / offline-first for low-connectivity areas
- BBMP complaint portal API integration
- Multi-city expansion beyond Bengaluru
- Councillor (BBMP ward councillor) assignment in addition to MLA
