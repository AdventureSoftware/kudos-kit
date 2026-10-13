#!/usr/bin/env bash
# Updates to the latest code: backup, pull, rebuild, restart. Database changes in
# db/migrations are applied automatically when the containers start.
#   ./scripts/update.sh
set -euo pipefail
cd "$(dirname "$0")/.."

./scripts/backup.sh
git pull --ff-only
docker compose up -d --build
docker image prune -f >/dev/null
docker compose ps
