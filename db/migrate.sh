#!/bin/sh
# Sets up or updates the Kudos Kit database. Safe to run any number of times.
#
#   1. Creates the two login roles, or updates their passwords, from:
#        DB_INGEST_PASSWORD   for feedback_ingest (the widget endpoint)
#        DB_ADMIN_PASSWORD    for feedback_admin  (the dashboard)
#   2. Applies every db/migrations/*.sql file not applied yet, in name order,
#      and records it in the schema_migrations table.
#
# Connects with the standard PostgreSQL variables, as the database owner:
#   PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
# In Docker this runs as the "migrate" service (see docker-compose.yml) on every start.
# On your laptop:  PGUSER=postgres PGDATABASE=feedback DB_INGEST_PASSWORD=… DB_ADMIN_PASSWORD=… sh db/migrate.sh
set -eu

: "${DB_INGEST_PASSWORD:?Set DB_INGEST_PASSWORD}"
: "${DB_ADMIN_PASSWORD:?Set DB_ADMIN_PASSWORD}"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-$(dirname "$0")/migrations}"

export PGOPTIONS="${PGOPTIONS:-} -c client_min_messages=warning"  # hide "already exists, skipping"
psql_run() { psql -X -q -v ON_ERROR_STOP=1 "$@"; }

echo "Kudos Kit database: roles"
psql_run -v ingest_pw="$DB_INGEST_PASSWORD" -v admin_pw="$DB_ADMIN_PASSWORD" <<'SQL'
SELECT 'CREATE ROLE feedback_ingest LOGIN' WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'feedback_ingest') \gexec
SELECT 'CREATE ROLE feedback_admin LOGIN'  WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'feedback_admin') \gexec
ALTER ROLE feedback_ingest WITH LOGIN PASSWORD :'ingest_pw';
ALTER ROLE feedback_admin  WITH LOGIN PASSWORD :'admin_pw';
CREATE TABLE IF NOT EXISTS schema_migrations (
  name       text        PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SQL

applied=0
for file in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
  name=$(basename "$file")
  done_already=$(printf "SELECT 1 FROM schema_migrations WHERE name = :'name';\n" | psql_run -tA -v name="$name")
  if [ "$done_already" = "1" ]; then continue; fi
  echo "Kudos Kit database: applying $name"
  psql_run -f "$file"
  printf "INSERT INTO schema_migrations (name) VALUES (:'name');\n" | psql_run -v name="$name"
  applied=$((applied + 1))
done

echo "Kudos Kit database: up to date ($applied new migration(s) applied)"
