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

1. In FastPanel create site `pppoker.pro` owned by `pppokerpro`.
2. Document root must be a normal directory: `/var/www/pppokerpro/data/www/pppoker.pro` (not a symlink).
3. **Nginx must be static** — this site is a Next.js export, not PHP. The default FastPanel PHP template causes **403** (`try_files … /index.php` + `fastcgi_pass`).
   - Sites → `pppoker.pro` → Nginx config → replace with [`pppoker.pro.nginx.conf`](./pppoker.pro.nginx.conf)
   - Or switch the site handler away from PHP-FPM / disable PHP for this site, then paste the same static `location /` block
   - `nginx -t` and reload (FastPanel usually does this on Save)
4. Add the **public** key matching `SSH_KEY_B64` to `~pppokerpro/.ssh/authorized_keys`.
5. Point DNS A records for `pppoker.pro` / `www` to `95.163.222.48` (grey-cloud if still on Cloudflare).

### Why 403 happens with the PHP template

```nginx
# BAD for static export:
location / {
    index index.php index.html;
    try_files $uri $uri/ /index.php?$args;  # → PHP-FPM → 403
}
location ~ \.php$ {
    fastcgi_pass unix:/var/run/pppoker.pro.sock;
}
```

```nginx
# GOOD:
index index.html;
location / {
    try_files $uri $uri/ $uri.html =404;
}
# no .php / @fallback blocks
```

## Notes

- Cloudflare `_redirects` / `_headers` in `apps/web/out` are ignored by nginx; redirects for FastPanel need nginx rules if you still rely on them.
- Do not deploy the WordPress HTML at the repo root — only `apps/web/out` after `npm run build`.
- Deploy replaces a `pppoker.pro → nutspoker.store` symlink with a real directory before rsync.
