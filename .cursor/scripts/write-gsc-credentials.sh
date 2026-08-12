#!/usr/bin/env bash
set -euo pipefail

TARGET=".cursor/secrets/gsc-service-account.json"

mkdir -p .cursor/secrets

if [ -n "${GSC_SERVICE_ACCOUNT_JSON:-}" ]; then
  printf '%s' "$GSC_SERVICE_ACCOUNT_JSON" > "$TARGET"
  chmod 600 "$TARGET"
  echo "GSC credentials written from GSC_SERVICE_ACCOUNT_JSON."
elif [ -f "$TARGET" ]; then
  echo "GSC credentials already present at ${TARGET}."
else
  echo "No GSC credentials yet."
  echo "Cloud: add GSC_SERVICE_ACCOUNT_JSON in Cursor Dashboard → Secrets."
  echo "Local: cp ~/Downloads/yes-i-can-travel-*.json ${TARGET}"
fi
