# Cross-Product Feedback Widget — Technical Spec

**Owner:** Vali / Adventure Software SRL
**Status:** Draft v1
**Goal:** One drop-in feedback/bug-report widget across all products (Colorpage, ProductScene, BizPage-generated sites, etc.), posting to a single self-hosted hub. Async, one-way intake. Captures browser console logs on bug reports.

---

## 1. Scope

### In
- Single hosted **vanilla JS** snippet, framework-agnostic (works in Next.js apps *and* BizPage static sites).
- Floating button → panel: type selector (bug / idea / other), message textarea, optional email.
- **Auto-context** capture: URL, referrer, user agent, viewport, language, app/build version, logged-in user.
- **Console log + uncaught error capture** for bug reports.
- Self-hosted ingest API (NestJS) + Postgres on the existing `agileturtles.com` Hetzner box.
- Abuse protection: Turnstile, rate limiting, honeypot, project-key allowlist, payload caps.
- Notification on new feedback (Telegram or email).
- Minimal auth-gated Next.js admin page.

### Out (v1 — these are the complexity cliffs)
- **Two-way replies / threading.** The moment users can see responses in-widget, you're back to auth-linked conversations and a reply UI. Hard no for v1.
- **Screenshot capture.** `html2canvas` is unreliable across cross-origin assets and CSS edge cases. Defer.
- **Network request capture.** Tempting, but it's another serialization/PII surface. Defer.
- **Real-time anything.** No websockets.

---

## 2. Architecture

```
[ Widget (vanilla JS, hosted) ]
        |  HTTPS POST (Turnstile token + payload)
        v
[ nginx/Caddy on agileturtles box ]  --reverse proxy-->  [ NestJS ingest service ]
                                                                |
                                                                | INSERT-only DB role
                                                                v
                                                       [ Postgres (localhost only) ]
                                                                ^
                                                                | SELECT/UPDATE DB role
[ Next.js admin page (auth-gated) ] ----------------------------+
        ^
        |
[ Telegram / email notification on insert ]
```

Components:
1. **Widget** — one hosted `.js` file (e.g. `https://feedback.agileturtles.com/w.js`). No npm package: avoids version drift across apps and works on static BizPage sites.
2. **Ingest API** — small NestJS service. Single `POST /v1/feedback`. Validates, verifies Turnstile, inserts.
3. **Postgres** — small DB `feedback` on the same box, bound to localhost.
4. **Notifier** — fires on insert (Telegram bot recommended; throttled).
5. **Admin** — Next.js page reading via a separate least-privilege DB role.

Suggested host: subdomain `feedback.agileturtles.com` (clean TLS via existing reverse proxy) rather than a path on the main site.

---

## 3. The Widget

### 3.1 Lifecycle

**Recommended default: always load, always init, render hidden, toggle visibility.** One code path, no conditional-init branching, console buffer obviously running from page load. The launcher renders hidden *from the first paint* (never init-shown-then-hide — that flashes), and you call `show()`/`hide()` whenever you want it visible.

```html
<script src="https://feedback.agileturtles.com/w.js" defer></script>
<script>
  window.addEventListener('DOMContentLoaded', () => {
    Feedback.init({
      project: 'colorpage',           // required; validated against allowlist server-side
      user: { id: currentUser?.id, plan: currentUser?.plan }, // optional; degrades gracefully (BizPage = no login)

      startHidden: true,              // render hidden from first paint — no flash

      // Placement
      position: 'bottom-right',       // 'bottom-right' (default) | 'bottom-left' | 'top-right' | 'top-left'
      offset: { bottom: 24, right: 24 }, // optional px override, e.g. to clear a cookie banner

      console: {
        enabled: true,
        max: 150,                     // ring buffer size
        maxBytes: 50_000,             // total serialized cap
        redact: true,                 // best-effort secret masking
        sendOn: ['bug']               // only transmit logs for bug reports
      }
    });

    // Show it however you like — e.g. logged-in users only:
    if (currentUser?.id) Feedback.show();
  });
</script>
```

**Why this over conditional-init:** init always runs, so buffering and mounting both happen on load and there's no async-auth race to lose page-load logs over. Visibility is the only thing you toggle.

**Visibility = single source of truth.** The desync trap ("I don't know if it's shown or hidden") only appears if *two* owners track visibility — the widget internally **and** your app in its own state. Don't mirror the boolean. The widget owns it; you query or subscribe:

```js
Feedback.show();  Feedback.hide();   // idempotent — calling show() twice is a no-op
Feedback.toggle();
Feedback.isVisible();                // ask the widget; never keep a parallel copy
Feedback.on('visibilitychange', visible => {...}); // if your UI must react
Feedback.destroy();                  // full teardown — call on logout
```

Guards: `show()` before `init()` finishes should queue or no-op, not throw; don't queue duplicate open/close animations.

> **Visibility is presentational, not a security boundary.** With always-init, the submit capability exists for every visitor — anyone who calls `show()` (or pokes the console) can submit. For a feedback widget that's fine; worst case an anonymous user sends feedback. Transmit still never fires until submit, so the GDPR posture is unchanged. **Use conditional-init (below) only if "authenticated feedback only" is a hard requirement.**

