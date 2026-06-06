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

# Fail if legacy migration artifacts reappear
npm run audit:rudiments
```

## CSS budget and URL normalization

On extract, legacy `hekler.info` URLs are rewritten to `pppoker.pro`, then converted to root-relative paths (`/assets/...`). `npm run verify:no-hekler` fails the build if the old domain leaks into generated output.

Stylesheets used on ≥85% of pages (plus homepage/header/footer seeds) are **core** and loaded once in the locale layout. Each route only loads its **page-specific** diff.

## Sprint 2 features

- **next-intl** — locales `ru`, `en`, `uz`, `kz`, `hy`, `tj` with `localePrefix: 'as-needed'` (Russian without prefix)
- **Typed blog routes** — `/blog/`, `/blog/page/N/` (dedicated App Router pages)
- **Structured posts** — article HTML extracted to `content/posts/*.json` (reserved for RSS/API)
- **JSON-LD** — Yoast blocks rendered from manifest (`JsonLd` component)
- **Sitemap** — `app/sitemap.ts` generated from manifest
- **Body classes** — applied on `#wordpress-page-root` (no client-side `BodyAttributes`)

## Sprint 3 features

- **Cloudflare redirects** — legacy URLs (`/team/*`, `/elementor-hf/*`, …) synced to `deploy/cloudflare/_redirects` via `npm run sync:redirects`
- **Blog visual parity** — `/blog/` and pagination render full Elementor HTML from extract (not the minimal `BlogArchive` list)
- **Homepage** — blog loop grid hidden via CSS (`elementor-element-39eeae8`)
- **Dev routing** — `next-intl` middleware for local `npm run dev`

## Sprint 4 features

- **Post pages** — full Elementor body HTML (header, footer, layout parity with legacy)
- **SEO** — `robots.txt` points to Yoast `sitemap_index.xml`; hreflang includes `x-default`; sitemap excludes redirects
- **Site head** — charset, viewport, favicons in locale layout; correct BCP 47 `lang` per locale
- **CI** — GitHub Actions workflow runs `npm run build` on push/PR
- **`verify:redirects`** — ensures `deploy/cloudflare/_redirects` stays in sync with manifest
- **`verify:cloudflare`** — ensures `_redirects` and `_headers` are present in `apps/web/out`

## Sprint 5 features

See also [docs/RUDIMENTS_AUDIT.md](docs/RUDIMENTS_AUDIT.md).

- **Locale 404** — `[locale]/not-found.tsx` with translated copy
- **i18n navigation** — `createNavigation` helpers in `src/i18n/navigation.ts`
- **Site config** — `hideLegacyBlogSectionRoutes` hides Elementor blog on RU `/`
- **SEO** — `og:image` and `publishedAt` in manifest; sitemap uses post dates
- **Redirects** — `/ru` and `/ru/*` → unprefixed paths (after flatten export)
- **`verify:links`** — broken root-relative links in extracted bodies fail the build

## Sprint 6 features

- **Rudiment cleanup** — removed legacy React SSR pipeline, unused `BlogArchive` / `PostArticle`, duplicate `sitemap.ts`, create-next-app CSS
- **`audit:rudiments`** — CI guard against reintroducing legacy artifacts
- **Strangler Fig** — native `HomePromo` React strip on `/` and `/hy/` (manager + Telegram CTA)
- **Docs** — [docs/RUDIMENTS_AUDIT.md](docs/RUDIMENTS_AUDIT.md)

## Sprint 7 features

- **HomePromo i18n** — copy in `messages/*.json` via next-intl; WhatsApp CTA added
- **Deduped nav** — hides Elementor `menu-item-3206` when native promo is active
- **RSS feed** — `npm run generate:rss` → `/feed.xml` (32 RU posts from `content/posts/`)

## Sprint 8 features

- **`SiteFooter`** — native footer on every page: locale switcher, blog, contacts, legal links
- **`LocaleSwitcher`** — from manifest `hreflang`; hides Elementor/WPML switchers
- **`data-native-chrome`** — marks pages using native chrome (footer + dedupe rules)

## Sprint 9 features

- **`SiteHeader`** — sticky bar: logo, nav (mobile drawer), languages, manager link
- **Elementor footer hidden** — `#colophon` / `.main_footer` replaced by native footer
- **`lib/navigation.ts`** — shared locale-aware href helpers for header/footer

## Sprint 10 features

- **Elementor header hidden** — global template `elementor-3180` in `#masthead` hidden when native chrome is active (page content / single-post templates remain)

## Sprint 11 features

- **HomePromo dedupe** — hides hero play button (`d014ade`), hotspot (`404896e`), manager icon row (`b5a91f5`); keeps bonus/headline column
- **Secondary nav** — hides `elementor-3120` strip in `#masthead` on promo homepages (`/`, `/hy/`)

## Sprint 12 features

- **Secondary nav (all RU)** — `elementor-3120` hidden on every page with `data-native-chrome` (~43 RU routes), not only home
- **Hero spacing** — removes `80px` top padding on homepage root (`23c91dc`) under native header + HomePromo

## Sprint 13 features

- **Header spacers** — hides empty `8141f77` (blog/archive) and `3f45d89` (posts/pages) `100px` blocks left for the old fixed Elementor header

## Homepage blog (RU)

- Legacy Elementor blog grid hidden on `/` (`data-hide-legacy-blog`)
- Native `HomeBlogRotator`: 6 cards, daily start offset, client rotation every 8s

## Sprint 14 features

- **Masthead dedupe (all locales)** — hides Elementor HF header (`data-elementor-post-type="elementor-hf"`) and secondary `section` nav in `#masthead` (EN `256`/`445`, UZ, KZ, not only RU `3180`/`3120`)
- **Manager nav item** — hides `menu-item-3206` on every `data-native-chrome` page
- **Empty masthead** — zeroes padding on `#masthead` after Elementor chrome is removed

## Deploy (Cloudflare Pages)

See [deploy/cloudflare/README.md](deploy/cloudflare/README.md).

| Setting | Value |
|---------|--------|
| Build command | `npm ci && npm --prefix apps/web ci && npm run build` |
| Output directory | `apps/web/out` |
| Node.js | `20` |

`npm run build` copies `_redirects` and `_headers` into `apps/web/out/` for Cloudflare edge rules.

## Adding or updating pages

1. Update the legacy static HTML export (or edit WordPress and re-export).
2. Run `npm run build` — content is re-extracted automatically.
3. Deploy.

## Next steps (optional improvements)

- More `components/native/*` blocks to replace Elementor sections.
- Headless CMS instead of HTML extraction when editorial workflow is ready.
- Remove `flatten-ru-export.mjs` if Next/next-intl static routing improves for default locale.
