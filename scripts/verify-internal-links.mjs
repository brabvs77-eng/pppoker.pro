import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(rootDir, 'content/manifest.json');
const bodiesDir = path.join(rootDir, 'content/bodies');

const SKIP_PREFIXES = ['/assets/', '/includes/', '#', 'mailto:', 'tel:', 'javascript:'];
const LOCALE_SEGMENTS = new Set(['en', 'uz', 'kz', 'hy', 'tj']);

/** Legacy footer links that resolve via redirect or locale-prefixed pages. */
const LEGACY_ROUTE_ALIASES = new Map([
  ['/user-agreement/', '/en/user-agreement/'],
  ['/privacy-policy/', '/en/privacy-policy/'],
  ['/tag/pppoker-2/', '/tag/pppoker/'],
]);

const LOCALE_TAG_POKER_ALIASES = {
  uz: '/uz/tag/pppoker/',
  kz: '/kz/tag/pppoker-kz/',
  en: '/en/tag/pppoker-en/',
};

function routeFromHref(href) {
  if (!href.startsWith('/')) return null;
  const withoutHash = href.split('#')[0];
  if (
    !withoutHash ||
    withoutHash.includes('?') ||
    SKIP_PREFIXES.some((prefix) => withoutHash.startsWith(prefix))
  ) {
    return null;
  }

  if (withoutHash.endsWith('/')) return withoutHash;
  const ext = path.extname(withoutHash);
  if (ext && ext !== '.html') return null;
  return `${withoutHash}/`;
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const knownRoutes = new Set(
    manifest.pages.filter((page) => !page.isRedirect).map((page) => page.route),
  );

  const fileIdToPage = new Map(
    manifest.pages.filter((page) => !page.isRedirect).map((page) => [page.fileId, page]),
  );

  const bodyFiles = await glob('*.html', { cwd: bodiesDir });
  const broken = [];

  function isSameLocaleLink(route, locale) {
    const first = route.split('/').filter(Boolean)[0];
    if (locale === 'ru') {
      return !LOCALE_SEGMENTS.has(first);
    }
    return first === locale;
  }

  function routeExists(route, locale) {
    if (knownRoutes.has(route)) return true;
    if (LEGACY_ROUTE_ALIASES.has(route) && knownRoutes.has(LEGACY_ROUTE_ALIASES.get(route))) {
      return true;
    }
    if (route === '/tag/pppoker-2/' && LOCALE_TAG_POKER_ALIASES[locale]) {
      return knownRoutes.has(LOCALE_TAG_POKER_ALIASES[locale]);
    }
    if (locale !== 'ru') {
      const prefixed = `/${locale}${route}`;
      if (knownRoutes.has(prefixed)) return true;
    }
    return false;
  }

  for (const file of bodyFiles) {
    const page = fileIdToPage.get(file.replace(/\.html$/, ''));
    const locale = page?.locale ?? 'ru';
    const html = await fs.readFile(path.join(bodiesDir, file), 'utf8');
    const hrefs = [...html.matchAll(/\shref="([^"]+)"/g)].map((match) => match[1]);

    for (const href of hrefs) {
      const route = routeFromHref(href);
      if (!route || !isSameLocaleLink(route, locale) || routeExists(route, locale)) continue;
      broken.push({ file, href, route });
    }
  }

  if (broken.length) {
    console.error(`Found ${broken.length} broken internal links in content/bodies:`);
    broken.slice(0, 30).forEach(({ file, href }) => console.error(`  ${file}: ${href}`));
    process.exitCode = 1;
    return;
  }

  console.log(`Verified internal links across ${bodyFiles.length} body files`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
