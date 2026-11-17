# Changelog

Notable changes to Kudos Kit. The format follows [Keep a Changelog](https://keepachangelog.com/),
and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0]

First public release.

### Widget

- One script tag (`kkw.js`), no dependencies. Steps: choose a type (bug, idea, praise) → write → thanks.
- Themable: colours, light/dark/auto, position, corner radius, font; host pages can override
  `--kkw-*` CSS variables.
- Bug reports include the page, browser and recent console messages and errors, with
  best-effort redaction of passwords, tokens and keys.
- Star ratings, and a testimonial request (with consent) for 4–5 star praise.
- Spam protection with Cloudflare Turnstile and a honeypot field; draft kept when closed.

### Dashboard

- Overview with daily stats; feedback inbox with filters, search and status
  (new → triaged → done); per-project references like `MS-12`.
- Testimonials: filter, "Copy as quote", withdraw consent.
- Projects page: add projects, rename, turn on/off.
- Widget page: live preview and install snippet.
- Dates shown in each viewer's own time zone.
- Home page introducing Kudos Kit for visitors who aren't signed in (`LANDING_PAGE=false` turns it off).

### Accounts and team

- Invite-only accounts with owner / admin / member roles; email + password, password reset.
- Optional Google and Apple sign-in; optional email through Brevo (invitations, new-feedback
  notifications).

### Privacy and operations

- Public privacy page; feedback deleted automatically after 90 days (configurable).
- Least-privilege database roles; rate limits.
- Docker Compose deployment behind nginx or Caddy; setup, backup, restore and update scripts.

[Unreleased]: https://github.com/AdventureSoftware/kudos-kit/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/AdventureSoftware/kudos-kit/releases/tag/v0.1.0