**Alternative: conditional-init (only for authenticated-feedback-as-a-boundary).** Gate `init()` itself behind auth so the widget never mounts and the submit capability never exists for anonymous users. Cost: if auth resolves async after hydration, you lose page-load console history — accept that trade only when the boundary matters more than the logs.

```js
if (currentUser?.id) {
  Feedback.init({ project: 'colorpage', user: { id: currentUser.id }, /* ... */ });
}
```

**Loading the script:** always load `w.js` (it caches across pages and the buffer starts early). Conditionally injecting the `<script>` tag instead only makes sense if you're perf/privacy-minimal and accept losing early capture for mid-session logins.

**Placement (`position` + `offset`):** the launcher is a `position: fixed` element with a high `z-index` (~`2147483000`, overridable). `position` selects which two anchors are set; `offset` overrides the px values per anchor.

```css
.fb-launcher { position: fixed; z-index: 2147483000; }
.fb-launcher--bottom-left  { bottom: 24px; left: 24px; }
.fb-launcher--bottom-right { bottom: 24px; right: 24px; }
/* offset values, when present, override the matching anchors */
```

> Note on "load early": `defer` runs after HTML parse but before `DOMContentLoaded`. For *maximum* console coverage, inline just the console-patch shim synchronously at the top of `<head>` and async-load the rest. Trade-off between coverage and keeping the snippet a clean one-liner.

### 3.2 UI
- Floating launcher button (placement via `position`/`offset`, see §3.1), small panel on click.
- Fields: type (`bug` / `idea` / `other`), message (textarea, required, max ~5000 chars), email (optional).
- Hidden **honeypot** field (must stay empty).
- Turnstile widget rendered in the panel.
- On submit: assemble payload, run Turnstile, POST, show success/error.

### 3.3 Auto-context (the bit that makes a homegrown widget beat a generic form)
Captured on submit, no user effort:
```
context: {
  url, referrer, userAgent,
  viewport: { w, h },
  language,
  build,            // from window.__APP_VERSION__ or init param
  ts                // ISO timestamp
}
```

### 3.4 Console + error capture (the new requirement)

**Mechanism — install on init, not on submit:**

1. **Ring buffer**, capped at `max` entries. Each entry: `{ t: epochMs, level, msg }`.
2. **Patch `console.log/info/warn/error/debug`**: wrap original (still call it so devtools work), push serialized args to buffer.
3. **Global error hooks**:
   - `window.addEventListener('error', e => …)` → `{ message, filename, lineno, colno, stack }`
   - `window.addEventListener('unhandledrejection', e => …)` → reason/stack
   These go into a separate `errors[]` (higher signal than `console.*`).

**Safe serialization (do NOT naive-stringify):**
- Primitives → as-is.
- `Error` → `.stack`.
- DOM node → `<tagname>`.
- Function → `[Function]`.
- Objects/arrays → `JSON.stringify` with a **circular-safe replacer** + depth/length limits.
- Truncate each entry to ~2KB; enforce total `maxBytes` (drop oldest first).

**Redaction (best-effort, not a guarantee — say so):**
Before transmit, mask values whose key or content matches:
```
/authorization|bearer\s+|password|secret|api[_-]?key|token|set-cookie/i
```
Replace matched values with `[redacted]`. This reduces but does not eliminate PII risk — see §8.

**Transmit policy:** Only attach `console` + `errors` when `type === 'bug'` (per `sendOn`). Ideas/other don't need logs and shouldn't carry the PII payload.

### 3.5 Payload

```jsonc
POST /v1/feedback
{
  "project": "colorpage",
  "type": "bug",
  "message": "Export button does nothing on the pricing page",
  "email": "user@example.com",        // optional
  "user": { "id": "...", "plan": "pro" }, // optional
  "context": { "url": "...", "userAgent": "...", "viewport": {"w":1440,"h":900}, "build": "1.4.2", "ts": "..." },
  "console": [ { "t": 1717843200000, "level": "error", "msg": "TypeError: ..." } ],
  "errors":  [ { "message": "...", "stack": "...", "filename": "...", "lineno": 42 } ],
  "hp": "",                            // honeypot — must be empty
  "turnstileToken": "0.xxx"
}
```

---

## 4. Ingest API (NestJS)

Single endpoint `POST /v1/feedback`.

