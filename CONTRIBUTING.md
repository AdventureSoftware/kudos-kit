# Contributing to Kudos Kit

Thanks for helping! Bug reports, ideas, documentation fixes and code are all welcome.

- **Questions or setup help**: GitHub Discussions.
- **Bugs and ideas**: open an issue (the templates ask for what we need).
- **Security problems**: never in a public issue; see [SECURITY.md](SECURITY.md).

For anything bigger than a small fix, please open an issue first so we can agree on the
approach before you spend time on it.

## Getting it running

Follow **Local development** in the [README](README.md): PostgreSQL 16, Node.js 22, then the
widget, the API (port 3000) and the dashboard (port 3001). The first visit to
<http://localhost:3001> creates the owner account.

For the spam check on your own machine, use Cloudflare's Turnstile test keys: site key
`1x00000000000000000000AA` with secret `1x0000000000000000000000000000000AA`. They only
work together.

## Before you open a pull request

Run the same checks as CI:

```bash
cd widget && npm test && npm run build && cd ..        # rebuilds server/public/kkw.js
cd server && npx prisma generate && npx eslint "{src,test}/**/*.ts" && npm test && npm run build && cd ..
cd client && npm run lint && npm run build && cd ..
```

`npm run lint` in `server/` also fixes what it can; CI runs ESLint without fixing.

## How the code is organised

| Folder | Notes |
|---|---|
| `widget/` | Plain TypeScript, no dependencies, built by esbuild into `server/public/kkw.js`. **Commit the rebuilt `kkw.js`** with your widget change; CI checks it's up to date. Theming rules: `widget/THEMING.md`. |
| `server/` | NestJS. Sign-in is Better Auth; every route needs a signed-in user unless marked `@AllowAnonymous()`. Owner/admin-only actions use `@OrgRoles`. Jest can't load Better Auth (ESM), so tests use `test/mocks/nestjs-better-auth.ts`. |
| `client/` | Next.js (App Router), React, Tailwind. Pages stay thin; logic lives in `src/components/`, shared building blocks in `src/components/ui/`. Next.js 16 differs from older versions: check its docs rather than older examples. |
| `db/` | SQL migrations, applied in name order by `db/migrate.sh`. |

### Database changes

- Add a **new** numbered file in `db/migrations/` (e.g. `007_something.sql`). Never change a
  migration that has been released: existing installations have already applied it.
- Migrations must be safe on a database that has data in it.
- The API uses two database roles: `feedback_ingest` (the public feedback endpoint: insert only)
  and `feedback_admin` (the dashboard). Grant new tables and columns to the role that needs them,
  and no more.
- Update `server/prisma/schema.prisma` to match, then `npx prisma generate`.

### New settings

A new environment variable goes in `.env.example` (with a comment), `docker-compose.yml`
and the docs. Kudos Kit should keep working when an optional setting is empty.

### Privacy

Feedback can contain personal data (console logs, IP addresses, user IDs). Keep the
defaults privacy-friendly: collect only what helps fix the problem, keep the redaction in
the widget, and update the public privacy page (`client/src/app/privacy/`) when what is
collected or stored changes.

## Changelog

Add a line under **Unreleased** in [CHANGELOG.md](CHANGELOG.md) for anything a user or
self-hoster would notice.

## Conduct

Be kind and assume good intent. Harassment or personal attacks aren't tolerated in issues,
pull requests or discussions; maintainers may remove such content and block those involved.

## License

By contributing, you agree that your contribution is licensed under the
[MIT License](LICENSE), like the rest of Kudos Kit.
