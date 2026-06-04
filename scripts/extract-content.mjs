import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { load } from 'cheerio';

import {
  discoverWordPressPages,
  routeFromIndexPath,
} from '../src/lib/wordpressHtml.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(rootDir, 'content');
const bodiesDir = path.join(contentDir, 'bodies');

const SITE_ORIGINS = [
  'https://pppoker.pro',
  'https://www.pppoker.pro',
  'https://hekler.info',
  'http://pppoker.pro',
  'http://hekler.info',
];

function routeToFileId(route) {
  if (route === '/') return '_root';
  return route.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '__');
}

function detectLocale(route) {
  const segment = route.split('/').filter(Boolean)[0];
  if (['en', 'uz', 'kz', 'hy', 'tj'].includes(segment)) return segment;
  return 'ru';
}

function classifyPage(route, bodyHtml) {
  if (route.startsWith('/blog')) return 'blog';
  if (route.startsWith('/category/')) return 'category';
  if (route.startsWith('/tag/')) return 'tag';
  if (route.startsWith('/team/')) return 'team';
  if (route === '/' || /^\/(en|uz|kz|hy|tj)\/?$/.test(route)) return 'home';
  if (bodyHtml.includes('e-loop-item') || bodyHtml.includes('type-post')) return 'post';
  return 'page';
}

function normalizeUrls(html) {
  let result = html;
  for (const origin of SITE_ORIGINS) {
    result = result.split(`${origin}/`).join('/');
    result = result.split(origin).join('');
  }
  return result;
}

function extractHreflang($) {
  const alternates = [];
  $('head link[rel="alternate"][hreflang]').each((_, el) => {
    const hreflang = $(el).attr('hreflang');
    const href = $(el).attr('href');
    if (hreflang && href) {
      alternates.push({
        hreflang,
        href: normalizeUrls(href),
      });
    }
  });
  return alternates;
}

function extractStylesheets($) {
  const sheets = new Set();
  $('head link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) sheets.add(normalizeUrls(href));
  });
  return [...sheets];
}

function extractHeadInlineStyles($) {
  const blocks = [];
  $('head style').each((_, el) => {
    const html = $(el).html();
    if (html?.trim()) blocks.push(html);
  });
  return blocks;
}

function extractBodyScripts($) {
  const scripts = [];
  $('body script[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src) scripts.push(normalizeUrls(src));
  });
  return [...new Set(scripts)];
}

async function main() {
  await fs.rm(contentDir, { recursive: true, force: true });
  await fs.mkdir(bodiesDir, { recursive: true });

  const pages = await discoverWordPressPages(rootDir);
  const manifestPages = [];
  const allStylesheets = new Set();

  for (const page of pages) {
    const source = await fs.readFile(page.sourcePath, 'utf8');
    const $ = load(source, { decodeEntities: false });
    const body = $('body').first();
    const rawBodyHtml = body.html() ?? '';
    const bodyHtml = normalizeUrls(rawBodyHtml);
    const bodyAttributes = body.attr() ?? {};
    const stylesheets = extractStylesheets($);
    stylesheets.forEach((href) => allStylesheets.add(href));

    const fileId = routeToFileId(page.route);
    const bodyPath = `bodies/${fileId}.html`;
    await fs.writeFile(path.join(contentDir, bodyPath), bodyHtml, 'utf8');

    const entry = {
      route: page.route,
      slug: page.route === '/' ? [] : page.route.replace(/^\//, '').replace(/\/$/, '').split('/'),
      fileId,
      source: page.relativePath,
      locale: detectLocale(page.route),
      type: classifyPage(page.route, bodyHtml),
      title: $('head title').first().text().replace(/\s+/g, ' ').trim(),
      description: $('head meta[name="description"]').first().attr('content') ?? '',
      canonical: normalizeUrls($('head link[rel="canonical"]').first().attr('href') ?? page.route),
      lang: $('html').attr('lang') ?? '',
      hreflang: extractHreflang($),
      stylesheets,
      headInlineStyles: extractHeadInlineStyles($).map(normalizeUrls),
      bodyScripts: extractBodyScripts($),
      bodyAttributes,
      isRedirect: Boolean($('head meta[http-equiv="refresh" i]').length),
    };

    manifestPages.push(entry);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    pageCount: manifestPages.length,
    globalStylesheets: [...allStylesheets].sort(),
    pages: manifestPages.sort((a, b) => a.route.localeCompare(b.route)),
  };

  await fs.writeFile(
    path.join(contentDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  console.log(`Extracted ${manifestPages.length} pages to content/`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
