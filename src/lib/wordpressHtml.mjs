import { promises as fs } from 'node:fs';
import path from 'node:path';

import { load } from 'cheerio';
import { glob } from 'glob';

const WORKSPACE_IGNORES = [
  '.git/**',
  '.next/**',
  'dist/**',
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

  return {
    htmlAttributes: html.attr() ?? {},
    headHtml: head.html() ?? '',
    bodyAttributes: body.attr() ?? {},
    bodyHtml: body.html() ?? '',
    title: normalizeText($('head title').first().text()),
    description: $('head meta[name="description"]').first().attr('content') ?? '',
    canonical: $('head link[rel="canonical"]').first().attr('href') ?? '',
    lang: html.attr('lang') ?? '',
    isRedirect: Boolean($('head meta[http-equiv="refresh" i]').length),
  };
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
