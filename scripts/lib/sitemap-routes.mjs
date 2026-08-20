import { taxonomyBlogRedirectDestination } from './taxonomy-blog-redirects.mjs';

export const SITE_URL = 'https://pppoker.pro';

/** @param {string} route */
export function absoluteSitemapUrl(route) {
  if (route === '/') return `${SITE_URL}/`;
  const normalized = route.startsWith('/') ? route : `/${route}`;
  const withSlash = normalized.endsWith('/') ? normalized : `${normalized}/`;
  return `${SITE_URL}${withSlash}`;
}

/**
 * @param {string | undefined | null} value
 * @param {string} fallbackIso
 */
export function formatSitemapLastmod(value, fallbackIso) {
  const raw = value?.trim() || fallbackIso;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return formatSitemapLastmod(fallbackIso, fallbackIso);
  }
  return date.toISOString().replace(/\.\d{3}Z$/, '+00:00');
}

/** @param {{ route: string; locale: string; type?: string; isRedirect?: boolean; publishedAt?: string }} page */
export function shouldIncludeInSitemap(page) {
  if (page.isRedirect) return false;
  if (page.type === 'redirect') return false;
  if (page.route.includes('/apps/web/')) return false;
  if (page.route.startsWith('/team/')) return false;
  if (page.route.includes('/category/')) return false;
  if (page.route.includes('/tag/')) return false;
  if (taxonomyBlogRedirectDestination(page.route, page.locale)) return false;
  return true;
}

/** @param {{ type?: string; publishedAt?: string }} page */
export function sitemapLastmodForPage(page, generatedAt) {
  if (page.type === 'post' && page.publishedAt) {
    return formatSitemapLastmod(page.publishedAt, generatedAt);
  }
  return formatSitemapLastmod(generatedAt, generatedAt);
}

/** @param {Array<{ lastmod: string }>} entries */
export function maxLastmod(entries, fallbackIso) {
  if (entries.length === 0) {
    return formatSitemapLastmod(fallbackIso, fallbackIso);
  }

  let max = Number.NEGATIVE_INFINITY;
  for (const entry of entries) {
    const ts = Date.parse(entry.lastmod);
    if (!Number.isNaN(ts) && ts > max) max = ts;
  }

  if (max === Number.NEGATIVE_INFINITY) {
    return formatSitemapLastmod(fallbackIso, fallbackIso);
  }

  return formatSitemapLastmod(new Date(max).toISOString(), fallbackIso);
}
