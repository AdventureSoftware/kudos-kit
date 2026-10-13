# Deploying Kudos Kit

Kudos Kit runs as four Docker containers on one server:

| Container | What it is |
|---|---|
| `db` | PostgreSQL 16. Data lives in the Docker volume `kudoskit_pgdata`. |
| `migrate` | Runs at every start: creates the database roles and applies `db/migrations`, then exits. |
| `server` | The API (NestJS): the widget endpoint, sign-in, and `/kkw.js`. |
| `client` | The dashboard (Next.js). |

In front of them, something has to handle HTTPS and route requests:

- **nginx already on the server** (as on our Hetzner machine): use `deploy/nginx/kudoskit.conf`.
- **A fresh server**: set `COMPOSE_PROFILES=caddy` in `.env` and the `caddy` container gets
  and renews certificates by itself. Skip step 4.

Only three paths reach the API from outside: `/v1/feedback`, `/api/auth/…` and `/kkw.js`.
Everything else goes to the dashboard. The containers listen on `127.0.0.1` only.

---

## Try it on your own computer first

With Docker Desktop running, from the repository folder (ports 80 and 443 must be free):

```bash
./scripts/setup.sh localhost
# in .env:  COMPOSE_PROFILES=caddy
#           TURNSTILE_SECRET=1x0000000000000000000000000000000AA   (Cloudflare's always-pass test secret)
docker compose up -d --build
./scripts/add-project.sh demo "Demo" DM
```

Open <https://localhost>. Caddy uses its own local certificate, so the browser warns once:
choose to continue. Create the owner account, then try the **Widget** page. When done:
`docker compose down` (add `-v` to also delete the test database).

---

## 0. Before you start

- A Linux server with **Docker Engine and the compose plugin**:
  `docker compose version` should print v2 or newer. Install: <https://docs.docker.com/engine/install/>
- The domain's DNS **A record** points at the server (and an **AAAA** record if it has IPv6):

  ```bash
  dig +short kudoskit.io        # must print the server's IP
  ```
- With nginx: `certbot` with its nginx plugin (`sudo apt install certbot python3-certbot-nginx`).
- Ports 3100 and 3101 free on the server (`ss -ltn | grep -E ':310[01]'` prints nothing),
  or pick others with `SERVER_PORT` / `CLIENT_PORT` in `.env`.
- From the Kudos Kit owner: the values for Turnstile, Brevo, Google sign-in and the privacy
  page (step 2). Pass them on privately, not in chat or email.

## 1. Get the code

```bash
sudo mkdir -p /opt/kudoskit && sudo chown "$USER" /opt/kudoskit
git clone https://github.com/<org>/kudos-kit.git /opt/kudoskit
cd /opt/kudoskit
```

## 2. Settings

```bash
./scripts/setup.sh kudoskit.io
```

This creates `.env` (readable only by you) with new random database passwords and
the session secret. Then open `.env` and fill in the rest; every setting is explained there.

| Setting | Needed for |
|---|---|
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET` | Spam protection for the widget. Required before real users. |
| `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `BREVO_TO_EMAIL` | Invitations, password resets, new-feedback alerts. Without them, links appear in `docker compose logs server`. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | "Continue with Google" (optional). See `docs/sign-in-providers.md`. |
| `APPLE_…` | "Continue with Apple" (optional). Put the `.p8` key in `secrets/`, see step 2b. |
| `PRIVACY_OPERATOR`, `PRIVACY_CONTACT_EMAIL`, `PRIVACY_HOSTING` | The public privacy page. |

### 2b. Apple key (only with Apple sign-in)

```bash
cp ~/AuthKey_ABC123DEFG.p8 secrets/
sudo chown -R 1000:1000 secrets && chmod 700 secrets && chmod 600 secrets/*.p8   # the container runs as uid 1000
# in .env:  APPLE_PRIVATE_KEY_PATH=/app/secrets/AuthKey_ABC123DEFG.p8
```

## 3. Start

```bash
docker compose up -d --build
```

The first build takes a few minutes. Then check:

