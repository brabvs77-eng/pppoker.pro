#!/usr/bin/env node
/**
 * One-shot: build chto-takoe-pppoker blog post from /rus/ body + images,
 * translate EN/UZ/KZ/HY/TJ in chunked batches, seed HTML, update catalog.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import { translate } from '@vitalets/google-translate-api';
import { renderPostHtml } from './lib/post-translation-seed.mjs';

const CLS = 'has-white-color has-text-color';
const HERO = '/assets/media/2026/08/chto-takoe-pppoker-hero.webp';
const IMG_CLUBS = '/assets/media/2026/08/chto-takoe-pppoker-clubs.webp';
const IMG_PAY = '/assets/media/2026/08/chto-takoe-pppoker-payments.webp';
const PUBLISHED = '2026-02-01T12:00:00+00:00';
const POST_ID = 'chto-takoe-pppoker';
const SOURCE_ROUTE = '/chto-takoe-pppoker/';
const PROGRESS = '/tmp/chto-takoe-progress.json';
const SEP = '\n<#>\n';

const SLUGS = {
  en: 'what-is-pppoker',
  uz: 'pppoker-nima',
  kz: 'pppoker-ne',
  hy: 'inch-e-pppoker',
  tj: 'pppoker-chist',
};

const LOCALE_MAP = { en: 'en', uz: 'uz', kz: 'kk', hy: 'hy', tj: 'tg' };
const TITLE_SUFFIX = ' — Nuts PPPoker';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadProgress() {
  if (!existsSync(PROGRESS)) return {};
  return JSON.parse(readFileSync(PROGRESS, 'utf8'));
}

function saveProgress(data) {
  writeFileSync(PROGRESS, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function trRaw(text, locale, attempt = 0) {
  try {
    const result = await translate(text, { from: 'ru', to: LOCALE_MAP[locale] });
    await sleep(400);
    return result.text;
  } catch (error) {
    const msg = String(error.message || error);
    const retryable =
      attempt < 10 &&
      (error.name === 'TooManyRequestsError' ||
        /Too Many Requests|InternalServerError|fetch failed|timed out/i.test(msg));
    if (retryable) {
      const delay =
        error.name === 'TooManyRequestsError' ? 20000 * (attempt + 1) : 1500 * (attempt + 1);
      console.warn(`  retry ${locale} #${attempt + 1} in ${delay}ms (${error.name || msg})`);
      await sleep(delay);
      return trRaw(text, locale, attempt + 1);
    }
    throw error;
  }
}

async function trBatch(texts, locale) {
  const out = new Array(texts.length);
  const CHUNK = 25;
  for (let i = 0; i < texts.length; i += CHUNK) {
    const slice = texts.slice(i, i + CHUNK);
    const joined = slice.join(SEP);
    console.log(`  ${locale}: blocks ${i + 1}-${i + slice.length}/${texts.length}`);
    const translated = await trRaw(joined, locale);
    const parts = translated.split(/\n?\s*<#>\s*\n?|\n?\s*<#\s*\n?/);
    if (parts.length !== slice.length) {
      // fallback: one-by-one for this chunk
      console.warn(`  ${locale}: split mismatch ${parts.length}!=${slice.length}, fallback`);
      for (let j = 0; j < slice.length; j += 1) {
        out[i + j] = await trRaw(slice[j], locale);
      }
    } else {
      for (let j = 0; j < slice.length; j += 1) out[i + j] = parts[j].trim();
    }
    await sleep(800);
  }
  return out;
}

function figure(src, alt) {
  return `<figure class="${CLS}"><img src="${src}" alt="${alt}" width="1200" height="800" loading="lazy" decoding="async" /></figure>`;
}

function buildRuBody() {
  let bodyRu = readFileSync('/tmp/rus-body.html', 'utf8');
  const $ = load(`<div id="root">${bodyRu}</div>`, { decodeEntities: false });
  const paragraphs = $('#root').children('p');
  if (paragraphs.length >= 4) {
    $(paragraphs.get(3)).after(figure(IMG_CLUBS, 'Приватный покерный стол клуба PPPoker'));
  }
  $('#root')
    .find('h2')
    .each((_, el) => {
      const t = $(el).text();
      if (/Пополнение счета|вывод средств|Pppoker/i.test(t)) {
        $(el).before(figure(IMG_PAY, 'Пополнение и вывод средств в PPPoker'));
        return false;
      }
    });
  return $('#root').html();
}

async function translateBody(html, locale) {
  const $ = load(`<div id="root">${html}</div>`, { decodeEntities: false });
  const blocks = [];
  $('#root')
    .find('p,h2,h3,h4,li,th,td,figcaption')
    .each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text) blocks.push({ el, text });
    });
  $('#root')
    .find('img[alt]')
    .each((_, el) => {
      const alt = $(el).attr('alt') || '';
      if (alt) blocks.push({ el, text: alt, attr: 'alt' });
    });

  const translated = await trBatch(
    blocks.map((b) => b.text),
    locale,
  );
  blocks.forEach((block, idx) => {
    const value = translated[idx] || block.text;
    if (block.attr) {
      $(block.el).attr(block.attr, value);
      return;
    }
    const $el = $(block.el);
    const tag = (block.el.tagName || block.el.name || '').toLowerCase();
    if (tag.startsWith('h')) {
      $el.html(`<strong>${value}</strong>`);
    } else {
      $el.html(value);
    }
  });
  return $('#root').html();
}

const ruDesc =
  'Полный обзор PPPoker — платформы приватных покерных клубов: форматы игр, рейкбек, депозиты через аффилейтов и клуб NUTS.';
const ruTitleFinal = 'Что такое PPPoker: обзор платформы приватных клубов 2026 — Nuts PPPoker';
const bodyRu = buildRuBody();
writeFileSync('/tmp/rus-body-with-images.html', bodyRu);

const progress = loadProgress();
progress.bodyRu = progress.bodyRu || true;

for (const locale of ['en', 'uz', 'kz', 'hy', 'tj']) {
  if (progress[locale]?.title && progress[locale]?.bodyHtml) {
    console.log(`skip ${locale} (cached)`);
    continue;
  }
  console.log(`Translating ${locale}...`);
  const titleCore = await trRaw('Что такое PPPoker: обзор платформы приватных клубов 2026', locale);
  const description = await trRaw(ruDesc, locale);
  const bodyHtml = await translateBody(bodyRu, locale);
  progress[locale] = {
    title: `${titleCore.replace(/\s*—\s*Nuts PPPoker\s*$/i, '').trim()}${TITLE_SUFFIX}`,
    description,
    bodyHtml,
  };
  saveProgress(progress);
  console.log(`saved ${locale}`);
  await sleep(2000);
}

// EN polish
progress.en.title = 'What Is PPPoker? Private Poker Clubs Platform Review 2026 — Nuts PPPoker';
progress.en.description =
  'Full PPPoker review: private clubs, game formats, rakeback, HUD notes, deposits via affiliates, and how the NUTS club helps players on mobile.';
saveProgress(progress);

const translations = Object.fromEntries(
  ['en', 'uz', 'kz', 'hy', 'tj'].map((locale) => [locale, progress[locale]]),
);

const outJson = path.join('apps/web/src/config/post-translations/posts', `${POST_ID}.json`);
mkdirSync(path.dirname(outJson), { recursive: true });
writeFileSync(outJson, `${JSON.stringify(translations, null, 2)}\n`, 'utf8');

const catalogPath = 'apps/web/src/config/post-translations/catalog.json';
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
if (!catalog.some((e) => e.id === POST_ID)) {
  catalog.push({
    id: POST_ID,
    sourceRoute: SOURCE_ROUTE,
    publishedAt: PUBLISHED,
    image: HERO,
    slugs: SLUGS,
  });
  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
}
console.log('catalog size', catalog.length);

mkdirSync('chto-takoe-pppoker', { recursive: true });
writeFileSync(
  'chto-takoe-pppoker/index.html',
  renderPostHtml({
    locale: 'ru',
    route: SOURCE_ROUTE,
    title: ruTitleFinal,
    description: ruDesc,
    publishedAt: PUBLISHED,
    image: HERO,
    bodyHtml: bodyRu,
  }),
  'utf8',
);

for (const locale of Object.keys(SLUGS)) {
  const copy = translations[locale];
  const route = `/${locale}/${SLUGS[locale]}/`;
  const filePath = path.join(locale, SLUGS[locale], 'index.html');
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(
    filePath,
    renderPostHtml({
      locale,
      route,
      title: copy.title,
      description: copy.description,
      publishedAt: PUBLISHED,
      image: HERO,
      bodyHtml: copy.bodyHtml,
    }),
    'utf8',
  );
  console.log('seeded', route);
}

console.log('DONE');
