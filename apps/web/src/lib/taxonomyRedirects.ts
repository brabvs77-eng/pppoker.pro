import type { AppLocale } from '@/i18n/routing';

const NATIVE_BLOG_LOCALES = new Set<AppLocale>(['ru', 'en', 'uz', 'kz']);

/** Keep in sync with scripts/lib/taxonomy-blog-redirects.mjs */
export function localeBlogRoot(locale: AppLocale): string {
  if (locale === 'ru') return '/blog';
  if (NATIVE_BLOG_LOCALES.has(locale)) return `/${locale}/blog`;
  return '/blog';
}

function normalizeRedirectPath(route: string): string {
  if (route === '/') return '/';
  return route.replace(/\/$/, '');
}

export function taxonomyBlogRedirectDestination(
  route: string,
  locale: AppLocale,
): string | null {
  if (!route.includes('/category/') && !route.includes('/tag/')) {
    return null;
  }

  const source = normalizeRedirectPath(route);
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

export function shouldRedirectToNativeBlog(route: string, locale: AppLocale): boolean {
  return taxonomyBlogRedirectDestination(route, locale) !== null;
}
