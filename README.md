# pppoker.pro

Marketing site for the Nuts PPPoker club. The production stack is **Next.js 15** (App Router, static export) with content extracted from the legacy WordPress/Elementor static export.

## Architecture

| Path | Purpose |
|------|---------|
| `apps/web/` | Next.js application |
| `content/` | Generated page manifest + HTML bodies (build artifact) |
| `scripts/extract-content.mjs` | Parses legacy `**/index.html` into `content/` |
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

# Legacy React SSR wrapper (previous migration stage)
npm run build:legacy-react
```

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
