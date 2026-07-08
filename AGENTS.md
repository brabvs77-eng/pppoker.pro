# Agent guide — pppoker.pro

Instructions for AI agents (Cursor Cloud Agent, AGENTS.md, Claude Code) working in this repository.

## Project overview

Marketing site for the **Nuts PPPoker** club. Production stack:

- **Next.js 15** (App Router, `output: 'export'`) in `apps/web/`
- **Static export** → `apps/web/out/` → **Cloudflare Pages**
- **Content** extracted from legacy WordPress/Elementor HTML at repo root (`index.html`, `blog/`, …)

Migration pattern: **Strangler Fig** — replace Elementor sections with native React components while keeping legacy HTML for the rest.

## Architecture

| Layer | Role |
|-------|------|
| **Native React** | `SiteHeader`, `SiteFooter`, `HomePromo`, `StructuredPost`, `NativeBlogArchive`, static `home-blog` |
| **Legacy Elementor** | Full page HTML in `content/bodies/*.html`; runtime JS only when `needsElementorRuntime` is true |
| **Build** | `npm run build` = export + verify; smoke is a separate step (GHA / local with Playwright) |

### Key paths

| Path | Purpose |
|------|---------|
| `apps/web/src/components/native/` | Native UI replacements |
| `apps/web/src/components/PageShell.tsx` | Composes chrome + body (legacy / structured post / blog archive) |
| `apps/web/src/config/site.ts` | Routes, contacts, chrome constants |
| `apps/web/src/config/elementor-chrome.json` | Elementor IDs, `homeBlogSlotRoutes` — single source for chrome CSS |
| `content/manifest.json` | Generated page index (do not hand-edit) |
| `content/posts/*.json` | Structured post bodies for `StructuredPost` |
| `scripts/extract-content.mjs` | HTML → manifest, bodies, `needsElementorRuntime` |
| `scripts/lib/elementor-runtime-budget.mjs` | Shared runtime detection + taxonomy redirect skip |
| `scripts/split-homepage-body.mjs` | Replaces legacy blog section with `#native-home-blog-slot` |
| `scripts/inject-home-blog-into-body.mjs` | Injects static home-blog HTML before Next build |

### Locales

`ru`, `en`, `uz`, `kz`, `hy`, `tj` — `localePrefix: 'as-needed'` (Russian unprefixed). `flatten-ru-export.mjs` maps `/ru/*` → site root in `out/`.

## Native vs legacy decision tree

1. **Structured post** (`hasStructuredPost`) → `StructuredPost`, no Elementor body/runtime
2. **Blog archive route** (`/blog/`, `/blog/page/N/`, locale variants) → `NativeBlogArchive`, no Elementor runtime
3. **Home blog slot** (`hideLegacyBlogSectionRoutes`) → static HTML in body; no client portal
4. **Everything else** → `WordPressBody` + Elementor CSS; load runtime only if `needsElementorRuntime`

`needsElementorRuntime` is false when body has no interactive widgets (swiper, FAQ accordion, slides, testimonials, loop-grid), or the route is a structured post, native page, blog archive, taxonomy redirect, or a static landing page that only embeds global Elementor popups.

## Hard constraints (CI will fail)

From `scripts/audit-rudiments.mjs`:

- **Do not** create `BlogArchive.tsx` or `PostArticle.tsx`
- **Do not** import `PostArticle` or `@/components/BlogArchive` (substring match in audit)
- Use **`NativeBlogArchive`** for blog index pages, **`StructuredPost`** for posts
- **Do not** reintroduce legacy React SSR scripts (`build-react-static-site.mjs`, etc.)

Home blog inject must run **before** `next build` (not post-export). Client portals into `#native-home-blog-slot` break Elementor hydration.

FAQ accordion hashes: `#Collapse-` (capital C), not `#collapse-`.

## Site contacts (do not change without user request)

Defined in `apps/web/src/config/site.ts` → `siteContacts`:

- Telegram manager: `https://t.me/NUTSsup`
- Telegram channel: `https://t.me/+Sj5sG5o0aqJkMTBi`
- WhatsApp: `https://wa.clck.bar/995592934850`

## Commands

```bash
# Full production build (required before merge)
npm ci && npm --prefix apps/web ci && npx playwright install chromium && npm run build && npm run smoke:homepage

# Local dev
npm run dev

# Individual checks
npm run audit:rudiments
npm run verify:structured-posts
npm run verify:native-blog-archive
npm run verify:elementor-runtime-budget
npm run verify:build-pipeline
npm run verify:landing-pages
npm run verify:home-blog
npm run verify:rss
npm run verify:taxonomy-redirects
npm run smoke:homepage
```

Cloudflare deploy: build command above; output `apps/web/out`; Node 20.

## Git workflow (Cloud Agent)

- Base branch: `main`
- Feature branches: `cursor/<descriptive-name>-3d19` (lowercase)
- Commit, push (`git push -u origin <branch>`), open/update PR
- Run full `npm run build` before considering work done

## Coding conventions

- **Minimize scope** — smallest correct diff; match existing style
- **DRY Elementor IDs** — add to `elementor-chrome.json`, emit via `emit:chrome-css`
- **i18n** — user-facing strings in `apps/web/messages/<locale>.json` (next-intl)
- **No over-engineering** — no extra abstractions for one-off logic
- **Tests/verify scripts** — add verify scripts for invariant behavior, not trivial unit tests

## Current native coverage (Sprint 30)

| Feature | Status |
|---------|--------|
| Header / footer / languages | All pages |
| HomePromo | All 6 homepages; `verify:home-promo`; smoke all 6 |
| Structured posts | 29 posts — RU, EN, UZ, KZ |
| Legal / about | `NativePage` — `/en/user-agreement/`, `/en/privacy-policy/`, `/rus/` |
| Blog archive | RU, EN, UZ, KZ — `NativeBlogArchive` |
| Home blog inject | `/`, `/hy/`, `/en/`, `/uz/`, `/kz/` (not `/tj/` — no legacy blog section in export) |
| Locale RSS | `/feed.xml`, `/en/feed.xml`, `/uz/feed.xml`, `/kz/feed.xml` |
| Category/tag archives | 301 → native `/blog/` (see `scripts/lib/taxonomy-blog-redirects.mjs`) |
| Elementor runtime budget | `needsElementorRuntime` in manifest; `verify:elementor-runtime-budget` |
| Cloudflare build | `npm run build` Playwright-free; `prebuild` installs `apps/web`; `verify:build-pipeline` |
| Conversion landings | `/spasibo/`, `/uz/thanks/`, `/uz/uzs/` — `verify:landing-pages` |

## Planned work (backlog)

1. ~~Home blog on `/en/`~~ — done (Sprint 21)
2. `NativePage` for locale-specific legal URLs when HTML exports exist (UZ/KZ/HY/TJ)
3. Home blog on `/tj/` — blocked until WordPress re-export includes legacy blog loop
4. Native blog archive for HY/TJ — blocked until `/hy/blog/`, `/tj/blog/` exist in export
5. More Elementor sections → native components

## Adding or updating content

1. Update legacy static HTML export (or re-export from WordPress)
2. Run `npm run build`
3. Deploy `apps/web/out`

## Docs

- [README.md](README.md) — commands, sprint history
- [docs/RUDIMENTS_AUDIT.md](docs/RUDIMENTS_AUDIT.md) — removed legacy artifacts
