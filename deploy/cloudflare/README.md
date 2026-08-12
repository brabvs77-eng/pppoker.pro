# Cloudflare Pages deployment

Production deploy target for **pppoker.pro**.

## GitHub Actions deploy (preferred)

Push / merge to `main` (or **Actions → Build → Run workflow**) builds the site, runs smoke tests, then deploys `apps/web/out` with Wrangler.

Required repository secrets:

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token with **Cloudflare Pages — Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID from Cloudflare dashboard |
| `CLOUDFLARE_PROJECT_NAME` | Pages project name (e.g. `pppoker-pro`) |

If you also keep the Cloudflare Pages **Git integration**, turn off automatic builds in the Pages project so only Actions deploys (avoids double builds).

## Dashboard settings (Git-connected Pages, optional)

| Setting | Value |
|---------|--------|
| **Build command** | `npm run build` |
| **Build output directory** | `apps/web/out` |
| **Node.js version** | `20` (see repo `.nvmrc`) |

## Build pipeline

`npm run build` extracts legacy HTML, runs Next.js static export, flattens RU paths, then copies:

- `_redirects` — 301 rules from `content/manifest.json` (legacy `/team/*`, `/elementor-hf/*`, `/ru/*`, …)
- `_headers` — long-lived cache for `/assets/*`, `/_next/static/*`, `.webp`

Both files land in `apps/web/out/` via `npm run emit:cloudflare`.

## Regenerating redirects

After manifest changes:

```bash
npm run extract:content   # if manifest changed
npm run sync:redirects    # writes deploy/cloudflare/_redirects
npm run emit:cloudflare   # copies into apps/web/out (after build)
```

## Notes

- Legacy HTML in the repo root (`index.html`, `blog/`, …) is the **extract source**, not the deploy artifact.
- `content/` and `apps/web/out/` are build artifacts (gitignored); Cloudflare must run the full build on each deploy.
- Trailing slashes: Next export uses `trailingSlash: true`; prefer linking to paths with a trailing `/`.
- Playwright smoke (`npm run smoke:homepage`) runs in GitHub Actions after `npm run build`, not inside the build script — Cloudflare Pages does not need Playwright.
- `prebuild` runs `npm --prefix apps/web ci` automatically before `npm run build`, so Cloudflare only needs the root `npm ci` (automatic) plus `npm run build`.
