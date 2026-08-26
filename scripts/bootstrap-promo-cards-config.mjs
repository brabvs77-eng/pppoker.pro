#!/usr/bin/env node
/**
 * Extract bonus/events/jackpot promo cards copy from legacy homepage exports.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(rootDir, 'apps/web/src/config/home-promo-cards.json');

const SOURCES = [
  { locale: 'ru', file: 'index.html' },
  { locale: 'en', file: 'en/index.html' },
  { locale: 'hy', file: 'hy/index.html' },
  { locale: 'uz', file: 'uz/index.html' },
  { locale: 'kz', file: 'kz/index.html' },
];

function bgUrl(html, elementId) {
  const match = html.match(
    new RegExp(`elementor-element-${elementId}[^}]*background-image:url\\("([^"]+)"`),
  );
  return match?.[1] ?? null;
}

function normalizeSubtitleHtml(html = '') {
  return html
    .replace(/<img[^>]*class="emoji"[^>]*>/gi, '🔥')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSteps($, cardSelector) {
  const titles = $(`${cardSelector} .elementor-element-2d5e76b .elementor-heading-title`)
    .map((_, el) => $(el).text().trim())
    .get();
  const steps = [];
  for (let i = 0; i < titles.length; i += 2) {
    steps.push({ label: titles[i] ?? '', value: titles[i + 1] ?? '' });
  }
  return steps;
}

function extractLocale(filePath) {
  const html = readFileSync(filePath, 'utf8');
  const $ = load(html, { decodeEntities: false });

  return {
    bonus: {
      headline: $('.elementor-element-1aacb59 .jltma-gradient-headline').first().text().trim(),
      subtitleHtml: normalizeSubtitleHtml(
        $('.elementor-element-959bece .elementor-heading-title').first().html(),
      ),
      steps: extractSteps($, '.elementor-element-1aacb59'),
      background: bgUrl(html, '1aacb59'),
    },
    events: {
      title: $('.elementor-element-44201aa h3.elementor-heading-title').first().text().trim(),
      subtitle: $('.elementor-element-44201aa h4.elementor-heading-title').first().text().trim(),
      background: bgUrl(html, '44201aa'),
    },
    jackpot: {
      title: $('.elementor-element-938716b h2.elementor-heading-title').first().text().trim(),
      amount: $('.elementor-element-c85d132 .jltma-gradient-headline').text().trim(),
    },
  };
}

const cardsByLocale = {};
for (const { locale, file } of SOURCES) {
  cardsByLocale[locale] = extractLocale(path.join(rootDir, file));
}

const config = {
  decorations: {
    bonusMoney: {
      src: '/assets/media/2024/07/money.webp',
      width: 160,
      height: 100,
      alt: '',
    },
    jackpotDollar: {
      src: '/assets/media/2024/07/Dollar.webp',
      width: 67,
      height: 65,
      alt: '',
    },
  },
  panelOverlay: '/assets/media/2024/07/dust-12-1-opt.webp',
  cardsByLocale,
};

writeFileSync(outPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
console.log(`Wrote ${outPath}`);
