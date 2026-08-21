import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { HY_TJ_BLOG_ARCHIVES, HY_TJ_POSTS } from './lib/hy-tj-translations.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPostHtml({ locale, route, title, description, publishedAt, image, bodyHtml }) {
  const lang = locale === 'tj' ? 'tg' : locale;
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${route}">
<meta property="article:published_time" content="${publishedAt}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${route}">
<meta property="og:image" content="${image}">
</head>
<body class="post type-post">
<div class="elementor elementor-location-single post type-post post-${locale}">
<div class="elementor-element elementor-widget elementor-widget-theme-post-content" data-widget_type="theme-post-content.default">
<div class="elementor-widget-container">
${bodyHtml}
</div>
</div>
</div>
</body></html>`;
}

function renderBlogArchiveHtml({ route, title, description, lang }) {
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${route}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${route}">
</head>
<body class="archive category">
<div class="elementor elementor-location-archive"></div>
</body></html>`;
}

async function writeSeedFile(filePath, html) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, html, 'utf8');
}

async function main() {
  let created = 0;

  for (const post of HY_TJ_POSTS) {
    for (const locale of ['hy', 'tj']) {
      const copy = post[locale];
      const route = `/${locale}/${post.slug}/`;
      const filePath = path.join(rootDir, locale, post.slug, 'index.html');
      const html = renderPostHtml({
        locale,
        route,
        title: copy.title,
        description: copy.description,
        publishedAt: post.publishedAt,
        image: post.image,
        bodyHtml: copy.bodyHtml,
      });

      await writeSeedFile(filePath, html);
      created += 1;
      console.log(`Seeded ${route}`);
    }
  }

  for (const locale of ['hy', 'tj']) {
    const meta = HY_TJ_BLOG_ARCHIVES[locale];
    const route = `/${locale}/blog/`;
    const filePath = path.join(rootDir, locale, 'blog', 'index.html');
    const html = renderBlogArchiveHtml({ route, ...meta });

    await writeSeedFile(filePath, html);
    created += 1;
    console.log(`Seeded ${route}`);
  }

  console.log(`HY/TJ seed complete (${created} files).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
