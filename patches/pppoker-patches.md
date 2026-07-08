# PPPoker legacy HTML patches

Codemods and CI guards for defects found during the **Проверка сайта PPPoker** audit of the WordPress/Simply Static export at the repository root.

## Problem summary

| Issue | Scope | Automation |
|-------|-------|--------------|
| Broken KZ flag URL | ~70 `index.html` files (WPML footer + lang switcher) | **Auto-fix** |
| `but-back.png` not migrated to WebP | 6 homepages + Yoast sitemaps | **Auto-fix** |
| Duplicate / stray `robots` meta (robotext) | Occasional re-exports | **Auto-fix** |
| Russian copy leaked onto KZ homepage | `kz/index.html` (CRASH + Russian poker blocks) | **Auto-fix** |
| KZ promo blocks typography / video layout | `kz/index.html` + `globals.css` | **Manual + CI guard** |
| English Elementor popups on RU pages | `/`, `/blog/`, posts, etc. | **Report only** |

## File layout

```
patches/
  pppoker-patches.md     ← this document
  README.md              ← install / usage
  manual-steps.md        ← human steps for popup cleanup

scripts/patches/
  known-legacy-issues.mjs      ← issue catalog (single source of truth)
  kz-home-locale-content.mjs   ← KZ homepage Kazakh replacements
  fix-legacy-html.mjs          ← codemod runner

scripts/
  verify-kz-home-locale.mjs    ← CI guard for KZ promo blocks
```

## Auto-fixes

### 1. KZ flag path

**Before:** `/assets/media/flags/kz.png` (404 — directory removed during asset cleanup)

**After:** `/assets/vendor/sitepress-multilingual-cms/res/flags/kz.png`

### 2. Button back image WebP

**Before:** `/assets/media/2024/07/but-back.png` and `but-back-300x96.png`

**After:** matching `.webp` siblings (already present under `assets/media/2024/07/`)

Also applied to `page-sitemap.xml` and `apps/web/public/page-sitemap.xml`.

### 3. Robots meta robotext

Some exports contain **duplicate** `<meta name="robots" …>` tags (Yoast + plugin conflict). The codemod collapses consecutive duplicates to a single tag.

### 4. KZ homepage locale content

Simply Static / WPML re-exports sometimes copy **Russian** promo blocks onto the Kazakh homepage (`kz/index.html`):

- **CRASH block** — «Новый формат в клубе», «Старая добрая "Ракета"», …
- **Russian poker block** — «Русский покер уже в 🤝NUTS!», …

`fix-legacy-html.mjs` replaces the full Russian `<h2>` bodies with Kazakh copy from `kz-home-locale-content.mjs` (idempotent).

**CI guard:** `npm run verify:kz-home-locale` fails if:

- forbidden Russian markers reappear;
- required Kazakh markers are missing;
- `kz-promo-update` / `kz-promo-update__heading` layout classes are missing;
- CRASH video lacks `poster="/assets/media/2025/12/turbo.webp"` or `kz-promo-update__video` autoplay markup.

### 5. KZ promo block layout (manual)

After locale text is fixed, promo blocks still need **manual** HTML/CSS so Kazakh copy fits the media column and the CRASH video shows a preview or autoplays.

**Elementor containers (page 3116, `/kz/`):**

| Block | Container | Heading | Media |
|-------|-----------|---------|-------|
| CRASH | `db11841` | `d0c3511` | video `2dc7ec4` |
| Russian poker | `8982bde` | `b1fd9ad` | image `33a8a61` |

**Markup classes on `kz/index.html`:**

- `kz-promo-update` — grid container
- `kz-promo-update__text` — heading column
- `kz-promo-update__heading` — unified `<h2>` typography (both blocks)
- `kz-promo-update__media` — image/video column
- `kz-promo-update__video` — CRASH hosted video

**CRASH video** (`/assets/media/2025/12/video_2025-12-06_19-00-19.mp4`):

```html
<video class="elementor-video kz-promo-update__video"
  src="…mp4"
  poster="/assets/media/2025/12/turbo.webp"
  autoplay muted loop playsinline controls …></video>
```

Remove Optimization Detective lazy attributes (`od-lazy-video`, `data-od-removed-autoplay`) — they block autoplay.

**CSS** (`apps/web/src/app/globals.css`, scoped to `#wordpress-page-root[data-route='/kz/']`):

- 2-column grid: text | media (max 360×560px)
- Shared font: Roboto, `clamp(11px, 0.82vw, 13px)`, line-height 1.36
- Text column vertically centered, `overflow: hidden` — no top/bottom spill
- Media: `object-fit: cover`, matching aspect ratio

Not re-applied by `fix:legacy-html` on WordPress re-export — re-check after each import.

## Report-only: English popups on RU pages

RU locale pages (unprefixed paths — `/`, `/blog/`, `/vpip/`, …) sometimes embed **English** Elementor popup templates alongside the Russian ones:

- Template IDs: `886`, `834`, `893`, `840` (`data-elementor-id="886"` etc.)
- Marker copy: `First deposit bonus of 150% up to 500 dollars`, `Write a promo code to the operator`, …

The codemod **lists** these in the build log but does **not** delete DOM nodes — removing the wrong popup block can break Elementor runtime on pages that still need `needsElementorRuntime`.

See [manual-steps.md](./manual-steps.md).

## Commands

```bash
# Apply fixes to legacy export (idempotent; runs at start of npm run build)
npm run fix:legacy-html

# Dry-run: fail if auto-fixable issues remain
npm run fix:legacy-html:check

# CI regression guard (also scans legacy HTML for forbidden needles)
npm run audit:rudiments

# KZ homepage Kazakh copy + layout markup
npm run verify:kz-home-locale
```

## Build pipeline hook

`fix:legacy-html` runs **before** `strip:hekler` and `extract:content` so the manifest is generated from corrected source HTML.

`verify:kz-home-locale` runs after `audit:rudiments` inside `build:next`.

## After a fresh WordPress re-export

1. Copy new `index.html` trees into repo root (same layout as today).
2. Run `npm run fix:legacy-html`.
3. Review manual popup report; follow `manual-steps.md` if needed.
4. Re-apply any manual KZ promo layout edits in `kz/index.html` if the export overwrote them.
5. Run `npm run build`.

## Sprints

| Sprint | Scope |
|--------|-------|
| **38** | KZ flag, but-back WebP, robots meta, EN popup report-only, `audit:rudiments` needles |
| **39** | KZ homepage Kazakh locale (`kz-home-locale-content.mjs`, `verify:kz-home-locale`) |
| **40** | KZ promo layout: unified typography, grid fit, CRASH video poster/autoplay |
