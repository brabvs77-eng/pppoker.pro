#!/usr/bin/env node
/**
 * Native chrome must list all 6 site locales (incl. TJ) in the header switcher.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REQUIRED = ['uz', 'ru', 'kz', 'hy', 'en', 'tj'];

const samples = [
  { label: 'RU home', file: 'apps/web/out/index.html' },
  { label: 'EN home', file: 'apps/web/out/en/index.html' },
  { label: 'TJ home', file: 'apps/web/out/tj/index.html' },
  { label: 'RU blog', file: 'apps/web/out/blog/index.html' },
];

let failed = false;

for (const sample of samples) {
  const full = path.join(rootDir, sample.file);
  if (!existsSync(full)) {
    console.error(`Missing export: ${sample.file}`);
    failed = true;
    continue;
  }

  const html = readFileSync(full, 'utf8');
  const headerMatch = html.match(/<header class="nuts-header"[\s\S]*?<\/header>/);
  if (!headerMatch) {
    console.error(`${sample.label}: no nuts-header`);
    failed = true;
    continue;
  }

  const switcher = headerMatch[0].match(/<nav class="locale-switcher"[\s\S]*?<\/nav>/);
  if (!switcher) {
    console.error(`${sample.label}: no locale-switcher in header`);
    failed = true;
    continue;
  }

  const codes = [...switcher[0].matchAll(/hrefLang="([^"]+)"/g)].map((m) => m[1]);
  const missing = REQUIRED.filter((code) => !codes.includes(code));
  if (missing.length) {
    console.error(`${sample.label}: missing locales ${missing.join(', ')} (got ${codes.join(', ')})`);
    failed = true;
    continue;
  }

  const tjLink = switcher[0].match(/href="(\/tj\/?)"[^>]*hrefLang="tj"|hrefLang="tj"[^>]*href="(\/tj\/?)"/);
  if (!tjLink) {
    console.error(`${sample.label}: TJ switcher link missing href=/tj/`);
    failed = true;
    continue;
  }

  console.log(`${sample.label}: OK (${codes.join(', ')})`);
}

if (failed) {
  process.exit(1);
}

console.log('verify-locale-switcher: OK');