**Validation / guards (in order, fail fast):**
1. **Payload size cap** — reject > ~256KB (console logs inflate this; tune). Enforce at nginx *and* in-app.
2. **Honeypot** — `hp` non-empty → silently 200, drop.
3. **Project allowlist** — `project` must exist + be active in `projects` table → else 400.
4. **Turnstile siteverify** — server-side call to Cloudflare; reject on fail.
5. **Rate limit** — per IP (see §6). 
6. **Schema validation** — class-validator DTO: `type` in enum, `message` non-empty/max length, email format if present.
7. **Insert** via INSERT-only DB role. Store `ip` (inet) for abuse triage.
8. **Fire notification** async (don't block the response on it).

**CORS:** allow any origin (BizPage custom domains make an allowlist a moving target). Security comes from Turnstile + project key, *not* origin. Restrict to the single POST route.

**Run as:** non-root, dedicated systemd unit/user, behind existing reverse proxy with TLS.

---

## 5. Database (Postgres, localhost-only)

```sql
create table projects (
  key        text primary key,
  name       text not null,
  active     boolean not null default true
);

create table feedback (
  id            bigint generated always as identity primary key,
  project       text not null references projects(key),
  type          text not null check (type in ('bug','idea','other')),
  message       text not null,
  email         text,
  user_ctx      jsonb,
  context       jsonb,
  console_logs  jsonb,
  errors        jsonb,
  status        text not null default 'new' check (status in ('new','triaged','done')),
  ip            inet,
  created_at    timestamptz not null default now()
);

create index on feedback (project, status, created_at desc);
```

**Privilege separation (this is the security win of self-hosting):**
```sql
-- ingest can only insert
create role feedback_ingest login password '...';
grant insert on feedback to feedback_ingest;
grant select on projects to feedback_ingest;

-- admin can read + update status
create role feedback_admin login password '...';
grant select, update (status) on feedback to feedback_admin;
grant select on projects to feedback_admin;
```

**Postgres config:** `listen_addresses = 'localhost'`, port 5432 **never** exposed externally, strong per-role passwords, dedicated DB `feedback`.

---

## 6. Abuse / Hardening

You've had this box's siblings crypto-mined. Treat the public write endpoint as hostile by default.

- **Turnstile** server-verified on every submit.
- **Rate limit** per IP: e.g. `limit_req` in nginx (5/min, burst 10) + an in-app fallback. 
- **Payload caps** at proxy and app.
- **Honeypot** + project-key allowlist.
- **Isolation:** ingest service runs as its own unix user with the INSERT-only DB role. Even a full app compromise can't read existing feedback or touch other DBs.
- **Notification throttle:** cap alerts (e.g. max 1/min, or digest) so an abuse spike doesn't bury you / DoS your Telegram.
- UFW + Fail2ban already in place — keep the DB port off the allowlist.

> Honest flag: co-locating with `agileturtles.com` means a resource-exhaustion attack on the feedback endpoint can degrade your agency site. Rate limits + payload caps are the mitigation, but if the agency site is revenue-critical, a separate cheap VPS isolates the blast radius. Your call — the spec assumes co-location since that's what you asked for.

---

## 7. Notifications
- **Telegram bot** recommended (instant, free, no deliverability headaches). Bot token + chat id in env.
- Message: project, type, truncated message, link to admin row.
- Throttled (see §6).
- Email (Resend) as alternative if you'd rather not run a bot.

---

## 8. Privacy / GDPR (not optional)

Console logs + IP + user context = personal data under GDPR. You're an EU entity serving EU users.

- **Transparency:** widget must state that bug reports collect technical diagnostics including console logs. One line in the panel + link to privacy policy.
- **Redaction:** the best-effort masking in §3.4 — but document it as best-effort; never claim logs are PII-free.
- **Retention:** auto-purge old feedback. Recommend a daily cron deleting rows older than N days (e.g. 90), or at least nulling `console_logs`/`errors`/`ip` after triage.
- **Right to erasure:** the admin needs a delete action, not just status toggle.

---

## 9. Admin Page (minimal, v1)
- Single Next.js page, **auth-gated** (basic auth or single bearer token in a protected route — no public exposure). No Supabase auth now, so keep it dead simple.
- Reads via `feedback_admin` role, server-side only.
- Table: project filter, status filter, columns (type, message, created_at, build, url).
- Row detail: full context + console/error logs (collapsible).
- Actions: status toggle (new/triaged/done), delete (for erasure requests).
- **Not** day one: charts, search, assignment.

---

## 10. Open decisions for you
1. **Host:** subdomain `feedback.agileturtles.com` (recommended) vs path on existing site?
2. **Notification channel:** Telegram (recommended) vs Resend email?
3. **Console transmit:** bug-only (recommended) vs always?
4. **Retention window:** 90 days? 30? 
5. **Admin auth:** basic auth vs bearer token vs tiny login?
6. **Isolation:** accept co-location risk, or spin a separate €4 VPS for blast-radius separation?

---

## 11. Build order
1. **DB + roles + projects table** — 30 min.
2. **NestJS ingest endpoint** — DTO validation, Turnstile verify, insert. Test with `curl`. ~half day.
3. **Widget MVP** — button/panel/submit + auto-context, wired to endpoint. ~half day.
4. **Console + error capture** — ring buffer, patching, safe serializer, redaction. ~half day (the serializer is where time goes).
5. **Notifications** — Telegram bot + throttle. ~1h.
6. **Admin page** — read + status toggle + delete. ~half day.
7. **Hardening pass** — rate limits, payload caps, retention cron, privacy line in widget. ~2h.

Realistic total: a focused weekend. The serializer and redaction are the only non-trivial parts; everything else is plumbing you've done a hundred times.
