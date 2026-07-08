# PPPoker legacy HTML patches

Codemods and CI guards for defects found during the **Проверка сайта PPPoker** audit of the WordPress/Simply Static export at the repository root.

## Problem summary

| Issue | Scope | Automation |
|-------|-------|--------------|
| Broken KZ flag URL | ~70 `index.html` files (WPML footer + lang switcher) | **Auto-fix** |
| `but-back.png` not migrated to WebP | 6 homepages + Yoast sitemaps | **Auto-fix** |
| Duplicate / stray `robots` meta (robotext) | Occasional re-exports | **Auto-fix** |
| English Elementor popups on RU pages | `/`, `/blog/`, posts, etc. | **Report only** |

## File layout

```
patches/
  pppoker-patches.md     ← this document
  README.md              ← install / usage
  manual-steps.md        ← human steps for popup cleanup

scripts/patches/
  known-legacy-issues.mjs   ← issue catalog (single source of truth)
  fix-legacy-html.mjs       ← codemod runner
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
```

## Build pipeline hook

`fix:legacy-html` runs **before** `strip:hekler` and `extract:content` so the manifest is generated from corrected source HTML.

## After a fresh WordPress re-export

1. Copy new `index.html` trees into repo root (same layout as today).
2. Run `npm run fix:legacy-html`.
3. Review manual popup report; follow `manual-steps.md` if needed.
4. Run `npm run build`.

## Sprint

**Sprint 38** — legacy HTML hygiene codemod + audit regression.
