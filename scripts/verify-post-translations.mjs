import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadCatalog } from './lib/post-translation-seed.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const translationsDir = path.join(rootDir, 'apps/web/src/config/post-translations/posts');
const TARGET_LOCALES = ['en', 'uz', 'kz', 'hy', 'tj'];

function main() {
  const catalog = loadCatalog();
  const violations = [];

  for (const entry of catalog) {
    const filePath = path.join(translationsDir, `${entry.id}.json`);
    if (!existsSync(filePath)) {
      violations.push(`Missing translation file: ${entry.id}.json`);
      continue;
    }

    const translations = JSON.parse(readFileSync(filePath, 'utf8'));
    for (const locale of TARGET_LOCALES) {
      const copy = translations[locale];
      if (!copy?.title || !copy?.description || !copy?.bodyHtml) {
        violations.push(`Incomplete ${entry.id}:${locale} (need title, description, bodyHtml)`);
        continue;
      }
      if (!copy.title.endsWith(' — Nuts PPPoker')) {
        violations.push(`${entry.id}:${locale} title must end with " — Nuts PPPoker"`);
      }
      if (!copy.bodyHtml.includes('has-white-color')) {
        violations.push(`${entry.id}:${locale} bodyHtml missing has-white-color classes`);
      }
      if (!entry.slugs[locale]) {
        violations.push(`Catalog missing slug for ${entry.id}:${locale}`);
      }
    }
  }

  if (violations.length) {
    console.error('Post translations verification failed:');
    violations.slice(0, 30).forEach((line) => console.error(`  - ${line}`));
    if (violations.length > 30) {
      console.error(`  ... and ${violations.length - 30} more`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `Verified ${catalog.length} post translation files (${catalog.length * TARGET_LOCALES.length} locale copies).`,
  );
}

main();
