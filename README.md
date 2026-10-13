# Kudos Kit

Self-hosted feedback for your apps and websites. Add one script tag and your users get a
small **Feedback** button: they report a bug, share an idea, and your team reads everything
in one dashboard, with the page, browser and (for bugs) the console log attached.

- **Widget**: one script, no dependencies, themable (colors, light/dark, position). Captures
  console messages and errors for bug reports, hiding things that look like passwords and tokens.
- **Dashboard**: overview with daily stats, an inbox with filters, search and status
  (new → triaged → done), references like `CP-12` per project.
- **Team**: invite-only accounts with owner / admin / member roles; email + password,
  optional Google and Apple sign-in; password reset.
- **Privacy built in**: spam check with Cloudflare Turnstile, rate limits, a public privacy
  page, automatic deletion after 90 days, least-privilege database roles.
- **Yours**: runs on your own server with Docker. MIT licensed.

## Quick start (Docker)

```bash
git clone https://github.com/<org>/kudos-kit.git && cd kudos-kit
./scripts/setup.sh feedback.example.com      # creates .env with fresh secrets
docker compose up -d --build
```

Then put HTTPS in front (nginx config included, or set `COMPOSE_PROFILES=caddy` for automatic
certificates), add a project and create the owner account. **[DEPLOY.md](DEPLOY.md)** walks
through every step, plus backups and updates.

## Add the widget to a site

The dashboard's **Widget** page lets you try it, adjust the look and copy the code. It looks like this:

```html
<script src="https://feedback.example.com/kkw.js"></script>
<script>
  Feedback.init({
    project: 'my-app',
    turnstileSiteKey: '0x4AAAA…',
    privacyUrl: 'https://feedback.example.com/privacy',
    theme: { mode: 'auto', accent: '#0e7490' },
    console: { enabled: true, max: 150, maxBytes: 50000, redact: true, sendOn: ['bug'] },
    // user: { id: currentUser.id, plan: currentUser.plan },
  });
</script>
```

Theming options: [widget/THEMING.md](widget/THEMING.md).

## How it fits together

```
your site ── kkw.js ──▶ POST /v1/feedback ─┐
                                           ├─ server/  NestJS API, Better Auth  ──▶ PostgreSQL
browser ──▶ dashboard ─────────────────────┘  client/  Next.js dashboard
```

| Folder | |
|---|---|
| `widget/` | The widget (TypeScript, built with esbuild into `server/public/kkw.js`) |
| `server/` | API: feedback intake, dashboard API, sign-in (Better Auth), emails (Brevo) |
| `client/` | Dashboard (Next.js, React, Tailwind) |
| `db/` | Database migrations and `migrate.sh` |
| `deploy/`, `scripts/` | nginx / Caddy configs; setup, backup, restore, update scripts |
| `docs/` | Google and Apple sign-in setup |

## Local development

You need Node.js 22 and PostgreSQL 16.

```bash
# Database (once)
createdb feedback
PGDATABASE=feedback DB_INGEST_PASSWORD=dev-ingest DB_ADMIN_PASSWORD=dev-admin sh db/migrate.sh
PSQL="psql -d feedback" ./scripts/add-project.sh demo "Demo" DM

# Widget → server/public/kkw.js
cd widget && npm install && npm run build && cd ..

# API on :3000. Needs server/.env with BETTER_AUTH_SECRET (openssl rand -hex 32),
# DB_INGEST_PASSWORD=dev-ingest, DB_ADMIN_PASSWORD=dev-admin, ADMIN_URL=http://localhost:3001
cd server && npm install && npx prisma generate && npm run start:dev

# Dashboard on :3001 (another terminal)
cd client && npm install && npm run dev
```

Open <http://localhost:3001>: the first visit creates the owner account. Tests:
`npm test` in `server/` and `widget/`.

## License

[MIT](LICENSE)
