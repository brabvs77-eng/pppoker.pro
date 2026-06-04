import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { load } from 'cheerio';

import { discoverWordPressPages } from '../src/lib/wordpressHtml.mjs';
import { normalizeUrls } from '../src/lib/normalizeUrls.mjs';
import { computeCssBudget } from './compute-css-budget.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(rootDir, 'content');
const bodiesDir = path.join(contentDir, 'bodies');

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

function normalizeRecord(attributes) {
  const normalized = {};
  for (const [key, value] of Object.entries(attributes)) {
    normalized[key] = typeof value === 'string' ? normalizeUrls(value) : value;
  }
  return normalized;
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
    if (html?.trim()) blocks.push(normalizeUrls(html));
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

  for (const page of pages) {
    const source = await fs.readFile(page.sourcePath, 'utf8');
    const $ = load(source, { decodeEntities: false });
    const body = $('body').first();
    const bodyHtml = normalizeUrls(body.html() ?? '');
    const stylesheets = extractStylesheets($);

    const fileId = routeToFileId(page.route);
    await fs.writeFile(path.join(contentDir, 'bodies', `${fileId}.html`), bodyHtml, 'utf8');

    manifestPages.push({
      route: page.route,
      slug: page.route === '/' ? [] : page.route.replace(/^\//, '').replace(/\/$/, '').split('/'),
      fileId,
      source: page.relativePath,
      locale: detectLocale(page.route),
      type: classifyPage(page.route, bodyHtml),
      title: normalizeUrls($('head title').first().text().replace(/\s+/g, ' ').trim()),
      description: normalizeUrls($('head meta[name="description"]').first().attr('content') ?? ''),
      canonical: normalizeUrls($('head link[rel="canonical"]').first().attr('href') ?? page.route),
      lang: $('html').attr('lang') ?? '',
      hreflang: extractHreflang($),
      stylesheets,
      headInlineStyles: extractHeadInlineStyles($),
      bodyScripts: extractBodyScripts($),
      bodyAttributes: normalizeRecord(body.attr() ?? {}),
      isRedirect: Boolean($('head meta[http-equiv="refresh" i]').length),
    });
  }

  const budget = computeCssBudget(manifestPages);

  const manifest = {
    generatedAt: new Date().toISOString(),
    pageCount: budget.pages.length,
    coreStylesheets: budget.coreStylesheets,
    allStylesheets: budget.allStylesheets,
    /** @deprecated Use coreStylesheets + per-page stylesheets */
    globalStylesheets: budget.allStylesheets,
    cssBudget: budget.stats,
    pages: budget.pages.sort((a, b) => a.route.localeCompare(b.route)),
  };

  await fs.writeFile(
    path.join(contentDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  console.log(`Extracted ${budget.pages.length} pages to content/`);
  console.log(
    `CSS budget: ${budget.stats.coreCount} core + ~${budget.stats.averagePageSpecific.toFixed(1)} page-specific stylesheets (was ${budget.stats.totalUnique} on every page)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
