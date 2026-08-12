# FastPanel deployment (pppoker.pro)

Production target: VPS with **FASTPANEL**.

| Setting | Value |
|---------|--------|
| Host | `95.163.222.48` |
| SSH port | `2422` |
| Site user | `pppokerpro` |
| Document root | `/var/www/pppokerpro/data/www/pppoker.pro` (real directory, not a symlink) |
| Site home | `/var/www/pppokerpro/data` |
| Artifact | `apps/web/out/` (Next static export) |

## GitHub Actions

On push / merge to `main` (or **Actions → Build → Run workflow**):

1. `npm run build` + Playwright smoke
2. Ensure `$HOME/www/pppoker.pro` is a **real directory** (replace symlink if present)
3. `rsync --delete` of `apps/web/out/` → that directory

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
| `DEPLOY_PATH` | `$HOME/www/pppoker.pro` |

### Server setup (once)

1. In FastPanel create site `pppoker.pro` owned by `pppokerpro` (static / nginx is enough — no PHP required for this export).
2. Document root must be a normal directory: `/var/www/pppokerpro/data/www/pppoker.pro` (not a symlink to `nutspoker.store`).
3. Add the **public** key matching `SSH_KEY_B64` to `~pppokerpro/.ssh/authorized_keys`.
4. Point DNS A records for `pppoker.pro` / `www` to `95.163.222.48` (if the domain still proxies through Cloudflare, either grey-cloud the A record or change nameservers).

## Notes

- Cloudflare `_redirects` / `_headers` in `apps/web/out` are ignored by nginx; redirects for FastPanel need nginx rules if you still rely on them.
- Do not deploy the WordPress HTML at the repo root — only `apps/web/out` after `npm run build`.
- A previous broken symlink `pppoker.pro → nutspoker.store` caused deploys to land in the wrong place; the script now forces a real `pppoker.pro` directory.
