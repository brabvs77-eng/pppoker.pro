# pppoker.pro

## React static migration

The WordPress/Elementor export remains the source of truth during the first
migration stage. The React build pipeline reads every public `index.html`
route, renders it through React server-side rendering, preserves the original
`head`, `body` attributes, content, metadata, scripts, and URL structure, then
writes the static site to `dist/`.

```bash
npm run build
npm run verify
```

Or run both:

```bash
npm run migrate:react
```

The generated `dist/react-route-manifest.json` lists every preserved route,
language, title, canonical URL, and source file. SEO support files such as
`robots.txt`, `sitemap_index.xml`, and Yoast-generated sitemaps are copied into
`dist/` alongside the existing `assets/` tree.