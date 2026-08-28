# New blog post workflow

Step-by-step guide for adding a structured blog post to pppoker.pro. The site uses a **Strangler Fig** pattern: the RU post is extracted from legacy HTML, rendered natively via `StructuredPost`, and locale copies come from JSON translation files.

## Architecture (quick reference)

| Layer | Path | Role |
|-------|------|------|
| RU source HTML | `/{slug}/index.html` | WordPress/Elementor export; build input |
| Catalog | `apps/web/src/config/post-translations/catalog.json` | Post id, RU route, slugs, image, date |
| Translations | `apps/web/src/config/post-translations/posts/{id}.json` | `en` / `uz` / `kz` / `hy` / `tj` title, description, bodyHtml |
| Seeded locale HTML | `/{locale}/{slug}/index.html` | Generated before extract; feeds hreflang + sitemap |
| Structured routes | `apps/web/src/config/structured-post-routes.json` | Synced by `seed:post-translations` |
| Runtime | `StructuredPost` + `NativeBlogArchive` | No Elementor body/runtime on posts |

**Canonical source of truth for translated copy:** `post-translations/posts/*.json` (not hand-edited seeded HTML).

## Checklist

```
[ ] 1. RU HTML at /{slug}/index.html
[ ] 2. catalog.json entry (id, sourceRoute, slugs, image, publishedAt)
[ ] 3. post-translations/posts/{id}.json (5 locales)
[ ] 4. npm run polish:post-translations
[ ] 5. npm run verify:post-translations
[ ] 6. npm run build  (seed → extract → export → verify)
[ ] 7. Deploy apps/web/out
```

---

## 1. Add RU source HTML

Create **`/{slug}/index.html`** at the repo root (same layout as existing posts).

### Required head metadata

- `<title>… — Nuts PPPoker</title>` (or legacy RU suffix; extract normalizes)
- `<meta name="description" content="…">`
- `<link rel="canonical" href="/{slug}/">`
- `<meta property="article:published_time" content="2026-…">` (ISO 8601)
- `<meta property="og:image" content="/assets/media/…">` — hero / featured image

### Required body structure

Extract looks for **`.elementor-widget-theme-post-content`**. Wrap article HTML inside it (see `chto-takoe-pppoker/index.html`).

Body copy rules:

- Paragraphs/headings/list items use `class="has-white-color has-text-color"`
- Images: root-relative `/assets/media/…`, include `alt`, prefer WebP
- Internal links: root-relative (`/author-roman-shaposhnikov/`, `/blog/`, other posts)
- Author line: link to `/author-roman-shaposhnikov/` is fine for RU

### Tags (optional)

Tags are inferred from legacy `/tag/{slug}/` archive pages (`scripts/lib/post-tags.mjs`). New tags need matching archive HTML under `tag/` if you want them on cards/RSS.

---

## 2. Register in catalog

Edit **`apps/web/src/config/post-translations/catalog.json`**. Append an object:

```json
{
  "id": "my-new-post",
  "sourceRoute": "/my-new-post/",
  "publishedAt": "2026-03-01T12:00:00+00:00",
  "image": "/assets/media/2026/03/my-new-post-hero.webp",
  "slugs": {
    "en": "my-new-post-en-slug",
    "uz": "my-new-post-uz-slug",
    "kz": "my-new-post-kz-slug",
    "hy": "my-new-post-hy-slug",
    "tj": "my-new-post-tj-slug"
  }
}
```

| Field | Notes |
|-------|--------|
| `id` | Stable key; matches `post-translations/posts/{id}.json` and RU `content/posts/{id}.json` after extract |
| `sourceRoute` | RU URL, trailing slash |
| `slugs` | URL segment only (no locale prefix); must be unique per locale |
| `image` | Used in blog cards + JSON-LD |
| `publishedAt` | Sort order for blog archive + RSS |

---

## 3. Create translation JSON

File: **`apps/web/src/config/post-translations/posts/{id}.json`**