```bash
docker compose ps
#   db, server, client: "Up … (healthy)"     migrate: "Exited (0)"
curl -s http://127.0.0.1:3100/v1/setup/status
#   {"needsSetup":true,…}
```

If something isn't healthy: `docker compose logs migrate server client`.

## 4. nginx and HTTPS (skip with Caddy)

```bash
sudo cp deploy/nginx/kudoskit-ratelimit.conf /etc/nginx/conf.d/
sudo cp deploy/nginx/kudoskit.conf /etc/nginx/sites-available/kudoskit
# Another domain or other ports? Edit server_name / 3100 / 3101 in that file now.
sudo ln -s /etc/nginx/sites-available/kudoskit /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d kudoskit.io
```

Certbot adds HTTPS to the file and renews the certificate automatically. Check:

```bash
curl -sI https://kudoskit.io/login | head -1     # HTTP/2 200
```

The nginx file limits feedback to 5 submissions per minute per visitor (burst of 10) and
256 KB per submission. Keep `X-Forwarded-For $remote_addr` as it is: appending the visitor's
own header instead would let anyone fake their IP and get around the limits.

## 5. Projects

Each app or website that sends feedback is a project:

```bash
./scripts/add-project.sh colorpage "Colorpage" CP
```

`CP` makes references like CP-12. In the dashboard, the **Widget** page then shows the code
to paste into that site.

## 6. Owner account (do this right away)

Open `https://kudoskit.io`. On a fresh install it shows **Create the owner account**: the
first person to fill it in becomes the owner, so do it as soon as the site is reachable.
Everyone else joins by invitation (Team page).

## 7. Backups

```bash
./scripts/backup.sh               # writes backups/kudoskit-YYYY-MM-DD-HHMM.dump, keeps 14 days
```

Every night, with `crontab -e`:

```cron
15 3 * * * cd /opt/kudoskit && ./scripts/backup.sh >> backups/backup.log 2>&1
```

Also copy `backups/` off the server regularly (e.g. with Hetzner Storage Box or `rsync`):
a backup on the same disk doesn't survive the disk. Backups contain personal data.

Restore (replaces everything, asks first):

```bash
./scripts/restore.sh backups/kudoskit-2026-10-13-0315.dump
```

## 8. Updates

```bash
./scripts/update.sh               # backup, git pull, rebuild, restart; database changes apply themselves
```

## Everyday commands

```bash
docker compose ps                         # what's running
docker compose logs -f server             # API log (also shows invite/reset links when email is off)
docker compose restart client             # after changing PRIVACY_* or TURNSTILE_SITE_KEY in .env
docker compose up -d                      # after changing other settings in .env
docker compose exec db psql -U kudoskit -d feedback    # database shell
```

## Security notes

- `.env`, `secrets/` and `backups/` must stay on the server; they're in `.gitignore`.
- Changing `BETTER_AUTH_SECRET` signs everyone out. Changing the `DB_*_PASSWORD` values is
  safe: `migrate` updates the roles on the next `docker compose up -d`.
- The database roles are least-privilege: the widget's role can only add feedback, and the
  dashboard's role can't change table structure.
- Feedback older than `FEEDBACK_RETENTION_DAYS` (default 90) is deleted automatically every day.

---

## Publishing on GitHub (for the maintainers)

Before the repository goes public, check the whole git history for secrets:

```bash
./scripts/check-secrets.sh
```

If it finds anything (an old `.env`, a password in a SQL file), the simplest fix is to publish
a **fresh history** with one commit, while keeping the private repository as it is:

```bash
git checkout --orphan public
git add -A
git commit -m "Kudos Kit"

# Check just that branch, in a separate copy (the script scans every branch it can see):
git clone --single-branch --branch public . /tmp/kudos-kit-public
(cd /tmp/kudos-kit-public && ./scripts/check-secrets.sh)

# Only when it says "Nothing found":
git push git@github.com:<org>/kudos-kit.git public:main
```

Change any password or key that ever appeared in the old history, even after this.
