# React componentization roadmap

The current migration pipeline renders the WordPress/Elementor export through
React while preserving the public HTML output. Componentization should happen
incrementally so every route keeps the same content, metadata, and URL.

## Route types

`dist/react-route-manifest.json` classifies pages into these migration buckets:

- `home`
- `page`
- `post`
- `blog-index`
- `blog-page`
- `category`
- `tag`
- `author`
- `search`
- `redirect`

Use these buckets to replace one template at a time instead of editing all
routes at once.

## Component extraction order

The build already separates each legacy body into these controlled fragments:

- `beforeHeaderHtml`
- `LegacyHeader`
- `contentHtml`
- `LegacyFooter`
- `afterFooterHtml`

`LegacyHeader` and `LegacyFooter` render through React components while
`contentHtml` and `afterFooterHtml` remain wrapper-free raw HTML to avoid DOM
changes. Replace one fragment at a time and keep `npm run verify` passing.

## Recommended replacement order

1. `SeoHead`
   - title
   - meta description
   - canonical
   - Open Graph/Twitter tags
   - hreflang alternates
   - JSON-LD schema
2. `SiteHeader`
   - logo/title
   - primary navigation
   - mobile menu
   - language switcher
   - Telegram/WhatsApp CTA links
3. `SiteFooter`
   - repeated footer columns
   - social/contact links
   - legal/navigation links
4. `ArticleLayout`
   - breadcrumbs
   - post title
   - post body
   - author/date/category/tag metadata
5. `BlogList`
   - card grid
   - category/tag pages
   - pagination
6. `LandingSections`
   - hero blocks
   - CTA buttons
   - FAQ/content sections
   - promo/action blocks

## Safety checks for each replacement

After replacing an Elementor fragment with a React component:

```bash
npm run migrate:react
npm audit --audit-level=moderate
```

Then compare the affected routes:

- route exists with the same trailing slash
- `html lang` is unchanged
- `title` is unchanged
- `meta description` is unchanged
- canonical is unchanged
- hreflang count and targets are unchanged
- JSON-LD script count is unchanged
- structural fragment inventory is unchanged unless the DOM change is intentional
- H1 count is intentional and documented
- Telegram/WhatsApp URLs are unchanged
- sitemap and robots files are present in `dist/`

Do not delete legacy Elementor/vendor assets until the manifest shows all route
types that depended on them have been replaced and visually checked.
