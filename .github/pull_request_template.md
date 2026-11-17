## What and why

<!-- What does this change, and what problem does it solve? Link the issue if there is one. -->

## How I tested it

<!-- e.g. "npm test in server/", "sent feedback from the Widget page", screenshots for UI changes -->

## Checklist

- [ ] Tests pass (`npm test` in `server/` and `widget/`), lint passes (`npm run lint` in `server/` and `client/`)
- [ ] Widget changed? I ran `npm run build` in `widget/` and committed `server/public/kkw.js`
- [ ] Database changed? A **new** file in `db/migrations/` (never edit an applied one) and `server/prisma/schema.prisma` updated
- [ ] New setting? Added to `.env.example`, `docker-compose.yml` and the docs
- [ ] User-visible change? A line under "Unreleased" in `CHANGELOG.md`
- [ ] No secrets, real email addresses or customer data in code, tests or screenshots
