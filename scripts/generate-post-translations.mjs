#!/usr/bin/env node
/**
 * Generates post translation JSON from RU structured posts using machine translation.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import { translate } from '@vitalets/google-translate-api';

import { loadCatalog } from './lib/post-translation-seed.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = path.join(rootDir, 'content/posts');
const outDir = path.join(rootDir, 'apps/web/src/config/post-translations/posts');

const LOCALE_MAP = {
  en: 'en',
  uz: 'uz',
  kz: 'kk',
  hy: 'hy',
  tj: 'tg',
};

const TITLE_SUFFIX = ' — Nuts PPPoker';
const cache = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tr(text, locale, attempt = 0) {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (!trimmed) return trimmed;
  const key = `${locale}:${trimmed}`;
  if (cache.has(key)) return cache.get(key);

  try {
    const result = await translate(trimmed, { from: 'ru', to: LOCALE_MAP[locale] });
    cache.set(key, result.text);
    await sleep(250);
    return result.text;
  } catch (error) {
    const retryable =
      attempt < 6 &&
      (error.name === 'TooManyRequestsError' ||
        error.message?.includes('Too Many Requests') ||
        error.message?.includes('InternalServerError'));
    if (retryable) {
      const delay = error.name === 'TooManyRequestsError' ? 15000 * (attempt + 1) : 1000 * (attempt + 1);
      console.warn(`  retry ${locale} in ${delay}ms (${error.name || error.message})`);
      await sleep(delay);
      return tr(text, locale, attempt + 1);
    }
    throw error;
  }
}

function stripTitleSuffix(title) {
  return title
    .replace(/\s*—\s*Nuts онлайн покер клуб pppoker россия\s*$/i, '')
    .replace(/\s*—\s*Nuts PPPoker\s*$/i, '')
    .trim();
}

function blockSelector() {
  return 'p,h1,h2,h3,h4,li,figcaption,th,td,blockquote';
}

async function translateHtml(html, locale) {
  const $ = load(`<div id="root">${html}</div>`, { decodeEntities: false });
  const blocks = [];
  $('#root')
    .find(blockSelector())
    .each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text) blocks.push({ el, text });
    });

  for (const block of blocks) {
    const translated = await tr(block.text, locale);
    const $el = $(block.el);
    if ($el.children().length) {
      $el.contents().each((_, node) => {
        if (node.type === 'text' && node.data.trim()) {
          node.data = translated;
        }
      });
    } else {
      $el.text(translated);
    }
  }

  let output = $('#root').html() ?? '';
  output = output
    .replace(/<p(?![^>]*class=)/gi, '<p class="has-white-color has-text-color"')
    .replace(/<h2(?![^>]*class=)/gi, '<h2 class="has-white-color has-text-color"')
    .replace(/<h3(?![^>]*class=)/gi, '<h3 class="has-white-color has-text-color"')
    .replace(/<li(?![^>]*class=)/gi, '<li class="has-white-color has-text-color"');
  return output;
}

async function translatePost(postId, ruRecord, existing = {}, outPath) {
  const output = { ...existing };

  for (const locale of Object.keys(LOCALE_MAP)) {
    if (output[locale]?.bodyHtml) {
      console.log(`  ${locale}: skip (exists)`);
      continue;
    }

    const baseTitle = stripTitleSuffix(ruRecord.title);
    const title = `${await tr(baseTitle, locale)}${TITLE_SUFFIX}`;
    const description = await tr(ruRecord.description, locale);
    const bodyHtml = await translateHtml(ruRecord.html, locale);

    output[locale] = { title, description, bodyHtml };
    console.log(`  ${locale}: ok`);
    writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  }

  return output;
}

async function main() {
  const only = process.argv.slice(2);
  const catalog = loadCatalog();
  mkdirSync(outDir, { recursive: true });

  for (const entry of catalog) {
    if (only.length && !only.includes(entry.id)) continue;

    const ruPath = path.join(postsDir, `${entry.id}.json`);
    if (!existsSync(ruPath)) {
      console.warn(`skip ${entry.id}: missing RU post`);
      continue;
    }

    const ruRecord = JSON.parse(readFileSync(ruPath, 'utf8'));
    const outPath = path.join(outDir, `${entry.id}.json`);
    const existing = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')) : {};

    const hasAll = Object.keys(LOCALE_MAP).every((locale) => existing[locale]?.bodyHtml);
    if (hasAll) {
      console.log(`skip ${entry.id}: complete`);
      continue;
    }

    console.log(`Translating ${entry.id}...`);
    await translatePost(entry.id, ruRecord, existing, outPath);
  }

  console.log('generate-post-translations: done');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
