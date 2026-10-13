#!/usr/bin/env bash
# Creates .env for a new Kudos Kit server, with fresh random secrets. Run once.
#   ./scripts/setup.sh kudoskit.io
set -euo pipefail
cd "$(dirname "$0")/.."

domain="${1:-}"
if [[ -z "$domain" || "$domain" == http* || "$domain" == */* ]]; then
  echo "Usage: ./scripts/setup.sh your.domain      (just the name, e.g. kudoskit.io)" >&2
  exit 1
fi
if [[ -e .env ]]; then
  echo ".env already exists, so nothing was changed. Edit it, or move it away to start over." >&2
  exit 1
fi

# 32 random bytes as hex: safe in URLs and shell, no escaping needed.
secret() {
  if command -v openssl >/dev/null; then openssl rand -hex 32
  else LC_ALL=C tr -dc 'a-f0-9' </dev/urandom | head -c 64; fi
}

umask 077
sed -e "s|^DOMAIN=.*|DOMAIN=${domain}|" \
    -e "s|^POSTGRES_PASSWORD=generated|POSTGRES_PASSWORD=$(secret)|" \
    -e "s|^DB_INGEST_PASSWORD=generated|DB_INGEST_PASSWORD=$(secret)|" \
    -e "s|^DB_ADMIN_PASSWORD=generated|DB_ADMIN_PASSWORD=$(secret)|" \
    -e "s|^BETTER_AUTH_SECRET=generated|BETTER_AUTH_SECRET=$(secret)|" \
    .env.example > .env
mkdir -p secrets backups

cat <<MSG
Created .env for https://${domain} with new secrets (readable only by you).

Next:
  1. Fill in the optional settings in .env (Turnstile, Brevo, Google, privacy page).
  2. docker compose up -d --build
  3. Put nginx (deploy/nginx/kudoskit.conf) or Caddy (COMPOSE_PROFILES=caddy) in front.
  4. ./scripts/add-project.sh <key> "<Name>" <PREFIX>   for each app that sends feedback
  5. Open https://${domain} and create the owner account.
See DEPLOY.md for each step.
MSG
