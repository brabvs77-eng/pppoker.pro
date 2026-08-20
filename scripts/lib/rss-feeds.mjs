import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Locale RSS feeds — keep public paths in sync with SiteHead RSS_FEED_HREF. */
export const LOCALE_RSS_FEEDS = [
  {
    label: 'RU',
    publicPath: 'feed.xml',
    outPath: 'feed.xml',
    homepageOutPath: 'index.html',
    feedHref: '/feed.xml',
    minItems: 1,
  },
  {
    label: 'EN',
    publicPath: 'en/feed.xml',
    outPath: 'en/feed.xml',
    homepageOutPath: 'en/index.html',
    feedHref: '/en/feed.xml',
    minItems: 1,
  },
  {
    label: 'UZ',
    publicPath: 'uz/feed.xml',
    outPath: 'uz/feed.xml',
    homepageOutPath: 'uz/index.html',
    feedHref: '/uz/feed.xml',
    minItems: 1,
  },
  {
    label: 'KZ',
    publicPath: 'kz/feed.xml',
    outPath: 'kz/feed.xml',
    homepageOutPath: 'kz/index.html',
    feedHref: '/kz/feed.xml',
    minItems: 1,
  },
];

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const structuredRoutesPath = path.join(
  rootDir,
  'apps/web/src/config/structured-post-routes.json',
);

/** HY/TJ feeds — enabled once structured-post-routes.json lists post routes for the locale. */
export function optionalLocaleRssFeeds() {
  /** @type {Record<string, string[]>} */
  const routesByLocale = JSON.parse(readFileSync(structuredRoutesPath, 'utf8'));
  const optional = [];

  if ((routesByLocale.hy ?? []).length > 0) {
    optional.push({
      label: 'HY',
      publicPath: 'hy/feed.xml',
      outPath: 'hy/feed.xml',
      homepageOutPath: 'hy/index.html',
      feedHref: '/hy/feed.xml',
      minItems: 1,
    });
  }

  if ((routesByLocale.tj ?? []).length > 0) {
    optional.push({
      label: 'TJ',
      publicPath: 'tj/feed.xml',
      outPath: 'tj/feed.xml',
      homepageOutPath: 'tj/index.html',
      feedHref: '/tj/feed.xml',
      minItems: 1,
    });
  }

  return optional;
}

export function allLocaleRssFeeds() {
  return [...LOCALE_RSS_FEEDS, ...optionalLocaleRssFeeds()];
}
