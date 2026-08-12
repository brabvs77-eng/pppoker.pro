#!/usr/bin/env bash
# Deploy apps/web/out to FastPanel over SSH/rsync.
# Required env: SSH_KEY_B64
# Optional: DEPLOY_HOST DEPLOY_USER DEPLOY_PORT DEPLOY_PATH
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="${ROOT_DIR}/apps/web/out"

HOST="${DEPLOY_HOST:-95.163.222.48}"
USER="${DEPLOY_USER:-pppokerpro}"
PORT="${DEPLOY_PORT:-2422}"

if [ ! -d "${OUT_DIR}" ]; then
  echo "Missing ${OUT_DIR} — run npm run build first"
  exit 1
fi

if [ -z "${SSH_KEY_B64:-}" ]; then
  echo "Missing secret SSH_KEY_B64 (base64-encoded private key) for ${USER}@${HOST}"
  exit 1
fi

mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Accept raw PEM or base64 (with/without whitespace/padding)
if printf '%s' "$SSH_KEY_B64" | grep -qE 'BEGIN .*PRIVATE KEY'; then
  printf '%s\n' "$SSH_KEY_B64" | sed 's/\r$//; s/\\n/\n/g' > ~/.ssh/deploy_key
else
  B64=$(printf '%s' "$SSH_KEY_B64" | tr -d '[:space:]')
  PAD=$(( (4 - ${#B64} % 4) % 4 ))
  printf '%s%*s' "$B64" "$PAD" '' | tr ' ' '=' | base64 -di > ~/.ssh/deploy_key
fi
chmod 600 ~/.ssh/deploy_key

if ! ssh-keygen -y -f ~/.ssh/deploy_key >/dev/null 2>&1; then
  echo "SSH_KEY_B64 did not decode to a usable private key"
  exit 1
fi

ssh-keyscan -p "$PORT" -H "$HOST" >> ~/.ssh/known_hosts

SSH_OPTS=(-i ~/.ssh/deploy_key -p "${PORT}" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new)

# FastPanel site users are often chrooted to /var/www/<user>, so the
# docroot is /data/www/pppoker.pro from inside the jail — not the host path.
REMOTE_PATH=$(
  ssh "${SSH_OPTS[@]}" "${USER}@${HOST}" \
    "DEPLOY_PATH=$(printf %q "${DEPLOY_PATH:-}") bash -s" <<'EOS'
set -euo pipefail
candidates=()
if [ -n "${DEPLOY_PATH}" ]; then
  candidates+=("${DEPLOY_PATH}")
fi
candidates+=(
  "/data/www/pppoker.pro"
  "${HOME}/data/www/pppoker.pro"
  "/var/www/pppokerpro/data/www/pppoker.pro"
)
for p in "${candidates[@]}"; do
  if [ -d "${p}" ] && [ -w "${p}" ]; then
    readlink -f "${p}"
    exit 0
  fi
done
echo "No writable document root among candidates:" >&2
printf '  %s\n' "${candidates[@]}" >&2
echo "Remote diagnostics:" >&2
echo "pwd=$(pwd)" >&2
ls -la >&2 || true
ls -la /data/www >&2 || true
ls -lad /var/www/pppokerpro/data/www/pppoker.pro /data/www/pppoker.pro >&2 || true
exit 1
EOS
)

echo "Resolved remote docroot: ${REMOTE_PATH}"

rsync -az --delete \
  -e "ssh ${SSH_OPTS[*]}" \
  "${OUT_DIR}/" \
  "${USER}@${HOST}:${REMOTE_PATH}/"

echo "Deployed ${OUT_DIR}/ → ${USER}@${HOST}:${REMOTE_PATH}/"
