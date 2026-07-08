# Manual steps — English popups on RU pages

The codemod (`npm run fix:legacy-html`) **detects but does not remove** English Elementor popup templates embedded in Russian locale HTML exports.

## Why not automated?

- RU pages legitimately ship **both** RU popup IDs (`3989`, `3946`, `3981`, `3997`) and leaked EN template IDs (`886`, `834`, `893`, `840`).
- Blind deletion of `elementor-location-popup` blocks can break pages where `needsElementorRuntime` is still `true`.
- Popup DOM is large (inline `<style id="elementor-post-886">` + markup); diff noise is high — verify visually before editing.

## How to find affected files

Run:

```bash
npm run fix:legacy-html
```

Look for log lines under **Manual review required**. Typical hits:

- `index.html` (RU homepage)
- Other unprefixed routes: `/blog/`, `/vpip/`, posts, tags, …

## What to inspect in the browser

1. Open the page locally (`npm run dev`) or staging.
2. Trigger promo popups (bonus / jackpot / registration CTAs).
3. Confirm language matches the page locale (Russian on unprefixed URLs).
4. In DevTools, search HTML for:
   - `data-elementor-id="886"` (EN first-deposit popup)
   - `data-elementor-id="834"` (EN scroll-lock popup)
   - English headings: `First deposit bonus of 150% up to 500 dollars`

## Safe removal checklist

Only after confirming the EN block is a duplicate:

1. Remove the **entire** popup subtree starting at  
   `<div data-elementor-type="popup" data-elementor-id="886" …>` through its closing `</div>` siblings at the same depth.
2. Remove matching inline styles: `<style id="elementor-post-886">…</style>` (and `834`, `893`, `840` if present).
3. Re-run `npm run build` and `npm run verify:homepage-widgets`.
4. Smoke-test popup triggers on that route.

## Re-export alternative

Prefer fixing popup assignments in WordPress (Elementor → Theme Builder → Popups, WPML language) and re-running Simply Static, then `npm run fix:legacy-html` + `npm run build`.
