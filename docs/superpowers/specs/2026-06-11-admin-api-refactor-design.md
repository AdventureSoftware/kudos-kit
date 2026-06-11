# Admin API Refactor Design

**Date:** 2026-06-11
**Status:** Approved

## Goal

Move all DB access and session authority into NestJS. Next.js becomes a pure UI layer — no DB credentials, no raw SQL, no session secrets. Introduce Prisma ORM as the single DB access mechanism across the server.

## Motivation

The original implementation had Next.js connecting directly to Postgres via a `pg` pool and managing session cookies with `iron-session`. This split DB credentials across two apps and made NestJS not the authoritative owner of business logic. The refactor consolidates both concerns into NestJS to simplify deployment, reduce credential surface, and create a clean foundation for future features.

---

## Architecture

```
Widget → POST /v1/feedback → NestJS (PrismaIngestService → feedback_ingest role)

Browser → Next.js admin page
  ├─ login form → POST /v1/admin/login → NestJS AuthService → JWT
  ├─ list/filter → GET /v1/admin/feedback → NestJS (JwtGuard → PrismaAdminService → feedback_admin role)
  ├─ toggle status → PATCH /v1/admin/feedback/:id/status → NestJS (JwtGuard → PrismaAdminService)
  └─ delete → DELETE /v1/admin/feedback/:id → NestJS (JwtGuard → PrismaAdminService)
```

---

## NestJS Changes

### Prisma

- One `prisma/schema.prisma` defining `Feedback` and `Project` models matching the existing DB schema exactly. No migrations needed — Prisma introspects the existing tables.
- Two injectable Prisma services:
  - `PrismaIngestService` — instantiated with `feedback_ingest` role credentials (`DB_INGEST_USER` / `DB_INGEST_PASSWORD`). Used by `FeedbackService`.
  - `PrismaAdminService` — instantiated with `feedback_admin` role credentials (`DB_ADMIN_USER` / `DB_ADMIN_PASSWORD`). Used by `AdminFeedbackService`.
  - Each uses `new PrismaClient({ datasources: { db: { url } } })` to override the connection string at instantiation time.
- `DatabaseService` and the `pg` package are removed entirely.
- `FeedbackService` updated to use `PrismaIngestService` — query logic equivalent, just Prisma syntax.

### New `admin` module

**`AuthService`**
- Validates `ADMIN_PASSWORD` env var (constant-time comparison).
- On success: signs and returns a JWT using `@nestjs/jwt` (24h expiry, secret from `JWT_SECRET` env var).
- On failure: throws `UnauthorizedException`.

**`AuthController`**
- `POST /v1/admin/login` — body: `{ password: string }` — returns `{ token: string }`.
- No auth guard (public endpoint).

**`JwtAuthGuard`**
- NestJS guard using `@nestjs/jwt` to validate `Authorization: Bearer <token>` header.
- Applied to all `AdminFeedbackController` routes.

**`AdminFeedbackService`**
- `list(filters: { project?, status?, page? })` — paginated, 25 per page, ordered by `created_at DESC`.
- `listProjects()` — returns all project keys.
- `cycleStatus(id)` — reads current status, applies `new → triaged → done → new` cycle.
- `delete(id)` — hard delete (GDPR erasure).
- All operations via `PrismaAdminService`.

**`AdminFeedbackController`** — all routes guarded by `JwtAuthGuard`:
- `GET /v1/admin/feedback?project=&status=&page=`
- `GET /v1/admin/projects`
- `PATCH /v1/admin/feedback/:id/status`
- `DELETE /v1/admin/feedback/:id`

### Config additions (`server/.env`)

```
ADMIN_PASSWORD=...
JWT_SECRET=...              # 32+ char random string
DB_ADMIN_USER=feedback_admin
DB_ADMIN_PASSWORD=...
```

---

## Next.js Changes

### Removed
- `src/lib/db.ts`
- `pg` npm package
- `iron-session` npm package
- `SESSION_SECRET`, `DATABASE_URL`, `ADMIN_PASSWORD` from `.env.local`

### Login flow (`login/actions.ts`)
- POST `{ password }` to `$NESTJS_API_URL/v1/admin/login`.
- On success: store returned `token` in an HTTP-only cookie named `admin_token` via Next.js `cookies()` API; redirect to `/admin`.
- On failure: return error message to the form.

### Logout (`login/actions.ts`)
- Delete the `admin_token` cookie; redirect to `/login`.

### Admin page (`admin/page.tsx`)
- Read `admin_token` cookie. If absent, redirect to `/login`.
- Fetch `GET /v1/admin/feedback` and `GET /v1/admin/projects` in parallel with `Authorization: Bearer <token>`.
- On 401 from either call, redirect to `/login`.

### Admin actions (`admin/actions.ts`)
- `toggleStatusAction(id)` — reads `admin_token` cookie, calls `PATCH /v1/admin/feedback/:id/status`.
- `deleteRowAction(id)` — reads `admin_token` cookie, calls `DELETE /v1/admin/feedback/:id`.
- Both redirect to `/login` on 401.

### New `.env.local`
```
NESTJS_API_URL=http://localhost:3000
```

---

## Testing

### Server — updated specs
- `FeedbackService` spec: replace `DatabaseService` mock with `PrismaIngestService` mock.
- New `AuthService` spec: correct password → returns JWT-shaped object; wrong password → throws `UnauthorizedException`.
- New `AdminFeedbackService` spec: list with/without filters, status cycle (all three transitions), delete — mock `PrismaAdminService`.

### Manual smoke test
1. Start NestJS (`server/`) and Next.js (`client/`) with Cloudflare test Turnstile keys and local Postgres.
2. Login with correct password → `admin_token` cookie set, redirect to `/admin`.
3. Admin page displays feedback list fetched from NestJS.
4. Toggle status → row cycles `new → triaged → done → new`.
5. Delete → row removed from list.
6. Tamper/expire token → redirected to `/login`.
7. Submit feedback via widget → appears in admin list.

---

## What Does Not Change

- Ingest endpoint contract (`POST /v1/feedback`) — no breaking changes.
- DB schema — no migrations.
- Widget (`kkw.js`) — untouched.
- Retention script (`scripts/retention.ts`) — untouched.
- Two DB roles and their privileges — preserved exactly.