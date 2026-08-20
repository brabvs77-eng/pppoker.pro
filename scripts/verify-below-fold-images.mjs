import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { load } from 'cheerio';

import { HOMEPAGE_LEGACY_FILES } from './lib/homepage-legacy-files.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function isHeroSwiperImage($, el) {
  const swiper = $(el).closest('.elementor-main-swiper');
  if (!swiper.length) return false;
  const slide = $(el).closest('.swiper-slide');
  if (!slide.length) return true;
  return slide.index() === 0;
}

function shouldSkip($, el) {
  const img = $(el);
  const src = img.attr('src') ?? '';
  if (!src || src.startsWith('data:')) return true;
  if (img.closest('noscript').length) return true;
  if (isHeroSwiperImage($, el)) return true;
  return false;
}

async function main() {
  const violations = [];

  for (const rel of HOMEPAGE_LEGACY_FILES) {
    const filePath = path.join(rootDir, rel);
    let html;
    try {
      html = await fs.readFile(filePath, 'utf8');
    } catch {
      violations.push(`Missing homepage export: ${rel}`);
      continue;
    }

    const $ = load(html);
    let checked = 0;
    let lazy = 0;

    $('img').each((_, el) => {
      if (shouldSkip($, el)) return;
      checked += 1;
      if ($(el).attr('loading') === 'lazy') lazy += 1;
    });

    if (checked > 0 && lazy < checked) {
      violations.push(
        `${rel}: ${checked - lazy}/${checked} below-fold images missing loading="lazy" (run npm run fix:below-fold-images)`,
      );
    }
  }

  if (violations.length) {
    console.error('verify-below-fold-images failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(`verify-below-fold-images: OK (${HOMEPAGE_LEGACY_FILES.length} homepages)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
