#!/usr/bin/env node
/**
 * Extract homepage hero copy and assets from legacy exports.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(rootDir, 'apps/web/src/config/home-hero.json');

const SOURCES = [
  { locale: 'ru', file: 'index.html' },
  { locale: 'en', file: 'en/index.html' },
  { locale: 'hy', file: 'hy/index.html' },
  { locale: 'uz', file: 'uz/index.html' },
  { locale: 'kz', file: 'kz/index.html' },
];

const LOCALE_CTA = {
  ru: 'Написать в Telegram',
  en: 'Message on Telegram',
  hy: 'Գրել Telegram-ում',
  uz: 'Telegramga yozish',
  kz: 'Telegram-ға жазу',
};

function bgUrl(html, elementId) {
  const match = html.match(
    new RegExp(`elementor-element-${elementId}[^}]*background-image:url\\("([^"]+)"`),
  );
  return match?.[1] ?? null;
}

function normalizeMutedHtml(html = '') {
  return html
    .replace(/style="color:\s*#7B8DB2"/gi, 'class="home-hero__muted"')
    .replace(/style="color:\s*#131B2B"/gi, 'class="home-hero__panel-muted"')
    .replace(
      /<a href="#reg" style="color:#039BE5"/gi,
      '<a class="home-hero__link" href="#reg"',
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function textOrHtml($, selector) {
  const node = $(selector).first();
  if (!node.length) return '';
  const html = node.html()?.trim();
  if (html?.includes('<')) return normalizeMutedHtml(html);
  return node.text().replace(/\s+/g, ' ').trim();
}

function extractLocale(filePath, locale) {
  const html = readFileSync(filePath, 'utf8');
  const $ = load(html, { decodeEntities: false });
  const hero = $('[data-id="23c91dc"]');
  if (!hero.length) throw new Error(`Hero section missing in ${filePath}`);

  const logo = hero.find('.elementor-element-de24648 img').first();
  const character = hero.find('.elementor-element-a1ef4c7 img').first();

  const panelBackground = bgUrl(html, 'ccf6cf3');
  const background = bgUrl(html, '8eaac94');

  return {
    onlineBadge: textOrHtml($, '.elementor-element-3d60c1a .elementor-heading-title'),
    title: textOrHtml($, '.elementor-element-811c838 .elementor-heading-title'),
    taglineHtml: `${textOrHtml($, '.elementor-element-8b9e49e .elementor-heading-title')} ${textOrHtml($, '.elementor-element-ea7375d .elementor-heading-title')}`.trim(),
    playersHtml: textOrHtml($, '.elementor-element-4356d8d .elementor-heading-title'),
    inviteHtml: textOrHtml($, '.elementor-element-8357118 .elementor-heading-title'),
    ctaLabel: $('.hero-cta-btn--telegram').first().text().trim() || LOCALE_CTA[locale],
    playTitleHtml: textOrHtml($, '.elementor-element-432e406 .elementor-heading-title'),
    playSubtitleHtml: textOrHtml($, '.elementor-element-98835c3 .elementor-heading-title'),
    playBodyHtml: textOrHtml($, '.elementor-element-17b5334 .elementor-heading-title'),
    bonusLabel: textOrHtml($, '.elementor-element-af86301 .elementor-heading-title'),
    bonusPercent: textOrHtml($, '.elementor-element-853ad67 .elementor-heading-title'),
    bonusCapHtml: textOrHtml($, '.elementor-element-ae0f033 .elementor-heading-title'),
    bonusCta: textOrHtml($, '.elementor-element-d1ee4e4 .elementor-heading-title'),
    registerHtml: textOrHtml($, '.elementor-element-858bcbe .elementor-heading-title'),
    background,
    panelBackground,
    logo: {
      src: (logo.attr('src') ?? '/assets/media/2024/07/NUTS.webp').replace(/\.png(?=$|\?)/i, '.webp'),
      width: Number(logo.attr('width')) || 527,
      height: Number(logo.attr('height')) || 122,
      alt: logo.attr('alt') || 'nuts pppoker',
    },
    character: {
      src: character.attr('src') ?? '/assets/media/elementor/thumbs/turbo-rg5s7cldmmlgkbw98se2hgmy8skiuap9bgbkzyuq60.webp',
      alt: character.attr('alt') || 'pppoker',
    },
  };
}

const copyByLocale = {};
let sharedLogo;
let sharedBackground;
for (const { locale, file } of SOURCES) {
  const extracted = extractLocale(path.join(rootDir, file), locale);
  sharedLogo ??= extracted.logo;
  sharedBackground ??= extracted.background;
  copyByLocale[locale] = extracted;
}

const config = {
  background: sharedBackground,
  logo: sharedLogo,
  copyByLocale,
};

writeFileSync(outPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
console.log(`Wrote ${outPath}`);
