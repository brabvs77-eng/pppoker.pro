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
| **Native React** | `SiteHeader`, `SiteFooter`, `HomePromo`, `StructuredPost`, `NativeBlogArchive`, static `home-blog`, static `review-snippets` |
| **Legacy Elementor** | Full page HTML in `content/bodies/*.html`; runtime JS only when `needsElementorRuntime` is true |
| **Build** | `npm run build` = export + verify; smoke is a separate step (GHA / local with Playwright) |

### Key paths

| Path | Purpose |
|------|---------|
| `apps/web/src/components/native/` | Native UI replacements |
| `apps/web/src/components/PageShell.tsx` | Composes chrome + body (legacy / structured post / blog archive) |
| `apps/web/src/config/site.ts` | Routes, contacts, chrome constants |
| `apps/web/src/config/elementor-chrome.json` | Elementor IDs, `homeBlogSlotRoutes`, `homeReviewSlotRoutes` — single source for chrome CSS |
| `apps/web/src/config/review-snippets.json` | Fake review cards + aggregate rating per locale |
| `content/manifest.json` | Generated page index (do not hand-edit) |
| `content/posts/*.json` | Structured post bodies for `StructuredPost` |
| `scripts/extract-content.mjs` | HTML → manifest, bodies, `needsElementorRuntime` |
| `scripts/lib/elementor-runtime-budget.mjs` | Shared runtime detection + taxonomy redirect skip |
| `scripts/split-homepage-body.mjs` | Replaces legacy blog + reviews sections with native slots |
| `scripts/inject-home-blog-into-body.mjs` | Injects static home-blog HTML before Next build |
| `scripts/inject-review-snippets-into-body.mjs` | Injects static review cards + stars before Next build |

### Locales

`ru`, `en`, `uz`, `kz`, `hy`, `tj` — `localePrefix: 'as-needed'` (Russian unprefixed). `flatten-ru-export.mjs` maps `/ru/*` → site root in `out/`.

## Native vs legacy decision tree

1. **Structured post** (`hasStructuredPost`) → `StructuredPost`, no Elementor body/runtime
2. **Blog archive route** (`/blog/`, `/blog/page/N/`, locale variants) → `NativeBlogArchive`, no Elementor runtime
3. **Home blog slot** (`hideLegacyBlogSectionRoutes`) → static HTML in body; no client portal
4. **Home review slot** (`homeReviewSlotRoutes`) → static review cards + `ReviewSnippetsJsonLd`; no client portal
5. **Everything else** → `WordPressBody` + Elementor CSS; load runtime only if `needsElementorRuntime`

`needsElementorRuntime` is false when body has no interactive widgets (swiper, FAQ accordion, slides, testimonials, loop-grid), or the route is a structured post, native page, blog archive, taxonomy redirect, native home shell (`/`, `/en/`, `/hy/`, `/uz/`, `/kz/`), or a static landing page that only embeds global Elementor popups.

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

## UI design pipeline (Impeccable + Taste Skill)

Orchestrator: **`.agents/skills/ui-design-pipeline/SKILL.md`** — read this for every native UI task.

Context files (Impeccable reads these automatically):

| File | Role |
|------|------|
| `PRODUCT.md` | Register, users, brand personality, anti-references |
| `DESIGN.md` | Colors, typography, native component tokens |

### Flow

```
User request
    ↓
① Impeccable shape — design brief (reference/shape.md, NO code)
    ↓
② UI code — apps/web/src/components/native/ + globals.css + messages
    ↓
③ Taste Skill — design read + redesign audit (anti-slop)
    ↓
④ Impeccable detect + polish — npm run audit:ui-antipatterns
    ↓
⑤ npm run build → ship or iterate
```

### Installed skills

