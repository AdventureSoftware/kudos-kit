# kudos-kit Design

**Date:** 2026-06-11
**Owner:** Vali / Adventure Software SRL
**Status:** Approved

---

## 1. Overview

A self-hosted cross-product feedback widget system. One drop-in vanilla JS snippet (`kkw.js`) works across all products (Colorpage, ProductScene, BizPage-generated sites). Submissions go to a single NestJS ingest API, stored in Postgres, surfaced in an auth-gated Next.js admin page. One-way intake only — no replies, no threading.

Hosted at: `feedback.agileturtles.com` (subdomain on existing Hetzner box, behind nginx reverse proxy with TLS). Co-located with `agileturtles.com`; rate limits + payload caps mitigate shared-resource risk.

---

## 2. Architecture

```
[ kkw.js (vanilla JS, hosted) ]
        |  HTTPS POST (Turnstile token + payload)
        v
[ nginx on agileturtles box ]  --reverse proxy-->  [ NestJS ingest service ]
                                                          |
                                                          | INSERT-only DB role
                                                          v
                                                   [ Postgres (localhost only) ]
                                                          ^
                                                          | SELECT/UPDATE DB role
[ Next.js admin page (auth-gated) ] ----------------------+
        ^
        |
[ Brevo email notification on insert (throttled) ]
```

Components:
1. **Widget (`kkw.js`)** — one hosted JS file. No npm package.
2. **Ingest API** — NestJS, single `POST /v1/feedback`.
3. **Postgres** — DB `feedback`, localhost-only, two privilege-separated roles.
4. **Notifier** — Brevo email, fires async on insert, throttled to 1/min.
5. **Admin** — Next.js page, session-cookie auth, reads via `feedback_admin` role server-side only.

---

## 3. Widget (`kkw.js`)

### 3.1 Init API

```js
Feedback.init({
  project: 'colorpage',                  // required; validated server-side
  user: { id: '...', plan: 'pro' },      // optional; degrades gracefully
  startHidden: true,                     // render hidden from first paint
  position: 'bottom-right',             // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  offset: { bottom: 24, right: 24 },    // optional px override
  theme: {
    accent: '#6366f1',                   // button bg + active type chip + submit btn
    text: '#ffffff',                     // text on accent surfaces
  },                                     // optional; defaults to minimal black (#111)
  console: {
    enabled: true,
    max: 150,
    maxBytes: 50_000,
    redact: true,
    sendOn: ['bug'],
  }
});

// Visibility controls (idempotent)
Feedback.show();
Feedback.hide();
Feedback.toggle();
Feedback.isVisible();
Feedback.on('visibilitychange', visible => {});
Feedback.destroy();
```

**Always-init pattern:** mounts on page load, visibility toggled separately. No conditional-init branching; console buffer starts from first paint.

### 3.2 UI

Minimal/dark style: high-contrast black & white, sharp corners, clean typography. Branded via `theme.accent` + `theme.text` init params — applied to the floating button, active type chip, and submit button. No other CSS surfaces are customizable in v1.

Fields: type selector (bug / idea / other), message textarea (required, max 5000 chars), email (optional). Hidden honeypot field. Turnstile widget rendered in panel.

### 3.3 Auto-context

Captured on submit:
```js
context: {
  url, referrer, userAgent,
  viewport: { w, h },
  language,
  build,      // window.__APP_VERSION__ or init param
  ts          // ISO timestamp
}
```

### 3.4 Console capture

- Ring buffer: `max` entries, capped at `maxBytes` total serialized.
- Patches `console.log/info/warn/error/debug` on init (original still called).
- `window.onerror` + `unhandledrejection` go to separate `errors[]`.
- Safe serializer: primitives as-is, `Error` → `.stack`, DOM nodes → `<tagname>`, functions → `[Function]`, objects/arrays → circular-safe `JSON.stringify` with depth/length limits. Each entry truncated to ~2KB.
- Redaction before transmit: masks values matching `/authorization|bearer\s+|password|secret|api[_-]?key|token|set-cookie/i`. Best-effort — not a PII guarantee.
- Transmitted only when `type === 'bug'` (per `sendOn`).

### 3.5 Payload

```jsonc
POST /v1/feedback
{
  "project": "colorpage",
  "type": "bug",
  "message": "...",
  "email": "user@example.com",
  "user": { "id": "...", "plan": "pro" },
  "context": { "url": "...", "userAgent": "...", "viewport": {"w":1440,"h":900}, "build": "1.4.2", "ts": "..." },
  "console": [ { "t": 1717843200000, "level": "error", "msg": "..." } ],
  "errors":  [ { "message": "...", "stack": "...", "filename": "...", "lineno": 42 } ],
  "hp": "",
  "turnstileToken": "0.xxx"
}
```

