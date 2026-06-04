# pppoker.pro

## React static migration

The WordPress/Elementor export remains the source of truth during the first
migration stage. The React build pipeline reads every public `index.html`
route, parses legacy HTML into an AST, renders the document through React
server-side rendering, preserves the original `head`, `body` attributes,
content, metadata, scripts, and URL structure, then writes the static site to
`dist/`.

```bash
npm run build
npm run verify
```

Or run both:

```bash
npm run migrate:react
```

The generated `dist/react-route-manifest.json` lists every preserved route,
source file, route type, locale, language, title, canonical URL, hreflang
alternate links, JSON-LD count, key page landmarks, and legacy body fragment
inventory. SEO support files such as `robots.txt`, `sitemap_index.xml`, and
Yoast-generated sitemaps are copied into `dist/` alongside the existing
`assets/` tree.

The build also writes `dist/site-snippets.json` with the public SEO/social
snippet for each non-redirect route. Missing snippet fields are filled during
generation with safe localized fallbacks for meta description, canonical,
Open Graph, and Twitter preview tags.

Large page sections are rendered as React elements via `HtmlFragment`; raw HTML
injection is limited to `<script>` and `<style>` contents so legacy CSS/JS is
not corrupted during SSR.

The Russian homepage blog block is no longer an Elementor loop-grid. It is
rendered from `src/data/homepageBlogPosts.mjs` through the React
`HomepageBlogSection` component and can be refreshed in the source export with:

```bash
npm run render:homepage-blog
```

`npm run verify` compares critical SEO snapshots between the WordPress source
HTML and the React-generated output so incremental component replacements do
not silently drop titles, descriptions, canonical URLs, language attributes,
hreflang alternates, JSON-LD schema blocks, or the expected header/content/
footer/script fragment boundaries. It also checks generated Elementor
load-more targets and prevents duplicate article links in the homepage blog
loop. Snippet validation requires every non-redirect route to have populated
title, description, canonical URL, Open Graph preview, and Twitter preview.

See `docs/react-componentization.md` for the ordered React component extraction
plan.