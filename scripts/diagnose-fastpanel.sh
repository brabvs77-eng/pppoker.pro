#!/usr/bin/env bash
# Diagnose FastPanel docroot / 403 causes. Requires SSH_KEY_B64.
set -euo pipefail

HOST="${DEPLOY_HOST:-95.163.222.48}"
USER="${DEPLOY_USER:-pppokerpro}"
PORT="${DEPLOY_PORT:-2422}"

if [ -z "${SSH_KEY_B64:-}" ]; then
  echo "Missing SSH_KEY_B64"
  exit 1
fi

mkdir -p ~/.ssh
chmod 700 ~/.ssh
if printf '%s' "$SSH_KEY_B64" | grep -qE 'BEGIN .*PRIVATE KEY'; then
  printf '%s\n' "$SSH_KEY_B64" | sed 's/\r$//; s/\\n/\n/g' > ~/.ssh/deploy_key
else
  B64=$(printf '%s' "$SSH_KEY_B64" | tr -d '[:space:]')
  PAD=$(( (4 - ${#B64} % 4) % 4 ))
  printf '%s%*s' "$B64" "$PAD" '' | tr ' ' '=' | base64 -di > ~/.ssh/deploy_key
fi
chmod 600 ~/.ssh/deploy_key
ssh-keyscan -p "$PORT" -H "$HOST" >> ~/.ssh/known_hosts
SSH_OPTS=(-i ~/.ssh/deploy_key -p "${PORT}" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new)

ssh "${SSH_OPTS[@]}" "${USER}@${HOST}" bash -s <<'EOS'
set -euo pipefail
DOC="${HOME}/www/pppoker.pro"
echo "=== HOME=${HOME} DOC=${DOC} ==="
ls -lad "${DOC}" "${HOME}" "${HOME}/www" 2>&1 || true
echo "=== index.html ==="
ls -la "${DOC}/index.html" 2>&1 || true
stat "${DOC}/index.html" 2>&1 || true
echo "=== top of docroot ==="
ls -la "${DOC}" | head -40
echo "=== namei (perms along path) ==="
namei -l "${DOC}/index.html" 2>&1 || true
echo "=== recent error log ==="
tail -n 40 "${HOME}/logs/pppoker.pro-frontend.error.log" 2>&1 || true
echo "=== curl local via Host ==="
curl -skI -H 'Host: pppoker.pro' --resolve pppoker.pro:443:127.0.0.1 https://pppoker.pro/ 2>&1 | head -20 || true
curl -sI -H 'Host: pppoker.pro' http://127.0.0.1/ 2>&1 | head -15 || true
EOS
