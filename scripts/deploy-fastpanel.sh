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

# Ensure docroot is a REAL directory at pppoker.pro (not a symlink to nutspoker.store).
# FastPanel / nginx document root is /var/www/pppokerpro/data/www/pppoker.pro.
REMOTE_PATH=$(
  ssh "${SSH_OPTS[@]}" "${USER}@${HOST}" \
    "DEPLOY_PATH=$(printf %q "${DEPLOY_PATH:-}") bash -s" <<'EOS'
set -euo pipefail

WWW="${HOME}/www"
DOCROOT="${DEPLOY_PATH:-${WWW}/pppoker.pro}"

# If someone set an absolute host path, map it into the site-user home layout.
case "${DOCROOT}" in
  /var/www/pppokerpro/data/www/pppoker.pro)
    DOCROOT="${WWW}/pppoker.pro"
    ;;
esac

if [ -L "${DOCROOT}" ]; then
  echo "Replacing symlink ${DOCROOT} -> $(readlink "${DOCROOT}") with a real directory" >&2
  rm -f "${DOCROOT}"
fi

if [ ! -d "${DOCROOT}" ]; then
  echo "Creating document root ${DOCROOT}" >&2
  mkdir -p "${DOCROOT}"
fi

# Refuse to deploy into a symlink (rsync mkdir EEXIST / empty panel view)
if [ -L "${DOCROOT}" ] || [ ! -d "${DOCROOT}" ]; then
  echo "Document root is not a real directory: ${DOCROOT}" >&2
  ls -lad "${DOCROOT}" >&2 || true
  ls -la "${WWW}" >&2 || true
  exit 1
fi

# Print the path as the site user sees it (no readlink -f — that would
# follow a symlink if one reappears).
printf '%s\n' "${DOCROOT}"
EOS
)

echo "Resolved remote docroot: ${REMOTE_PATH}"

# Verify remotely that the path is a real directory (not a symlink) before sync
ssh "${SSH_OPTS[@]}" "${USER}@${HOST}" \
  "test -d $(printf %q "${REMOTE_PATH}") && ! test -L $(printf %q "${REMOTE_PATH}") && ls -lad $(printf %q "${REMOTE_PATH}")"

rsync -az --delete \
  -e "ssh ${SSH_OPTS[*]}" \
  "${OUT_DIR}/" \
  "${USER}@${HOST}:${REMOTE_PATH}/"

# Confirm files landed in pppoker.pro itself
ssh "${SSH_OPTS[@]}" "${USER}@${HOST}" \
  "ls -lad $(printf %q "${REMOTE_PATH}") && test -f $(printf %q "${REMOTE_PATH}")/index.html && echo OK: index.html present && ls $(printf %q "${REMOTE_PATH}") | head"

echo "Deployed ${OUT_DIR}/ → ${USER}@${HOST}:${REMOTE_PATH}/"
