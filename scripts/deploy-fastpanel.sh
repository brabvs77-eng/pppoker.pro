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
REMOTE_PATH=$(
  ssh "${SSH_OPTS[@]}" "${USER}@${HOST}" \
    "DEPLOY_PATH=$(printf %q "${DEPLOY_PATH:-}") bash -s" <<'EOS'
set -euo pipefail

WWW="${HOME}/www"
DOCROOT="${DEPLOY_PATH:-${WWW}/pppoker.pro}"

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

if [ -L "${DOCROOT}" ] || [ ! -d "${DOCROOT}" ]; then
  echo "Document root is not a real directory: ${DOCROOT}" >&2
  ls -lad "${DOCROOT}" >&2 || true
  ls -la "${WWW}" >&2 || true
  exit 1
fi

printf '%s\n' "${DOCROOT}"
EOS
)

echo "Resolved remote docroot: ${REMOTE_PATH}"

ssh "${SSH_OPTS[@]}" "${USER}@${HOST}" \
  "test -d $(printf %q "${REMOTE_PATH}") && ! test -L $(printf %q "${REMOTE_PATH}") && ls -lad $(printf %q "${REMOTE_PATH}")"

rsync -az --delete \
  -e "ssh ${SSH_OPTS[*]}" \
  "${OUT_DIR}/" \
  "${USER}@${HOST}:${REMOTE_PATH}/"

# 403 "directory index forbidden" → nginx cannot read index.html / traverse parents.
# Force 755 dirs + 644 files along the site path.
ssh "${SSH_OPTS[@]}" "${USER}@${HOST}" \
  "DOC=$(printf %q "${REMOTE_PATH}") bash -s" <<'EOS'
set -euo pipefail
chmod 755 "${HOME}" "${HOME}/www" "${DOC}"
find "${DOC}" -type d -exec chmod 755 {} +
find "${DOC}" -type f -exec chmod 644 {} +
echo "=== namei ==="
namei -l "${DOC}/index.html" || true
echo "=== index.html ==="
ls -la "${DOC}/index.html"
head -c 120 "${DOC}/index.html"; echo
echo "=== docroot top ==="
ls -la "${DOC}" | head -25
test -f "${DOC}/index.html"
echo "OK: index.html present and readable by site user"
EOS

echo "Deployed ${OUT_DIR}/ → ${USER}@${HOST}:${REMOTE_PATH}/"
echo "If HTTPS still 403: in nginx remove disable_symlinks; includes must use try_files \$uri \$uri/index.html"
