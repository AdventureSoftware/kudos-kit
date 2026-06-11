# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**kudos-kit** is a self-hosted cross-product feedback/bug-report widget system for Adventure Software SRL. It consists of:
- A vanilla JS widget snippet (`kkw.js`) embeddable in any site
- A NestJS ingest API receiving feedback submissions
- A Next.js admin page for reviewing submissions

The authoritative product spec is in `feedback-widget-spec.md` — read it before implementing anything new.

## Repository Structure

This is a monorepo with two independent sub-projects, each with their own `package.json`, `node_modules`, `.git`, and npm scripts:

- `client/` — Next.js 16 admin page (React 19, Tailwind CSS v4)
- `server/` — NestJS 11 ingest API

Run all commands from within the relevant subdirectory.

## Commands

### Server (NestJS)
```bash
cd server
npm run start:dev     # dev with watch
npm run build         # compile to dist/
npm run start:prod    # run compiled output
npm run test          # unit tests (Jest, matches *.spec.ts)
npm run test:e2e      # e2e tests (test/jest-e2e.json)
npm run lint          # ESLint + Prettier fix
```

### Client (Next.js)
```bash
cd client
npm run dev           # dev server
npm run build         # production build
npm run lint          # ESLint
```

## Architecture

### Widget (`kkw.js`)
A single hosted vanilla JS file — no npm package. Must work in Next.js apps and static BizPage sites.
- Always-init pattern: mounts on page load, visibility toggled via `Feedback.show()`/`hide()`
- Captures auto-context on submit (URL, UA, viewport, build, timestamp)
- Ring-buffer console patch installed at init time, transmitted only on `type === 'bug'`
- Safe serializer with circular-safe replacer, depth limits, and best-effort redaction before transmit

### Ingest API (`server/`)
Single endpoint `POST /v1/feedback`. Guards run in order:
1. Payload size cap (nginx + in-app, ~256KB)
2. Honeypot field check (silent 200 on non-empty)
3. Project allowlist lookup (Postgres `projects` table)
4. Turnstile server-side verification
5. Per-IP rate limiting
6. class-validator DTO schema validation
7. INSERT via `feedback_ingest` DB role (INSERT-only)
8. Async notification fire (Telegram bot)

CORS is open to all origins — security relies on Turnstile + project key, not origin.

### Database (Postgres)
Two tables: `projects` (allowlist) and `feedback`. Two DB roles:
- `feedback_ingest` — INSERT on feedback, SELECT on projects only
- `feedback_admin` — SELECT + UPDATE(status) on feedback, SELECT on projects

### Admin Page (`client/`)
Auth-gated Next.js page. Reads via `feedback_admin` role server-side only. Actions: status toggle (new/triaged/done) and delete (for GDPR erasure requests).

## Next.js Version Warning

The client uses **Next.js 16**, which has breaking changes from prior versions. Read `node_modules/next/dist/docs/` before writing client-side code — don't rely on training data conventions for routing, data fetching, or config.

## Key Constraints

- **No two-way replies, no screenshots, no network capture, no WebSockets** — all deferred past v1.
- Widget payload cap: ~5000 chars for message; console logs capped at 150 entries / 50KB total.
- Redaction (`/authorization|bearer\s+|password|secret|api[_-]?key|token|set-cookie/i`) is best-effort — never claim logs are PII-free.
- GDPR: console logs + IP are personal data. Implement retention purge (90-day cron) and delete action in admin.
- Deployment target: `feedback.agileturtles.com` on existing Hetzner box, behind nginx/Caddy reverse proxy, NestJS running as non-root systemd service.