Each locale (`en`, `uz`, `kz`, `hy`, `tj`) needs:

```json
{
  "en": {
    "title": "Human-readable title — Nuts PPPoker",
    "description": "Meta description, 1–2 sentences.",
    "bodyHtml": "<p class=\"has-white-color has-text-color\">…</p>"
  }
}
```

### Constraints (`verify:post-translations`)

- Every locale: non-empty `title`, `description`, `bodyHtml`
- **Title must end with** ` — Nuts PPPoker` (em dash)
- `bodyHtml` must include `has-white-color` classes on text blocks

### Option A — Machine translation bootstrap

After the RU post exists in `content/posts/` (run extract once or full build):

```bash
npm run generate:post-translations -- my-new-post
```

Uses RU structured JSON + Google Translate. **Always human-review** EN (and spot-check other locales).

### Option B — Hand-written JSON

Copy structure from an existing post (e.g. `agenty-v-pokere.json`). Translate title, description, and bodyHtml manually.

---

## 4. Polish internal links

```bash
npm run polish:post-translations
```

Rewrites in all locale `bodyHtml`:

- `/author-roman-shaposhnikov/` → `/{locale}/author-roman-shaposhnikov/`
- `/blog/` → `/{locale}/blog/`
- Cross-post links via `catalog.json` RU routes → locale slugs
- `/` homepage links → `/{locale}/`

EN titles can be tuned in `scripts/polish-post-translations.mjs` (`EN_COPY_OVERRIDES`) or directly in JSON.

---

## 5. Verify translations

```bash
npm run verify:post-translations
```

Fix any reported missing fields or title suffix violations before building.

---

## 6. Full build

```bash
npm run build
```

Build pipeline (relevant steps):

1. `seed:post-translations` — writes `/{locale}/{slug}/index.html`, syncs `structured-post-routes.json`
2. `extract:content` — RU → `content/posts/{id}.json`, manifest, hreflang patches
3. Next static export → `apps/web/out/`
4. Verifiers: `verify:structured-posts`, `verify:native-blog-archive`, `verify:rss`, `verify:sitemap`, `verify:hreflang`, `verify:json-ld`

### Spot-check after build

- RU: `https://pppoker.pro/{slug}/`
- EN: `https://pppoker.pro/en/{en-slug}/`
- Post appears on `/blog/` page 1 (newest by `publishedAt`)
- Locale RSS feeds include the new entry

---

## 7. Deploy

Output directory: **`apps/web/out/`** → Cloudflare Pages (or FastPanel sync).

---

## Updating an existing post

| Change | Action |
|--------|--------|
| RU body only | Edit `/{slug}/index.html` → `npm run build` |
| Translation copy | Edit `post-translations/posts/{id}.json` → `polish:post-translations` → `build` |
| New locale slug | Update `catalog.json` slugs + translation JSON → `build` |
| Hero image | Update `catalog.json` `image` + HTML og:image → `build` |

Do **not** hand-edit seeded `/{locale}/{slug}/index.html` — it is overwritten every build.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Post renders legacy Elementor body | Missing `.elementor-widget-theme-post-content` in RU HTML, or `catalog.json` / translation JSON incomplete |
| `verify:post-translations` title suffix | Ensure title ends with ` — Nuts PPPoker` |
| Wrong hreflang cluster | Check `catalog.json` `sourceRoute` + all five `slugs` |
| Broken author link on EN post | Run `npm run polish:post-translations` |
| Post missing from blog index | Check `publishedAt`; archive paginates 6 posts per page |
| HY/TJ not in structured routes | Missing `{id}.json` locale block or slug in catalog |

---

## Related commands

```bash
npm run generate:post-translations -- [post-id]   # MT bootstrap from RU content/posts
npm run polish:post-translations                  # locale links + EN title touch-ups
npm run verify:post-translations
npm run seed:post-translations                    # seed locale HTML only (part of build)
npm run verify:structured-posts
npm run verify:rss
```

See also: [AGENTS.md](../AGENTS.md), [README.md](../README.md).
