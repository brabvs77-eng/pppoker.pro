#!/usr/bin/env node
/**
 * Extract app-download copy and store badge links from legacy homepage exports.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(rootDir, 'apps/web/src/config/home-app-download.json');

const SOURCES = [
  { locale: 'ru', file: 'index.html' },
  { locale: 'en', file: 'en/index.html' },
  { locale: 'hy', file: 'hy/index.html' },
  { locale: 'uz', file: 'uz/index.html' },
  { locale: 'kz', file: 'kz/index.html' },
];

const STORE_IDS = ['google-play', 'app-store', 'pc', 'android-apk'];
const WEBP_SRC = {
  'google-play': '/assets/media/2024/07/b1.webp',
  'app-store': '/assets/media/2024/07/b2.webp',
  pc: '/assets/media/2024/08/but.webp',
  'android-apk': '/assets/media/2024/09/android-ppp.webp',
};
const STORE_DIMS = {
  'google-play': { width: 200, height: 59 },
  'app-store': { width: 200, height: 59 },
  pc: { width: 311, height: 100 },
  'android-apk': { width: 169, height: 50 },
};

function normalizeSrc(src = '') {
  return src.replace(/\.(png|jpg)(?=($|\?))/i, '.webp');
}

function extractLocale(filePath) {
  const html = readFileSync(filePath, 'utf8');
  const $ = load(html, { decodeEntities: false });
  const section = $('.elementor-element-95836b8').first();
  if (!section.length) throw new Error(`App download section missing in ${filePath}`);

  const titleHtml = section.find('.elementor-element-3581d0a .elementor-heading-title').first().html()?.trim();
  const ctaHtml = section.find('.elementor-element-9b04b66 .elementor-heading-title').first().html()?.trim();
  if (!titleHtml || !ctaHtml) throw new Error(`Missing headings in ${filePath}`);

  const stores = [];
  section.find('.elementor-element-190c128 a[href]').each((index, el) => {
    const href = $(el).attr('href')?.trim();
    const img = $(el).find('img').first();
    const id = STORE_IDS[index];
    if (!href || !id) return;
    stores.push({
      id,
      href,
      src: WEBP_SRC[id] ?? normalizeSrc(img.attr('src') ?? ''),
      width: STORE_DIMS[id]?.width ?? Number(img.attr('width') ?? 0),
      height: STORE_DIMS[id]?.height ?? Number(img.attr('height') ?? 0),
      alt: img.attr('alt') ?? '',
    });
  });

  return { titleHtml, ctaHtml, stores };
}

const copyByLocale = {};
let stores = null;

for (const { locale, file } of SOURCES) {
  const extracted = extractLocale(path.join(rootDir, file));
  copyByLocale[locale] = {
    titleHtml: extracted.titleHtml,
    ctaHtml: extracted.ctaHtml,
  };
  if (!stores) stores = extracted.stores;
}

writeFileSync(
  outPath,
  `${JSON.stringify({ logo: { src: '/assets/media/2024/07/image-10.webp', width: 56, height: 52, alt: 'PPPoker' }, stores, copyByLocale }, null, 2)}\n`,
  'utf8',
);
console.log(`Wrote ${outPath}`);
