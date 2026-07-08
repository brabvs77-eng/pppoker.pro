/** Redirect legacy WordPress category/tag archives to native blog routes. */

const NATIVE_BLOG_LOCALES = new Set(['ru', 'en', 'uz', 'kz']);

export function localeBlogRoot(locale) {
  if (locale === 'ru') return '/blog';
  if (NATIVE_BLOG_LOCALES.has(locale)) return `/${locale}/blog`;
  return '/blog';
}

export function normalizeRedirectPath(route) {
  if (route === '/') return '/';
  return route.replace(/\/$/, '');
}

/**
 * @returns {string | null} destination path without trailing slash, or null if no redirect
 */
export function taxonomyBlogRedirectDestination(route, locale) {
  if (!route.includes('/category/') && !route.includes('/tag/')) {
    return null;
  }

  const source = normalizeRedirectPath(route);

  // Handled by an explicit static redirect in collect-redirects.
  if (source === '/tag/pppoker-2') {
    return null;
  }

  const ruCategoryBlogPage = source.match(/^\/category\/blog\/page\/(\d+)$/);
  if (ruCategoryBlogPage) {
    return `/blog/page/${ruCategoryBlogPage[1]}`;
  }

  const ruTagPage = source.match(/^\/tag\/[^/]+\/page\/(\d+)$/);
  if (ruTagPage) {
    return `/blog/page/${ruTagPage[1]}`;
  }

  return localeBlogRoot(locale);
}

export function collectTaxonomyBlogRedirects(manifest) {
  const redirects = [];

  for (const page of manifest.pages) {
    if (page.isRedirect) continue;

    const destination = taxonomyBlogRedirectDestination(page.route, page.locale);
    if (!destination) continue;

    const source = normalizeRedirectPath(page.route);
    if (source === destination) continue;

    redirects.push({ source, destination });
  }

  return redirects;
}
