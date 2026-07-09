import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { siteContacts } from './lib/site-contacts.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');

const WHATSAPP_MARKERS = ['wa.clck.bar', 'hero-cta-btn--whatsapp'];

const HOME_PAGES = [
  { label: 'RU', outPath: 'index.html' },
  { label: 'EN', outPath: 'en/index.html' },
  { label: 'HY', outPath: 'hy/index.html' },
  { label: 'UZ', outPath: 'uz/index.html' },
  { label: 'KZ', outPath: 'kz/index.html' },
  { label: 'TJ', outPath: 'tj/index.html' },
];

async function main() {
  const violations = [];
  const checked = [];

  for (const { label, outPath } of HOME_PAGES) {
    const filePath = path.join(outDir, outPath);
    let html;
    try {
      html = await fs.readFile(filePath, 'utf8');
    } catch {
      violations.push(`[${label}] Missing homepage output: ${outPath}`);
      continue;
    }

    for (const [key, url] of Object.entries(siteContacts)) {
      if (!html.includes(url)) {
        violations.push(`[${label}] Missing ${key} link in homepage output: ${url}`);
      }
    }

    for (const marker of WHATSAPP_MARKERS) {
      if (html.includes(marker)) {
        violations.push(`[${label}] WhatsApp link should be removed (${marker})`);
      }
    }

    if (!violations.some((line) => line.startsWith(`[${label}]`))) {
      checked.push(label);
    }
  }

  if (violations.length) {
    console.error('Site contacts verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(`Verified Telegram contact links and no WhatsApp on ${checked.join(', ')} homepages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
