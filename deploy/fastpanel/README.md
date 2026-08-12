# FastPanel deployment (pppoker.pro)

Production target: VPS with **FASTPANEL**.

| Setting | Value |
|---------|--------|
| Host | `95.163.222.48` |
| SSH port | `2422` |
| Site user | `pppokerpro` |
| Document root | `/var/www/pppokerpro/data/www/pppoker.pro` → symlink to `…/nutspoker.store` |
| Site home | `/var/www/pppokerpro/data` (`$HOME/www/…`) |
| Artifact | `apps/web/out/` (Next static export) |

## GitHub Actions

On push / merge to `main` (or **Actions → Build → Run workflow**):

1. `npm run build` + Playwright smoke
2. `rsync --delete` of `apps/web/out/` → document root over SSH

### Required secret

| Secret | Description |
|--------|-------------|
| `SSH_KEY_B64` | Private SSH key for `pppokerpro`, **base64-encoded** (`base64 -w0 id_ed25519` / `base64 -w0 id_rsa`). |

### Optional secrets (override defaults)

| Secret | Default |
|--------|---------|
| `DEPLOY_HOST` | `95.163.222.48` |
| `DEPLOY_USER` | `pppokerpro` |
| `DEPLOY_PORT` | `2422` |
| `DEPLOY_PATH` | auto-detect (`/data/www/pppoker.pro` in chroot, else host path) |

### Server setup (once)

1. In FastPanel create site `pppoker.pro` owned by `pppokerpro` (static / nginx is enough — no PHP required for this export).
2. Add the **public** key matching `DEPLOY_SSH_KEY` to `~pppokerpro/.ssh/authorized_keys`.
3. Point DNS A records for `pppoker.pro` / `www` to `95.163.222.48` (if the domain still proxies through Cloudflare, either grey-cloud the A record or change nameservers).

## Notes

- Cloudflare `_redirects` / `_headers` in `apps/web/out` are ignored by nginx; redirects for FastPanel need nginx rules if you still rely on them.
- Do not deploy the WordPress HTML at the repo root — only `apps/web/out` after `npm run build`.
