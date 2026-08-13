#!/usr/bin/env bash
# Try to install deploy/fastpanel/pppoker.pro.nginx.conf on the VPS (needs sudo).
# Required env: SSH_KEY_B64
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CONF_SRC="${ROOT_DIR}/deploy/fastpanel/pppoker.pro.nginx.conf"
CONF_DST="/etc/nginx/fastpanel2-sites/pppokerpro/pppoker.pro.conf"

HOST="${DEPLOY_HOST:-95.163.222.48}"
USER="${DEPLOY_USER:-pppokerpro}"
PORT="${DEPLOY_PORT:-2422}"

if [ ! -f "${CONF_SRC}" ]; then
  echo "Missing ${CONF_SRC}"
  exit 1
fi

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

REMOTE_TMP="/tmp/pppoker.pro.nginx.conf.$$"
scp -P "${PORT}" -i ~/.ssh/deploy_key -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new \
  "${CONF_SRC}" "${USER}@${HOST}:${REMOTE_TMP}"

ssh "${SSH_OPTS[@]}" "${USER}@${HOST}" bash -s <<'EOS'
set -euo pipefail
DOC="${HOME}/www/pppoker.pro"
echo "=== docroot ==="
ls -lad "${DOC}" || true
test -f "${DOC}/index.html" && echo "index.html OK" || echo "MISSING index.html"
echo "=== recent error log ==="
tail -n 30 "${HOME}/logs/pppoker.pro-frontend.error.log" 2>/dev/null || true

REMOTE_TMP_FILE=$(ls /tmp/pppoker.pro.nginx.conf.* 2>/dev/null | tail -1 || true)

if sudo -n true 2>/dev/null; then
  echo "=== applying nginx config with sudo ==="
  if [ -z "${REMOTE_TMP_FILE}" ]; then
    echo "missing uploaded conf in /tmp"
    exit 1
  fi
  sudo cp "${REMOTE_TMP_FILE}" /etc/nginx/fastpanel2-sites/pppokerpro/pppoker.pro.conf
  sudo nginx -t
  sudo systemctl reload nginx || sudo service nginx reload
  echo "nginx reloaded"
  rm -f "${REMOTE_TMP_FILE}"
else
  echo "NO_SUDO: cannot write /etc/nginx/fastpanel2-sites/pppokerpro/pppoker.pro.conf"
  echo "Paste deploy/fastpanel/pppoker.pro.nginx.conf in FastPanel → site → Nginx config, then Save."
  rm -f /tmp/pppoker.pro.nginx.conf.* 2>/dev/null || true
  exit 42
fi
EOS
