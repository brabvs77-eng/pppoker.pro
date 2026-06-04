import { promises as fs } from 'node:fs';
import path from 'node:path';

import { load } from 'cheerio';
import { glob } from 'glob';

const WORKSPACE_IGNORES = [
  '.git/**',
  '.next/**',
  'dist/**',
  'docs/**',
  'node_modules/**',
  'scripts/**',
  'src/**',
];

const PAGE_IGNORES = [
  ...WORKSPACE_IGNORES,
  'assets/**',
];

export async function discoverWordPressPages(rootDir) {
  const indexFiles = await glob('**/index.html', {
    cwd: rootDir,
    nodir: true,
    ignore: PAGE_IGNORES,
  });

  if (await fileExists(path.join(rootDir, 'index.html'))) {
    indexFiles.push('index.html');
  }

  return [...new Set(indexFiles)]
    .sort((a, b) => routeFromIndexPath(a).localeCompare(routeFromIndexPath(b)))
    .map((relativePath) => ({
      relativePath,
      route: routeFromIndexPath(relativePath),
      sourcePath: path.join(rootDir, relativePath),
    }));
}

export async function parseWordPressHtml(filePath) {
  const source = await fs.readFile(filePath, 'utf8');
  const $ = load(source, { decodeEntities: false });
  const html = $('html').first();
  const head = $('head').first();
  const body = $('body').first();
  const bodyClasses = splitClasses(body.attr('class'));

  return {
    htmlAttributes: html.attr() ?? {},
    headHtml: head.html() ?? '',
    bodyAttributes: body.attr() ?? {},
    bodyHtml: body.html() ?? '',
    bodyClasses,
    title: normalizeText($('head title').first().text()),
    description: $('head meta[name="description"]').first().attr('content') ?? '',
    canonical: $('head link[rel="canonical"]').first().attr('href') ?? '',
    lang: html.attr('lang') ?? '',
    isRedirect: Boolean($('head meta[http-equiv="refresh" i]').length),
    alternates: $('head link[rel="alternate"][hreflang]')
      .toArray()
      .map((element) => {
        const alternate = $(element);

        return {
          hreflang: alternate.attr('hreflang') ?? '',
          href: alternate.attr('href') ?? '',
        };
      })
      .filter((alternate) => alternate.hreflang && alternate.href),
    schemaGraphCount: $('head script[type="application/ld+json"]').length,
    landmarks: {
      hasHeader: $('body header').length > 0,
      hasFooter: $('body footer').length > 0,
      h1Count: $('body h1').length,
    },
  };
}

export function buildRouteMetadata(route, parsed) {
  return {
    locale: inferLocale(route, parsed.lang),
    type: classifyRoute(route, parsed),
    isLocalized: routeHasLocalePrefix(route),
  };
}

export function classifyRoute(route, parsed = {}) {
  const bodyClasses = new Set(parsed.bodyClasses ?? []);

  if (parsed.isRedirect) {
    return 'redirect';
  }

  if (route === '/') {
    return 'home';
  }

  if (route === '/__qs/') {
    return 'search';
  }

  if (/^\/(?:en|hy|kz|tj|uz)\/?$/.test(route)) {
    return 'home';
  }

  if (/\/blog\/page\/\d+\/$/.test(route)) {
    return 'blog-page';
  }

  if (/\/blog\/$/.test(route)) {
    return 'blog-index';
  }

  if (/\/category\//.test(route) || bodyClasses.has('category')) {
    return 'category';
  }

  if (/\/tag\//.test(route) || bodyClasses.has('tag')) {
    return 'tag';
  }

  if (/\/team\//.test(route) || bodyClasses.has('author')) {
    return 'author';
  }

  if (bodyClasses.has('single-post')) {
    return 'post';
  }

  if (bodyClasses.has('page')) {
    return 'page';
  }

  return 'page';
}

export function inferLocale(route, htmlLang = '') {
  const routeLocale = route.match(/^\/(en|hy|kz|tj|uz)(?:\/|$)/)?.[1];

  if (routeLocale) {
    return routeLocale;
  }

  if (htmlLang.toLowerCase().startsWith('en')) {
    return 'en';
  }

  if (htmlLang.toLowerCase().startsWith('hy')) {
    return 'hy';
  }

  if (htmlLang.toLowerCase().startsWith('kz')) {
    return 'kz';
  }

  if (htmlLang.toLowerCase().startsWith('uz')) {
    return 'uz';
  }

  return 'ru';
}

export async function copyStaticAssets(rootDir, outDir) {
  const files = await glob('**/*', {
    cwd: rootDir,
    nodir: true,
    dot: true,
    ignore: [
      ...WORKSPACE_IGNORES,
      'package-lock.json',
      'package.json',
      'README.md',
      'OPTIMIZATION_REPORT.md',
      '**/index.html',
    ],
  });

  await Promise.all(
    files.map(async (relativePath) => {
      const from = path.join(rootDir, relativePath);
      const to = path.join(outDir, relativePath);

      await fs.mkdir(path.dirname(to), { recursive: true });
      await fs.copyFile(from, to);
    }),
  );

  return files;
}

export function routeFromIndexPath(relativePath) {
  const normalized = relativePath.replaceAll(path.sep, '/');

  if (normalized === 'index.html') {
    return '/';
  }

  return `/${normalized.replace(/\/?index\.html$/, '/')}`;
}

export function outputPathForRoute(outDir, route) {
  if (route === '/') {
    return path.join(outDir, 'index.html');
  }

  return path.join(outDir, route.replace(/^\//, ''), 'index.html');
}

export async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function normalizeText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function splitClasses(value = '') {
  return value.split(/\s+/).filter(Boolean);
}

function routeHasLocalePrefix(route) {
  return /^\/(?:en|hy|kz|tj|uz)(?:\/|$)/.test(route);
}