---

## 4. Ingest API (NestJS)

Endpoint: `POST /v1/feedback`

Guards run in order (fail fast):
1. Payload size cap — reject > 256KB (enforced at nginx + in-app)
2. Honeypot — `hp` non-empty → silent 200, drop
3. Project allowlist — `project` must exist + active in `projects` table → else 400
4. Turnstile siteverify — server-side call to Cloudflare; reject on fail
5. Per-IP rate limit — `limit_req` in nginx (5/min, burst 10) + in-app fallback
6. Schema validation — class-validator DTO
7. INSERT via `feedback_ingest` DB role; store `ip` (inet)
8. Async Brevo email notification (throttled, max 1 alert/min)

**CORS:** open to all origins — security comes from Turnstile + project key. Restricted to the single POST route.

**Runtime:** non-root unix user, dedicated systemd unit, behind nginx with TLS.

---

## 5. Database

```sql
create table projects (
  key    text primary key,
  name   text not null,
  active boolean not null default true
);

create table feedback (
  id           bigint generated always as identity primary key,
  project      text not null references projects(key),
  type         text not null check (type in ('bug','idea','other')),
  message      text not null,
  email        text,
  user_ctx     jsonb,
  context      jsonb,
  console_logs jsonb,
  errors       jsonb,
  status       text not null default 'new' check (status in ('new','triaged','done')),
  ip           inet,
  created_at   timestamptz not null default now()
);

create index on feedback (project, status, created_at desc);
```

**Roles:**
```sql
-- ingest: INSERT-only
create role feedback_ingest login password '...';
grant insert on feedback to feedback_ingest;
grant select on projects to feedback_ingest;

-- admin: read + status updates + delete
create role feedback_admin login password '...';
grant select, delete on feedback to feedback_admin;
grant update (status) on feedback to feedback_admin;
grant select on projects to feedback_admin;
```

Postgres: `listen_addresses = 'localhost'`, port 5432 never exposed externally.

**Retention:** daily cron deletes rows where `created_at < now() - interval '90 days'`.

---

## 6. Notifications

- **Provider:** Brevo (email)
- **Trigger:** async on successful insert, does not block the HTTP response
- **Throttle:** max 1 email/min — if an alert fires within 60s of the previous one, drop it
- **Content:** project name, type, truncated message (first 200 chars), created_at, link to admin row

---

## 7. Admin Page (Next.js)

### 7.1 Auth

Single-password session auth:
- `GET /login` — renders login form
- `POST /login` — checks `ADMIN_PASSWORD` env var; on match, sets a signed session cookie via `iron-session`; redirects to admin
- All other admin routes: middleware checks session cookie, redirects to `/login` if absent/invalid

No user management. One password, rotated via env var redeploy.

### 7.2 UI

**List view:** table with project filter + status filter (new / triaged / done / all). Columns: type, message (truncated), created_at, build, url. Paginated (25 rows/page).

**Row detail:** slide-out panel or expanded row with full context fields + collapsible console logs + collapsible errors array.

**Actions:**
- Status toggle: new → triaged → done (cycles)
- Delete row (for GDPR erasure requests)

All reads via `feedback_admin` DB role, server-side only (Next.js Server Components / Route Handlers — no client-side DB access).

---

## 8. Abuse / Hardening

- Turnstile server-verified on every submit
- nginx `limit_req` (5/min, burst 10) + in-app fallback
- 256KB payload cap at proxy and app
- Honeypot + project-key allowlist
- Isolation: ingest runs as dedicated unix user with INSERT-only DB role
- Brevo notification throttle (1/min) prevents alert flooding

---

## 9. Privacy / GDPR

- Console logs + IP + user context = personal data. Widget panel must state that bug reports collect technical diagnostics (one line + privacy policy link).
- Redaction is best-effort — never claim logs are PII-free.
- 90-day retention cron (see §5).
- Delete action in admin covers right-to-erasure requests.

---

## 10. Build Order

1. DB schema + roles + seed `projects` row
2. NestJS ingest endpoint (DTO, Turnstile verify, insert) — test with `curl`
3. Widget MVP (`kkw.js`): button/panel/submit + auto-context, wired to endpoint
4. Console + error capture (ring buffer, patching, safe serializer, redaction)
5. Brevo email notification + throttle
6. Admin page (login, list view, row detail, status toggle, delete)
7. Hardening pass (rate limits, payload caps, retention cron, privacy line in widget)
