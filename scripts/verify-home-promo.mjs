import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { siteContacts } from './lib/site-contacts.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');

const WHATSAPP_MARKERS = ['wa.clck.bar', 'class="hero-cta-btn hero-cta-btn--whatsapp"', "class='hero-cta-btn hero-cta-btn--whatsapp'"];

const HOME_PAGES = [
  { label: 'RU', outPath: 'index.html', checkHeroCtas: true, checkCrashVideo: true },
  { label: 'EN', outPath: 'en/index.html', checkHeroCtas: true, checkCrashVideo: true },
  { label: 'HY', outPath: 'hy/index.html', checkHeroCtas: true, checkCrashVideo: true },
  { label: 'UZ', outPath: 'uz/index.html', checkHeroCtas: true, checkCrashVideo: true },
  { label: 'KZ', outPath: 'kz/index.html', checkHeroCtas: true, checkCrashVideo: true },
  { label: 'TJ', outPath: 'tj/index.html', checkHeroCtas: false, checkCrashVideo: false },
];

async function main() {
  const violations = [];
  let checked = 0;

  for (const { label, outPath, checkHeroCtas, checkCrashVideo } of HOME_PAGES) {
    const filePath = path.join(outDir, outPath);
    let html;
    try {
      html = await fs.readFile(filePath, 'utf8');
    } catch {
      violations.push(`[${label}] Missing homepage output: ${outPath}`);
      continue;
    }

    checked += 1;

    if (html.includes('class="home-promo"')) {
      violations.push(`[${label}] Native HomePromo strip should be removed`);
    }

    for (const marker of WHATSAPP_MARKERS) {
      if (html.includes(marker)) {
        violations.push(`[${label}] WhatsApp CTA still present (${marker})`);
      }
    }

    if (checkHeroCtas) {
      if (!html.includes('hero-cta-group')) {
        violations.push(`[${label}] Missing hero CTA button group`);
      }

      if (!html.includes('hero-cta-btn--telegram') || !html.includes(siteContacts.telegramManager)) {
        violations.push(`[${label}] Missing Telegram hero CTA`);
      }
    }

    if (!html.includes('data-home-promo')) {
      violations.push(`[${label}] Missing data-home-promo on #wordpress-page-root`);
    }

    if (checkCrashVideo) {
      if (!html.includes('data-promo-crash-autoplay')) {
        violations.push(`[${label}] CRASH video missing data-promo-crash-autoplay marker`);
      }
      if (!html.includes('promo-crash-video')) {
        violations.push(`[${label}] CRASH video missing promo-crash-video class`);
      }
      if (!html.includes('promo-crash-autoplay')) {
        violations.push(`[${label}] CRASH autoplay script missing from export`);
      }
      if (/<video[^>]*data-promo-crash-autoplay[^>]*\bod-lazy-video\b/i.test(html)) {
        violations.push(`[${label}] CRASH rocket video tag still has od-lazy-video class`);
      }
      if (!html.includes('video_2025-12-06_19-00-19.mp4')) {
        violations.push(`[${label}] CRASH rocket video src missing from export`);
      }
    }
  }

  if (violations.length) {
    console.error('Homepage chrome verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    `Verified homepage chrome on ${checked} homepages (Telegram hero CTAs, no WhatsApp, CRASH video markers).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
