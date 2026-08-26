import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  LEGAL_PAGE_IDS,
  LEGAL_TARGET_LOCALES,
  loadLegalTranslations,
  renderLegalPageHtml,
} from './lib/page-translation-seed.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function writeSeedFile(filePath, html) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, html, 'utf8');
}

async function main() {
  const translations = loadLegalTranslations();
  if (!translations) {
    console.error('seed-legal-pages: missing apps/web/src/config/page-translations/legal.json');
    process.exitCode = 1;
    return;
  }

  let created = 0;

  for (const pageId of LEGAL_PAGE_IDS) {
    const page = translations[pageId];
    if (!page?.locales) {
      console.error(`seed-legal-pages: missing page entry ${pageId}`);
      process.exitCode = 1;
      return;
    }

    const slug = page.slug ?? pageId;

    for (const locale of LEGAL_TARGET_LOCALES) {
      const copy = page.locales[locale];
      if (!copy?.title || !copy?.bodyHtml) {
        console.error(`seed-legal-pages: missing ${pageId}:${locale}`);
        process.exitCode = 1;
        return;
      }

      const route = `/${locale}/${slug}/`;
      const filePath = path.join(rootDir, locale, slug, 'index.html');
      const html = renderLegalPageHtml({
        locale,
        route,
        title: copy.title,
        description: copy.description ?? '',
        publishedAt: page.publishedAt,
        ogImage: page.ogImage,
        bodyHtml: copy.bodyHtml,
      });

      await writeSeedFile(filePath, html);
      created += 1;
      console.log(`Seeded ${route}`);
    }
  }

  console.log(`seed-legal-pages: ${created} locale legal pages`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
