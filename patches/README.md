# Legacy HTML patches

Automated fixes for known defects in the WordPress static export (`**/index.html` at repo root).

## Quick start

Files already live in this repository:

| File | Destination |
|------|-------------|
| `scripts/patches/known-legacy-issues.mjs` | `scripts/patches/known-legacy-issues.mjs` |
| `scripts/patches/kz-home-locale-content.mjs` | `scripts/patches/kz-home-locale-content.mjs` |
| `scripts/patches/fix-legacy-html.mjs` | `scripts/patches/fix-legacy-html.mjs` |
| `scripts/patches/fix-promo-video-blocks.mjs` | `scripts/patches/fix-promo-video-blocks.mjs` |
| `scripts/patches/fix-orphaned-popup-duplicates.mjs` | `scripts/patches/fix-orphaned-popup-duplicates.mjs` |
| `patches/manual-steps.md` | `patches/manual-steps.md` |
| `patches/pppoker-patches.md` | `patches/pppoker-patches.md` |

No manual copy step is required when working from a clone of this repo.

## If you received the zip bundle

1. Unzip **Проверка сайта PPPoker.zip** (or copy from `pppoker-patches.md`).
2. Place `known-legacy-issues.mjs` and `fix-legacy-html.mjs` under `scripts/patches/`.
3. Place `manual-steps.md` and `pppoker-patches.md` under `patches/`.
4. Merge the `package.json` diff (adds `fix:legacy-html` scripts and build hook).
5. Merge the `scripts/audit-rudiments.mjs` diff (legacy HTML regression checks).
6. Run:

```bash
npm run fix:legacy-html
npm run fix:orphaned-popup-duplicates
npm run fix:promo-video-blocks
npm run build
```

## What gets fixed automatically

- KZ flag: `/assets/media/flags/kz.png` → WPML vendor path
- `but-back.png` / `but-back-300x96.png` → WebP (including sitemaps)
- Duplicate `robots` meta tags (robotext)
- Orphaned popup DOM duplicates on RU pages (`fix-orphaned-popup-duplicates`)
- CRASH / Russian poker promo video autoplay, poster, column widths (`fix-promo-video-blocks`)
- KZ homepage Russian promo blocks → Kazakh (`kz/index.html`)

## What needs human review

English Elementor popups leaked onto RU pages — see [manual-steps.md](./manual-steps.md).

Full spec: [pppoker-patches.md](./pppoker-patches.md).
