/**
 * Adds loading="lazy" + decoding="async" to below-fold legacy images on homepages.
 * Skips the hero swiper (LCP candidates). Parses width/height from WP export URLs.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { load } from 'cheerio';

import { HOMEPAGE_LEGACY_FILES } from '../lib/homepage-legacy-files.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WRITE = process.argv.includes('--write');

const HOMEPAGE_FILES = HOMEPAGE_LEGACY_FILES;

const DIMENSION_RE = /-(\d{2,4})x(\d{2,4})(?:-\d+)?\.(?:webp|jpe?g|png|gif)(?:\?|$)/i;

function parseDimensions(src) {
  const match = src.match(DIMENSION_RE);
  if (!match) return null;
  return { width: match[1], height: match[2] };
}

function isHeroSwiperImage($, img) {
  const swiper = $(img).closest('.elementor-main-swiper');
  if (!swiper.length) return false;
  const slide = $(img).closest('.swiper-slide');
  if (!slide.length) return true;
  return slide.index() === 0;
}

function tuneHomepage($) {
  const counts = { lazy: 0, dimensions: 0 };

  $('img').each((_, el) => {
    const img = $(el);
    if (isHeroSwiperImage($, el)) return;

    const src = img.attr('src') ?? '';
    if (!src || src.startsWith('data:')) return;

    if (!img.attr('loading')) {
      img.attr('loading', 'lazy');
      counts.lazy += 1;
    }
    if (!img.attr('decoding')) {
      img.attr('decoding', 'async');
    }

    if (!img.attr('width') || !img.attr('height')) {
      const dims = parseDimensions(src);
      if (dims) {
        img.attr('width', dims.width);
        img.attr('height', dims.height);
        counts.dimensions += 1;
      }
    }
  });

  return counts;
}

async function main() {
  let changedFiles = 0;
  const totals = { lazy: 0, dimensions: 0 };

  for (const rel of HOMEPAGE_FILES) {
    const filePath = path.join(rootDir, rel);
    let html;
    try {
      html = await fs.readFile(filePath, 'utf8');
    } catch {
      continue;
    }

    const $ = load(html, { decodeEntities: false });
    const counts = tuneHomepage($);
    if (counts.lazy === 0 && counts.dimensions === 0) continue;

    totals.lazy += counts.lazy;
    totals.dimensions += counts.dimensions;
    changedFiles += 1;

    if (WRITE) {
      await fs.writeFile(filePath, $.html(), 'utf8');
    }
    console.log(`${WRITE ? 'Updated' : 'Would update'} ${rel}: +${counts.lazy} lazy, +${counts.dimensions} dimensions`);
  }

  if (changedFiles === 0) {
    console.log('fix-below-fold-images: no changes needed');
    return;
  }

  console.log(
    `fix-below-fold-images: ${changedFiles} homepage(s), ${totals.lazy} lazy, ${totals.dimensions} dimensions${WRITE ? '' : ' (dry run — pass --write)'}`,
  );

  if (!WRITE) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
