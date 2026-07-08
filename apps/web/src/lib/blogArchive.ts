import type { AppLocale } from '@/i18n/routing';

import type { BlogPostCard } from './blogRotation';

export const BLOG_ARCHIVE_PAGE_SIZE = 6;

export type BlogArchiveSlice = {
  posts: BlogPostCard[];
  pageNumber: number;
  totalPages: number;
};

const NATIVE_BLOG_LOCALE_PATTERN = 'en|uz|kz';

export function isNativeBlogArchiveRoute(route: string): boolean {
  if (route === '/blog/') return true;
  if (/^\/blog\/page\/\d+\/$/.test(route)) return true;
  return new RegExp(`^\\/(${NATIVE_BLOG_LOCALE_PATTERN})\\/blog(\\/page\\/\\d+)?\\/?$`).test(
    route,
  );
}

export function blogArchivePageNumber(route: string): number {
  const match = route.match(/\/page\/(\d+)\//);
  if (!match) return 1;
  const page = Number.parseInt(match[1]!, 10);
  return Number.isNaN(page) || page < 1 ? 1 : page;
}

export function blogArchiveHref(locale: AppLocale, page: number): string {
  if (page <= 1) {
    return locale === 'ru' ? '/blog/' : `/${locale}/blog/`;
  }
  return locale === 'ru' ? `/blog/page/${page}/` : `/${locale}/blog/page/${page}/`;
}

export function paginateBlogPosts(
  posts: BlogPostCard[],
  pageNumber: number,
  pageSize = BLOG_ARCHIVE_PAGE_SIZE,
): BlogArchiveSlice {
  if (posts.length === 0) {
    return { posts: [], pageNumber: 1, totalPages: 1 };
  }

  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const normalizedPage = Math.min(Math.max(1, pageNumber), totalPages);
  const start = (normalizedPage - 1) * pageSize;

  return {
    posts: posts.slice(start, start + pageSize),
    pageNumber: normalizedPage,
    totalPages,
  };
}
