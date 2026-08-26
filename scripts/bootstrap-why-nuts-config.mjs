#!/usr/bin/env node
/**
 * One-shot: extract Why NUTS tile copy from legacy homepage HTML exports.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(rootDir, 'apps/web/src/config/home-why-nuts.json');

const SOURCES = [
  { locale: 'ru', file: 'index.html' },
  { locale: 'en', file: 'en/index.html' },
  { locale: 'hy', file: 'hy/index.html' },
  { locale: 'uz', file: 'uz/index.html' },
  { locale: 'kz', file: 'kz/index.html' },
];

const ICONS = [
  { id: 'community', src: '/assets/media/2025/03/Group-23.webp', width: 33, height: 26 },
  { id: 'games', src: '/assets/media/2025/03/Vector1.webp', width: 26, height: 26 },
  { id: 'security', src: '/assets/media/2025/03/Vector-4.webp', width: 23, height: 26 },
  { id: 'transfer', src: '/assets/media/2025/03/Vector5.webp', width: 27, height: 22 },
  { id: 'manager', src: '/assets/media/2025/03/Vector6.webp', width: 28, height: 26 },
  { id: 'jackpot', src: '/assets/media/2025/03/Vector7.webp', width: 25, height: 26 },
  { id: 'deposit', src: '/assets/media/2025/03/Vector8.webp', width: 26, height: 26 },
];

const BRAND_MASCOT = '/assets/media/elementor/thumbs/4-1-1-rg5sbdciwv92ozzcca728hnvd84bbcsju865y8idy8.webp';

function normalizeMuted(html) {
  return html
    .replace(/style="color:#7B8DB2"/g, 'class="home-why__muted"')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractLocale(filePath) {
  const html = readFileSync(filePath, 'utf8');
  const $ = load(html, { decodeEntities: false });
  const section = $('.elementor-element-6fdeb4a').first();
  if (!section.length) throw new Error(`Why NUTS section missing in ${filePath}`);

  const title = section.find('.elementor-element-706475f h2').first().text().replace(/\s+/g, ' ').trim();
  const grid = section.find('.elementor-element-ec62fe7').first();
  const tileNodes = grid.children('.e-child').toArray();

  const texts = tileNodes.slice(0, 7).map((node) => {
    const heading = $(node).find('.elementor-heading-title').first().html();
    if (!heading) throw new Error(`Missing tile heading in ${filePath}`);
    return normalizeMuted(heading);
  });

  return { title, texts };
}

const titleByLocale = {};
const textByTile = Object.fromEntries(ICONS.map((icon) => [icon.id, {}]));

for (const { locale, file } of SOURCES) {
  const { title, texts } = extractLocale(path.join(rootDir, file));
  titleByLocale[locale] = title;
  ICONS.forEach((icon, index) => {
    textByTile[icon.id][locale] = texts[index];
  });
}

const tiles = [
  ...ICONS.map((icon) => ({
    id: icon.id,
    icon: { src: icon.src, width: icon.width, height: icon.height },
    textHtmlByLocale: textByTile[icon.id],
  })),
  {
    id: 'brand',
    kind: 'brand',
    mascotSrc: BRAND_MASCOT,
  },
];

writeFileSync(outPath, `${JSON.stringify({ titleByLocale, tiles }, null, 2)}\n`, 'utf8');
console.log(`Wrote ${outPath} (${tiles.length} tiles × ${SOURCES.length} locales)`);
