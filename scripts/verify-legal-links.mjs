import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  LEGAL_SLUGS,
  LOCALES,
  legalHrefForLocale,
  loadNativePagesConfig,
} from './lib/legal-routes.mjs';
import { expectedRedirectMaps } from './lib/collect-redirects.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');
const manifestPath = path.join(rootDir, 'content/manifest.json');

const HOME_PAGES = [
  { locale: 'ru', outPath: 'index.html' },
  { locale: 'en', outPath: 'en/index.html' },
  { locale: 'hy', outPath: 'hy/index.html' },
  { locale: 'uz', outPath: 'uz/index.html' },
  { locale: 'kz', outPath: 'kz/index.html' },
  { locale: 'tj', outPath: 'tj/index.html' },
];

async function main() {
  const config = loadNativePagesConfig(rootDir);
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const violations = [];

  for (const { locale, outPath } of HOME_PAGES) {
    const filePath = path.join(outDir, outPath);
    let html;
    try {
      html = await fs.readFile(filePath, 'utf8');
    } catch {
      violations.push(`Missing homepage output: ${outPath}`);
      continue;
    }

    for (const slug of LEGAL_SLUGS) {
      const href = legalHrefForLocale(locale, slug, config);
      if (!html.includes(`href="${href}"`)) {
        violations.push(`[${locale.toUpperCase()}] Footer missing legal link ${href}`);
      }

      const staleHref = locale === 'ru' || locale === 'en' ? null : `/${locale}/${slug}/`;
      if (staleHref && staleHref !== href && html.includes(`href="${staleHref}"`)) {
        violations.push(`[${locale.toUpperCase()}] Stale legal link still present: ${staleHref}`);
      }
    }
  }

  for (const locale of LOCALES) {
    for (const slug of LEGAL_SLUGS) {
      const route = config.legalByLocale?.[locale]?.[slug];
      if (!route) continue;
      if (!config.routes.includes(route)) {
        violations.push(`legalByLocale.${locale}.${slug} route ${route} missing from native-pages.routes`);
      }
      const page = manifest.pages.find((entry) => entry.route === route);
      if (!page?.hasNativePage) {
        violations.push(`Manifest missing hasNativePage for legal route ${route}`);
      }
    }
  }

  const redirectsPath = path.join(outDir, '_redirects');
  const redirectsContent = await fs.readFile(redirectsPath, 'utf8');
  const expected = expectedRedirectMaps(manifest);

  for (const locale of ['uz', 'kz', 'hy', 'tj']) {
    for (const slug of LEGAL_SLUGS) {
      const source = `/${locale}/${slug}`;
      const destination = legalHrefForLocale(locale, slug, config).replace(/\/$/, '');
      if (expected.static.get(source) !== destination) {
        violations.push(`Missing redirect ${source} → ${destination}`);
      }
      if (!redirectsContent.includes(`${source} ${destination} 301`)) {
        violations.push(`Export _redirects missing ${source} → ${destination}`);
      }
    }
  }

  if (violations.length) {
    console.error('verify-legal-links failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log('verify-legal-links: OK (footer links, legalByLocale registry, locale legal redirects)');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
