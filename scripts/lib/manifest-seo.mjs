import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  blogArchivePageCount,
  blogArchiveRoute,
  loadCatalog,
} from './post-translation-seed.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** WPML site codes → BCP 47 hreflang (matches hreflang.json codeMap). */
const HREFLANG_BY_LOCALE = {
  ru: 'ru',
  en: 'en',
  uz: 'uz',
  kz: 'kk',
  hy: 'hy',
  tj: 'tg',
};

/** Native home SEO overrides (title/description must match on-page hero). */
const HOME_META_OVERRIDES = {
  '/tj/': {
    title: 'Клуби покери PPPoker — Nuts: депозит, бонусҳо, турнирҳо',
    description:
      'Покери онлайн бо PPPoker. Клуби Nuts — пардохт, бонусҳо ва турнирҳо. Бозиро дар PC ё телефон оғоз кунед.',
  },
  '/en/': {
    title: 'PPPoker for Money — Nuts Online Poker Club',
    description:
      'Online poker for money — PPPoker. A reliable poker room with withdrawals, bonuses and tournaments. Play anytime on PC or mobile.',
  },
};

function normalizeRoute(route) {
  if (route === '/') return '/';
  const withLeading = route.startsWith('/') ? route : `/${route}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

function ruBlogArchiveRoute(pageNumber) {
  if (pageNumber <= 1) return '/blog/';
  return `/blog/page/${pageNumber}/`;
}

function buildPostHreflangByRoute() {
  const catalog = loadCatalog();
  /** @type {Map<string, Array<{ hreflang: string; href: string }>>} */
  const byRoute = new Map();

  for (const entry of catalog) {
    const ruRoute = normalizeRoute(entry.sourceRoute);
    /** @type {Array<{ hreflang: string; href: string }>} */
    const cluster = [{ hreflang: 'ru', href: ruRoute }];

    for (const locale of ['en', 'uz', 'kz', 'hy', 'tj']) {
      const slug = entry.slugs?.[locale];
      if (!slug) continue;
      cluster.push({
        hreflang: HREFLANG_BY_LOCALE[locale],
        href: normalizeRoute(`/${locale}/${slug}`),
      });
    }

    cluster.push({ hreflang: 'x-default', href: ruRoute });

    for (const alt of cluster) {
      byRoute.set(normalizeRoute(alt.href), cluster);
    }
  }

  return byRoute;
}

function buildBlogArchiveHreflangByRoute(postCount) {
  const totalPages = blogArchivePageCount(postCount);
  /** @type {Map<string, Array<{ hreflang: string; href: string }>>} */
  const byRoute = new Map();

  for (let page = 1; page <= totalPages; page += 1) {
    /** @type {Array<{ hreflang: string; href: string }>} */
    const cluster = [{ hreflang: 'ru', href: ruBlogArchiveRoute(page) }];

    for (const locale of ['en', 'uz', 'kz', 'hy', 'tj']) {
      cluster.push({
        hreflang: HREFLANG_BY_LOCALE[locale],
        href: normalizeRoute(blogArchiveRoute(locale, page)),
      });
    }

    cluster.push({ hreflang: 'x-default', href: ruBlogArchiveRoute(page) });

    for (const alt of cluster) {
      byRoute.set(normalizeRoute(alt.href), cluster);
    }
  }

  return byRoute;
}

function isBlogArchiveRoute(route) {
  const normalized = normalizeRoute(route);
  if (normalized === '/blog/') return true;
  if (/^\/blog\/page\/\d+\/$/.test(normalized)) return true;
  return /^\/(en|uz|kz|hy|tj)\/blog(\/page\/\d+)?\/?$/.test(normalized.replace(/\/$/, '') + '/');
}

/**
 * Apply SEO patches to manifest pages after extract:
 * - post translation hreflang clusters from catalog
 * - blog archive hreflang across 6 locales
 * - native home title/description overrides (TJ, EN)
 *
 * @param {Array<Record<string, unknown>>} pages
 */
export function applyManifestSeoPatches(pages) {
  const catalog = loadCatalog();
  const postHreflang = buildPostHreflangByRoute();
  const blogHreflang = buildBlogArchiveHreflangByRoute(catalog.length);

  for (const page of pages) {
    const route = normalizeRoute(String(page.route));

    const postCluster = postHreflang.get(route);
    if (postCluster) {
      page.hreflang = postCluster;
    } else if (page.type === 'blog' || isBlogArchiveRoute(route)) {
      const archiveCluster = blogHreflang.get(route);
      if (archiveCluster) {
        page.hreflang = archiveCluster;
      }
    }

    const homeOverride = HOME_META_OVERRIDES[route];
    if (homeOverride) {
      page.title = homeOverride.title;
      page.description = homeOverride.description;
    }
  }

  return pages;
}

/**
 * Load review cluster routes/slanguages from catalog (PPPoker review post).
 * Used to sync hreflang.json reviewLanguages at build time validation.
 */
export function reviewClusterFromCatalog() {
  const catalog = loadCatalog();
  const entry = catalog.find((item) => item.id === 'obzor-onlajn-platformy-pppoker-2025');
  if (!entry) return null;

  const routes = [normalizeRoute(entry.sourceRoute)];
  /** @type {Record<string, string>} */
  const languages = {
    ru: `https://pppoker.pro${normalizeRoute(entry.sourceRoute)}`,
  };

  for (const locale of ['en', 'uz', 'kz', 'hy', 'tj']) {
    const slug = entry.slugs?.[locale];
    if (!slug) continue;
    const route = normalizeRoute(`/${locale}/${slug}`);
    routes.push(route);
    languages[HREFLANG_BY_LOCALE[locale]] = `https://pppoker.pro${route}`;
  }

  languages['x-default'] = languages.ru;

  return { routes, languages };
}

/** Patch legacy HTML head meta for home routes (survives re-extract). */
export function patchHomeHtmlMeta(sourcePath) {
  const override = HOME_META_OVERRIDES[sourcePath];
  if (!override) return null;

  const fileByRoute = {
    '/tj/': path.join(rootDir, 'tj/index.html'),
    '/en/': path.join(rootDir, 'en/index.html'),
  };

  return fileByRoute[sourcePath] ?? null;
}

export function homeMetaOverridesForRoute(route) {
  return HOME_META_OVERRIDES[normalizeRoute(route)] ?? null;
}

export { HREFLANG_BY_LOCALE, normalizeRoute };
