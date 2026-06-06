# Cloudflare Pages deployment

Production deploy target for **pppoker.pro**.

## Dashboard settings

| Setting | Value |
|---------|--------|
| **Build command** | `npm ci && npm --prefix apps/web ci && npm run build` |
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