| Skill | Path | Phase |
|-------|------|-------|
| `impeccable` | `.cursor/skills/impeccable/SKILL.md` | shape, detect, polish, critique |
| `ui-design-pipeline` | `.agents/skills/ui-design-pipeline/SKILL.md` | orchestrator |
| `design-taste-frontend` | `.agents/skills/design-taste-frontend/SKILL.md` | visual pass |
| `redesign-existing-projects` | `.agents/skills/redesign-existing-projects/SKILL.md` | existing UI upgrades |

Install / update:

```bash
npx impeccable skills install --providers=cursor --scope=project
npx skills add https://github.com/Leonxlnx/taste-skill \
  --skill "design-taste-frontend" --skill "redesign-existing-projects"
```

Impeccable commands (in Cursor chat): `/impeccable shape …`, `/impeccable detect …`, `/impeccable polish …`.

Native UI defaults: editorial dark theme, Nuts gold `#fde661`, dials ~6/4/3.

## Commands

```bash
# Full production build (required before merge)
npm ci && npm --prefix apps/web ci && npx playwright install chromium && npm run build && npm run smoke:homepage && npm run smoke:landing-pages

# Fix known defects in legacy HTML export (also runs at start of build)
npm run fix:legacy-html
npm run fix:legacy-html:check   # dry-run: fail if auto-fixable issues remain

# Local dev
npm run dev

# Individual checks
npm run verify:ui-design-pipeline
npm run audit:ui-antipatterns   # after native UI changes (Impeccable detect)
npm run verify:structured-posts
npm run verify:native-blog-archive
npm run verify:elementor-runtime-budget
npm run verify:build-pipeline
npm run verify:landing-pages
npm run verify:home-blog
npm run verify:rss
npm run verify:taxonomy-redirects
npm run verify:below-fold-images
npm run smoke:homepage
npm run lighthouse:budget
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

## Current native coverage (Sprint 41 — C-track complete)

| Feature | Status |
|---------|--------|
| Header / footer / languages | All pages |
| HomePromo | All 6 homepages; `verify:home-promo`; smoke all 6 |
| Structured posts | 25 posts × 6 locales (RU + EN/UZ/KZ/HY/TJ via `post-translations/`) |
| Legal / about | `NativePage` — EN + UZ/KZ/HY/TJ user-agreement & privacy-policy; `/rus/` |
| Blog archive | All 6 locales — `NativeBlogArchive` (5 pages per locale at 25 posts) |
| Blog text colors | Full-width `.blog-surface` dark theme; `BlogBreadcrumbs` on archive + posts |
| Blog JSON-LD | `BreadcrumbList` + `BlogPosting` + `Organization`/`WebSite` with absolute URLs; `verify:json-ld` |
| Legacy HTML codemod | `fix:legacy-html` — KZ flag, but-back WebP, robots meta; `audit:rudiments` guards regression |
| Home blog inject | `/`, `/hy/`, `/en/`, `/uz/`, `/kz/`, `/tj/` (`appendBlogSlotWhenMissing` on TJ) |
| Locale RSS | `/feed.xml`, `/en/feed.xml`, `/uz/feed.xml`, `/kz/feed.xml`, `/hy/feed.xml`, `/tj/feed.xml` |
| Category/tag archives | 301 → native `/blog/` (see `scripts/lib/taxonomy-blog-redirects.mjs`) |
| Elementor runtime budget | `needsElementorRuntime` in manifest; `verify:elementor-runtime-budget` |
| Cloudflare build | `npm run build` Playwright-free; `prebuild` installs `apps/web`; `verify:build-pipeline` |
| Conversion landings | `/spasibo/`, `/uz/thanks/`, `/uz/uzs/` — `verify:landing-pages`; `smoke:landing-pages` |
| Dynamic sitemap | `scripts/generate-sitemap.mjs` from manifest; `verify:sitemap`; Yoast files replaced at build |
| hreflang BCP 47 | `apps/web/src/config/hreflang.json` (`kz→kk`, `tj→tg`); `verify:hreflang` |
| llms.txt | `/llms.txt` + head link; `verify:llms` |
| Analytics on native pages | `AnalyticsScripts` when Elementor runtime skipped; `verify:analytics` in GHA |
| Native footer social | Telegram channel + Instagram in `SiteFooter`; `#colophon` stripped on home; smoke checks |
| Lighthouse CI | `lighthouse:budget` in GHA after smoke — LCP ≤ 4500ms, CLS ≤ 0.10 on 5 homepages |
| Home FAQ accordion | `/`, `/hy/`, `/en/`, `/uz/`, `/kz/` — CSS `<details>`; `verify:home-faq`; smoke |
| Home registration steps | `/`, `/hy/`, `/en/`, `/uz/`, `/kz/` — CSS radio carousel; `verify:home-registration`; no Elementor swiper |
| Home cash games grid | `/`, `/hy/`, `/en/`, `/uz/`, `/kz/` — 3 static cards; `verify:home-cash-games` |
| Home Why NUTS grid | `/`, `/hy/`, `/en/`, `/uz/`, `/kz/` — 8 feature tiles; `verify:home-why-nuts` |
| Home hero | `/`, `/hy/`, `/en/`, `/uz/`, `/kz/` — headline, NUTS logo (LCP), Telegram CTA, bonus panel; `verify:home-hero` |
| Home app download | `/`, `/hy/`, `/en/`, `/uz/`, `/kz/` — store badges + `#reg` anchor; `verify:home-app-download` |
| Home promo blocks (CRASH / Russian Poker) | `/`, `/hy/`, `/en/`, `/uz/`, `/kz/` — static HTML + autoplay script; `verify:home-promo-blocks` |
| Home promo cards | `/`, `/hy/`, `/en/`, `/uz/`, `/kz/` — bonus/events/jackpot grid + modal triggers; `verify:home-promo-cards` |
| Home promo modals | `/`, `/hy/`, `/en/`, `/uz/`, `/kz/` — native `<dialog>` + stripped Elementor popups; `verify:home-promo-modals` |
| Dead homepage markup stripped | `/`, `/hy/`, `/en/`, `/uz/`, `/kz/`, `/tj/` — legacy `#masthead`, duplicate hero CTAs; `verify:home-dead-markup` |
| Native home shell (no Elementor JS) | `isNativeHomeShellRoute` — 5 homepages skip `needsElementorRuntime`; empty spacers stripped; Widster mount kept + `WidsterEmbed` script; `verify:home-shell` |

