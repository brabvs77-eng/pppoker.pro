# pppoker.pro

Marketing site for the Nuts PPPoker club. The production stack is **Next.js 15** (App Router, static export) with content extracted from the legacy WordPress/Elementor static export.

## Architecture

| Path | Purpose |
|------|---------|
| `apps/web/` | Next.js application |
| `content/` | Generated page manifest + HTML bodies (build artifact) |
| `scripts/extract-content.mjs` | Parses legacy HTML, normalizes URLs, computes CSS budget |
| `scripts/compute-css-budget.mjs` | Splits core vs page-specific stylesheets |
| `src/lib/normalizeUrls.mjs` | Root-relative URL normalization |
| `scripts/prepare-next-public.mjs` | Copies `assets/`, `includes/`, sitemaps into `apps/web/public/` |
| `src/lib/wordpressHtml.mjs` | Shared HTML discovery utilities |
| `index.html`, `blog/`, … | Legacy WordPress static export (source for extraction) |

## Commands

```bash
# Full production build (extract → copy assets → Next static export)
npm run build

# Local development
npm run dev

# Verify all routes exist in apps/web/out
npm run verify:next

# Inspect core vs page-specific CSS split (after extract)
npm run analyze:styles

# Legacy React SSR wrapper (previous migration stage)
npm run build:legacy-react
```

## CSS budget and URL normalization

On extract, absolute `pppoker.pro` / `hekler.info` URLs in HTML, inline CSS (`url(...)`), and metadata become root-relative (`/assets/...`).

Stylesheets used on ≥85% of pages (plus homepage/header/footer seeds) are **core** and loaded once in `app/layout.tsx`. Each route only loads its **page-specific** diff (~15 files on average instead of the full ~70 on every page).

## Deploy

Vercel uses `vercel.json`:

- **Build:** `npm run build`
- **Output:** `apps/web/out`

## Adding or updating pages

1. Update the legacy static HTML export (or edit WordPress and re-export).
2. Run `npm run build` — content is re-extracted automatically.
3. Deploy.

## Next steps (optional improvements)

- Replace preserved Elementor HTML sections with native React components section by section.
- Add `next-intl` route prefixes with middleware if locale routing needs refinement.
- Wire headless CMS instead of HTML extraction when editorial workflow is ready.
