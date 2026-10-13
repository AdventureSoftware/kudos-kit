#!/usr/bin/env bash
# Replaces ALL data with a backup made by scripts/backup.sh.
#   ./scripts/restore.sh backups/kudoskit-2026-10-13-0315.dump
# On a new server: run setup.sh and "docker compose up -d" first, then restore.
set -euo pipefail
cd "$(dirname "$0")/.."

file="${1:-}"
if [[ ! -f "$file" ]]; then
  echo "Usage: ./scripts/restore.sh backups/kudoskit-….dump" >&2
  ls -1t backups/kudoskit-*.dump 2>/dev/null | head -5 | sed 's/^/  /' >&2 || true
  exit 1
fi

echo "This replaces everything in the database (feedback, accounts, projects) with: $file"
read -r -p "Type 'restore' to continue: " answer
[[ "$answer" == "restore" ]] || { echo "Nothing changed."; exit 1; }

docker compose stop server client
docker compose exec -T db pg_restore -U kudoskit -d feedback --clean --if-exists --no-owner --single-transaction < "$file"
docker compose up -d
echo "Restored. Everyone has to sign in again if the backup is older than their login."
