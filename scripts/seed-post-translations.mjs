import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  TARGET_LOCALES,
  blogArchivePageCount,
  blogArchiveRoute,
  loadCatalog,
  loadPostTranslations,
  paginatedBlogArchiveMeta,
  renderBlogArchiveHtml,
  renderPostHtml,
  syncStructuredPostRoutes,
} from './lib/post-translation-seed.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function writeSeedFile(filePath, html) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, html, 'utf8');
}

async function main() {
  const catalog = loadCatalog();
  let created = 0;
  const missing = [];

  for (const entry of catalog) {
    const translations = loadPostTranslations(entry.id);
    if (!translations) {
      missing.push(entry.id);
      continue;
    }

    for (const locale of TARGET_LOCALES) {
      const copy = translations[locale];
      const slug = entry.slugs[locale];
      if (!copy || !slug) {
        missing.push(`${entry.id}:${locale}`);
        continue;
      }

      const route = `/${locale}/${slug}/`;
      const filePath = path.join(rootDir, locale, slug, 'index.html');
      const html = renderPostHtml({
        locale,
        route,
        title: copy.title,
        description: copy.description,
        publishedAt: entry.publishedAt,
        image: entry.image,
        bodyHtml: copy.bodyHtml,
      });

      await writeSeedFile(filePath, html);
      created += 1;
    }
  }

  const archivePages = blogArchivePageCount(catalog.length);

  for (const locale of TARGET_LOCALES) {
    for (let page = 1; page <= archivePages; page += 1) {
      const meta = paginatedBlogArchiveMeta(locale, page, archivePages);
      const route = blogArchiveRoute(locale, page);
      const filePath =
        page === 1
          ? path.join(rootDir, locale, 'blog', 'index.html')
          : path.join(rootDir, locale, 'blog', 'page', String(page), 'index.html');
      const html = renderBlogArchiveHtml({ route, ...meta });
      await writeSeedFile(filePath, html);
      created += 1;
      console.log(`Seeded ${route}`);
    }
  }

  const { payload, structuredRoutesPath } = syncStructuredPostRoutes();
  await fs.writeFile(structuredRoutesPath, payload, 'utf8');

  if (missing.length) {
    console.warn(`post-translations seed: missing ${missing.length} locale copies`);
    missing.slice(0, 10).forEach((item) => console.warn(`  - ${item}`));
    if (missing.length > 10) {
      console.warn(`  ... and ${missing.length - 10} more`);
    }
    process.exitCode = 1;
  }

  console.log(`post-translations seed complete (${created} HTML files).`);
  console.log(`structured-post-routes.json synced.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
