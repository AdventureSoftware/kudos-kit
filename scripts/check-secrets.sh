#!/usr/bin/env bash
# Looks for passwords, keys and .env files anywhere in the git history (not just the
# current files). Run it before pushing, e.g. after adding new settings or scripts.
#   ./scripts/check-secrets.sh
set -uo pipefail
cd "$(dirname "$0")/.."
found=0

echo "1. Sensitive file names ever committed:"
if git log --all --name-only --format= | sort -u | grep -E '(^|/)\.env(\.[a-z]+)?$|\.p8$|\.pem$|\.key$|(^|/)secrets/|\.dump$' | grep -v '\.env\.example$'; then
  found=1
else
  echo "   none"
fi

echo "2. Known secret patterns in any commit:"
patterns='GOCSPX-|xkeysib-|BEGIN [A-Z ]*PRIVATE KEY|BETTER_AUTH_SECRET=[0-9a-f]{20}|(^|[^_])ADMIN_PASSWORD=.|JWT_SECRET=.|password '"'"'[^'"'"']+'"'"''
# Placeholders in docs and examples are not secrets: CHANGE_ME…, <…>, '...', generated.
placeholder='CHANGE_ME|=<[^>]*>|=\.\.\.|=generated|password '"'"'\.\.\.'"'"''
# This script and the settings template contain the patterns / placeholders themselves.
skip=(-- . ':(exclude)scripts/check-secrets.sh' ':(exclude).env.example')
matches=$(git log --all -p -G"$patterns" --format='COMMIT %h %s' "${skip[@]}" | awk -v pat="$patterns" -v ph="$placeholder" '
  /^COMMIT / { commit = substr($0, 8); shown = 0; next }
  /^\+/ && $0 ~ pat && $0 !~ ph { if (!shown) { print "   commit " commit; shown = 1 } print "     " $0 }')
if [[ -n "$matches" ]]; then
  echo "$matches" | head -40
  found=1
else
  echo "   none"
fi

if command -v docker >/dev/null; then
  echo "3. gitleaks (thorough scan of the full history):"
  docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:latest detect --source=/repo --redact --no-banner
  case $? in
    0) ;;
    1) found=1 ;;
    *) echo "   Could not run gitleaks (is Docker running?). Steps 1 and 2 still count." ;;
  esac
else
  echo "3. Skipped gitleaks (Docker not installed)."
fi

if [[ $found -ne 0 ]]; then
  echo
  echo "Something sensitive is in the history. If it was pushed, treat it as public: change those"
  echo "passwords/keys right away. If it wasn't pushed yet, remove it from the commit first."
  exit 1
fi
echo
echo "Nothing found."
