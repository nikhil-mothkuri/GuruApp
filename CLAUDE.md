# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GuruApp is a web application connecting **Gurus (Teachers)** and **Students**. A single user account can hold both roles simultaneously. Three personas: Admin, Guru, Student.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite 8, Tailwind CSS v4, shadcn-compatible primitives
- **Backend**: Node.js 24 + Express 4 + TypeScript (CommonJS), Prisma ORM + SQLite
- **Shared**: `@guruapp/shared` — Zod schemas + inferred TypeScript types used by both sides
- **Auth**: JWT (15 min access + 7 day refresh), stored in Zustand (persisted to localStorage)
- **State**: TanStack Query v5 (server state), Zustand (auth only)
- **Photos**: Multer + Sharp → WebP, served from `/uploads/` via Express static

## Development Commands

```bash
# Install all workspace packages (run from root)
pnpm install

# Start both frontend and backend concurrently
pnpm dev

# Backend only (port 4000)
cd server && npm run dev

# Frontend only (port 5173, proxies /api → localhost:4000)
cd client && npm run dev

# Database
cd server && npx prisma migrate dev          # create/apply migrations
cd server && npx prisma db seed              # seed demo data
cd server && npx prisma studio               # GUI DB browser

# Type checking
cd server && npx tsc --noEmit
cd client && npx tsc --noEmit

# Build shared package (required before server compiles if schema changed)
cd shared && npm run build

# Tests
cd server && npm test                        # Jest
cd server && npm test -- --testPathPattern=auth  # single module

# Lint
pnpm lint
```

## Monorepo Structure

```
GuruApp/
├── client/          # React 18 + Vite frontend (port 5173)
├── server/          # Express backend (port 4000)
├── shared/          # @guruapp/shared — Zod schemas + types
├── pnpm-workspace.yaml
└── CLAUDE.md
```

## Architecture

### Backend Layer (server/src/)
**Request lifecycle**: `Route → auth middleware → validate(schema) → Controller → Service → Repository → Prisma`

- `modules/*/` — feature folders (auth, users, gurus, slots, bookings, ratings, favorites, admin)
  - `*.routes.ts` → `*.controller.ts` → `*.service.ts`
- `repositories/` — only layer that calls Prisma directly
- `middleware/` — auth.ts (JWT verify), validate.ts (Zod), requireRole.ts, upload.ts, errorHandler.ts
- `config/env.ts` — Zod-validated env vars; server exits on startup if missing
- `config/prisma.ts` — singleton PrismaClient

**Error pattern**: services throw `AppError(message, statusCode, code)` → `errorHandler` converts to `{ error: { message, code } }`

**API response shape**: `{ data: T }` on success · `{ error: { message, code } }` on failure · `{ data: T[], meta: { total, page, limit, totalPages } }` for lists

### Frontend (client/src/)
- `stores/authStore.ts` — Zustand (auth only); all server state in TanStack Query
- `services/api.ts` — Axios instance with JWT interceptor + 401 refresh-and-retry
- `hooks/` — wraps TanStack Query; pages never call `useQuery` directly
- `routes/` — lazy-loaded page components (all wrapped in `React.lazy`)
- `components/layout/ProtectedRoute.tsx` — redirects unauthenticated or wrong-role users

### Database (server/prisma/schema.prisma)
SQLite with Prisma. Key tables: `User` (role flags), `GuruProfile`, `GuruSkill`, `GuruPhoto`, `GuruVideo`, `AvailabilitySlot`, `Booking`, `Rating`, `Favorite`, `RefreshToken`.

SQLite notes:
- No native enums — Booking `type`/`status` are `String`, validated by Zod in service layer
- No JSON columns — `recurrenceRule` stored as serialized JSON string
- WAL mode enabled at startup for read throughput

### Booking Types
- **APPOINTMENT**: `type = "APPOINTMENT"`, `slotId` required, `recurrenceRule = null`
- **SUBSCRIPTION**: `type = "SUBSCRIPTION"`, `slotId = null`, `recurrenceRule = '{"freq":"DAILY","until":"ISO"}'`

## Seed Accounts (password: `password123`)
| Email | Role |
|---|---|
| admin@guruapp.com | Admin |
| alice@guruapp.com | Guru |
| bob@guruapp.com | Guru + Student |
| student@guruapp.com | Student |

## Google OAuth Architecture

GuruApp uses the **ID Token verification** flow — no server-side OAuth redirect:
1. Client renders `<GoogleLogin>` from `@react-oauth/google` (wrapped in `GoogleOAuthProvider` in `App.tsx`)
2. On success, `onSuccess` receives `{ credential: string }` — this IS the Google ID token (signed JWT)
3. Frontend posts `{ idToken }` to `POST /api/auth/google`
4. Backend (`google-auth-library` `OAuth2Client.verifyIdToken`) validates the token against `GOOGLE_CLIENT_ID`
5. Backend extracts `sub` (stable Google user ID), email, name, picture; finds or creates the user
6. Backend issues GuruApp JWT access + refresh tokens — same response shape as login/signup
7. Frontend calls `setAuth(data)` — identical Zustand flow to password login

**Key env vars:**
- Server: `GOOGLE_CLIENT_ID` (required in `config/env.ts` Zod schema)
- Client: `VITE_GOOGLE_CLIENT_ID` (in `client/.env`, Vite only exposes `VITE_`-prefixed vars)

**Account linking:** If a Google email matches an existing password account, `googleId` is attached and both login methods work. If a Google-only user attempts password login, `auth.service.ts login()` null-checks `user.passwordHash` and returns a clear error.

**`passwordHash` is nullable** (`String?` in schema). Always check `if (!user.passwordHash)` before calling `comparePassword`. New Google users default to `isStudent: true, isGuru: false`.

**`GoogleAuthButton`** (`client/src/components/ui/GoogleAuthButton.tsx`) is self-contained — it owns the mutation and error display. Login/Signup pages only pass an `onSuccess` callback.

## Environment
Copy `server/.env.example` → `server/.env` and fill in JWT secrets (min 32 chars) and `GOOGLE_CLIENT_ID`.
Copy `client/.env.example` → `client/.env` and fill in `VITE_GOOGLE_CLIENT_ID`.

To get a Client ID: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID (Web application). Add `http://localhost:5173` to Authorized JavaScript origins.

## Key Constraints
- `shared/` must be built (`npm run build`) before the server can import from `@guruapp/shared`
- SQLite `createMany` does not support `skipDuplicates` — use per-item upserts instead
- `req.params` and `req.query` values must be cast as `req.params['key'] as string` to satisfy `strict: true`
