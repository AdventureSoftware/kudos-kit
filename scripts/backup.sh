#!/usr/bin/env bash
# Saves the whole database to backups/kudoskit-YYYY-MM-DD-HHMM.dump and removes backups
# older than KEEP_DAYS (default 14). Backups contain personal data: keep them private,
# and copy them off the server regularly (a backup on the same disk doesn't survive it).
#   ./scripts/backup.sh
# Nightly at 03:15, with crontab -e:
#   15 3 * * * cd /opt/kudoskit && ./scripts/backup.sh >> backups/backup.log 2>&1
set -euo pipefail
cd "$(dirname "$0")/.."

umask 077
mkdir -p backups
file="backups/kudoskit-$(date +%Y-%m-%d-%H%M).dump"
docker compose exec -T db pg_dump -U kudoskit -d feedback --format=custom --no-owner > "$file.part"
mv "$file.part" "$file"
find backups -name 'kudoskit-*.dump' -mtime +"${KEEP_DAYS:-14}" -delete
echo "$(date '+%F %T') saved $file ($(du -h "$file" | cut -f1))"