## Planned work (backlog)

1. ~~Post translations from RU (24 × 5 locales)~~ — done (Sprint 42, `post-translations/`)
2. ~~Native blog archive HY/TJ + pagination~~ — done (Sprint 42)
3. ~~Legal pages UZ/KZ/HY/TJ~~ — done (`page-translations/legal.json`, `seed:legal-pages`)
4. ~~Home Why NUTS grid~~ — done (Sprint C1, `home-why-nuts.json`, `inject:why-nuts`)
5. ~~Home app download~~ — done (Sprint C2, `home-app-download.json`, `inject:app-download`)
6. ~~Home promo cards~~ — done (Sprint C3, `home-promo-cards.json`, `inject:promo-cards`)
7. ~~Home hero~~ — done (Sprint C4, `home-hero.json`, `inject:home-hero`)
8. ~~EN translation quality pass~~ — done (Sprint EN-Q1: review, GTO, VPIP, EV, opponents)
9. **New post workflow** — add RU post → `catalog.json` → `post-translations/posts/*.json` → `npm run build`

## Adding or updating content

1. Add or edit RU post HTML at repo root (`/slug/index.html`) or translation JSON in `post-translations/`
2. Run `npm run build`
3. Deploy `apps/web/out`

## Docs

- [README.md](README.md) — commands, sprint history
- [docs/RUDIMENTS_AUDIT.md](docs/RUDIMENTS_AUDIT.md) — removed legacy artifacts
