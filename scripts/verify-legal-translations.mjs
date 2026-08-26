import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  LEGAL_PAGE_IDS,
  LEGAL_TARGET_LOCALES,
  loadLegalTranslations,
} from './lib/page-translation-seed.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  const translations = loadLegalTranslations();
  const violations = [];

  if (!translations) {
    console.error('verify-legal-translations: legal.json not found');
    process.exitCode = 1;
    return;
  }

  for (const pageId of LEGAL_PAGE_IDS) {
    const page = translations[pageId];
    if (!page?.locales) {
      violations.push(`Missing page entry: ${pageId}`);
      continue;
    }

    for (const locale of LEGAL_TARGET_LOCALES) {
      const copy = page.locales[locale];
      if (!copy) {
        violations.push(`Missing locale copy: ${pageId}:${locale}`);
        continue;
      }
      if (!copy.title?.includes('Nuts PPPoker')) {
        violations.push(`${pageId}:${locale} title missing Nuts PPPoker suffix`);
      }
      if (!copy.description?.trim()) {
        violations.push(`${pageId}:${locale} missing description`);
      }
      if (!copy.bodyHtml?.includes('elementor-widget-container')) {
        violations.push(`${pageId}:${locale} bodyHtml missing widget container`);
      }
    }
  }

  if (violations.length) {
    console.error('verify-legal-translations failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    `verify-legal-translations: OK (${LEGAL_PAGE_IDS.length} pages × ${LEGAL_TARGET_LOCALES.length} locales)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
