import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { siteContacts } from './lib/site-contacts.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');
const chromePath = path.join(rootDir, 'apps/web/src/config/elementor-chrome.json');

const HOME_PROMO_PAGES = [
  { label: 'RU', outPath: 'index.html', hideDuplicateCtas: true },
  { label: 'EN', outPath: 'en/index.html', hideDuplicateCtas: true },
  { label: 'HY', outPath: 'hy/index.html', hideDuplicateCtas: true },
  { label: 'UZ', outPath: 'uz/index.html', hideDuplicateCtas: true },
  { label: 'KZ', outPath: 'kz/index.html', hideDuplicateCtas: true },
  { label: 'TJ', outPath: 'tj/index.html', hideDuplicateCtas: false },
];

async function main() {
  const chrome = JSON.parse(await fs.readFile(chromePath, 'utf8'));
  const ctaIds = chrome.homepageDuplicateCtaElementIds ?? [];
  const violations = [];
  let checked = 0;

  for (const { label, outPath, hideDuplicateCtas } of HOME_PROMO_PAGES) {
    const filePath = path.join(outDir, outPath);
    let html;
    try {
      html = await fs.readFile(filePath, 'utf8');
    } catch {
      violations.push(`[${label}] Missing homepage output: ${outPath}`);
      continue;
    }

    checked += 1;

    if (!html.includes('class="home-promo"')) {
      violations.push(`[${label}] Missing native HomePromo section`);
    }

    if (!html.includes('data-home-promo')) {
      violations.push(`[${label}] Missing data-home-promo on #wordpress-page-root`);
    }

    if (!html.includes(siteContacts.telegramManager)) {
      violations.push(`[${label}] Missing manager link in HomePromo`);
    }

    if (hideDuplicateCtas) {
      for (const id of ctaIds) {
        if (!html.includes(`data-id="${id}"`)) {
          violations.push(`[${label}] Expected legacy CTA ${id} in body for CSS dedupe`);
        }
      }
    }
  }

  const overrides = await fs.readFile(
    path.join(rootDir, 'apps/web/src/app/chrome-overrides.css'),
    'utf8',
  );
  for (const id of ctaIds) {
    if (!overrides.includes(`elementor-element-${id}`)) {
      violations.push(`chrome-overrides.css missing hide rule for ${id}`);
    }
  }

  if (violations.length) {
    console.error('HomePromo verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    `Verified HomePromo on ${checked} homepages (promo strip, data-home-promo, CTA dedupe rules).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
