#!/usr/bin/env bash
# Adds a project: an app or website that sends feedback through the widget.
#   ./scripts/add-project.sh my-shop "My Shop" MS
#     key     used in the widget's Feedback.init({ project: 'my-shop' }); lowercase, a-z 0-9 -
#     name    shown in the dashboard
#     PREFIX  optional, for references like MS-12; made from the key when left out
# Running it again for the same key updates the name (and prefix, if given) and re-activates it.
set -euo pipefail
cd "$(dirname "$0")/.."

key="${1:-}" name="${2:-}" prefix="${3:-}"
if [[ ! "$key" =~ ^[a-z0-9][a-z0-9-]{0,39}$ || -z "$name" ]]; then
  echo 'Usage: ./scripts/add-project.sh <key> "<Name>" [PREFIX]   e.g. my-shop "My Shop" MS' >&2
  exit 1
fi
if [[ -n "$prefix" && ! "$prefix" =~ ^[A-Za-z][A-Za-z0-9]{0,4}$ ]]; then
  echo "PREFIX: 1 to 5 letters or digits, starting with a letter (e.g. MS)." >&2
  exit 1
fi

# PSQL can be overridden to run against another database (e.g. local development).
PSQL=${PSQL:-docker compose exec -T db psql -U kudoskit -d feedback}
$PSQL -X -q -v ON_ERROR_STOP=1 -v key="$key" -v name="$name" -v prefix="$prefix" <<'SQL'
INSERT INTO projects (key, name, prefix) VALUES (:'key', :'name', NULLIF(:'prefix', ''))
ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, active = true,
  prefix = COALESCE(NULLIF(:'prefix', ''), projects.prefix);
\pset footer off
SELECT key, name, prefix AS "reference prefix", active FROM projects WHERE key = :'key';
SQL
