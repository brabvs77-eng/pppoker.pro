import { promises as fs } from 'fs';
import path from 'path';

import { hideLegacyBlogSectionRoutes } from '@/config/site';
import type { AppLocale } from '@/i18n/routing';

import type { BlogPostCard } from './blogRotation';
import type { ContentManifest, PageEntry, PageRecord, PostRecord } from './types';

const contentRoot = path.join(process.cwd(), '..', '..', 'content');

let manifestCache: ContentManifest | null = null;

export async function getManifest(): Promise<ContentManifest> {
  if (manifestCache) return manifestCache;
  const raw = await fs.readFile(path.join(contentRoot, 'manifest.json'), 'utf8');
  manifestCache = JSON.parse(raw) as ContentManifest;
  return manifestCache;
}

export async function getAllPages(): Promise<PageEntry[]> {
  const manifest = await getManifest();
  return manifest.pages.filter((page) => !page.isRedirect);
}

export async function getPagesByLocale(locale: AppLocale): Promise<PageEntry[]> {
  const pages = await getAllPages();
  return pages.filter((page) => page.locale === locale);
}

export function routeFromSlugAndLocale(
  slug: string[] | undefined,
  locale: AppLocale,
): string {
  const normalized = slug ?? [];
  if (normalized.length === 0) {
    return locale === 'ru' ? '/' : `/${locale}/`;
  }
  if (locale === 'ru') {
    return `/${normalized.join('/')}/`;
  }
  return `/${locale}/${normalized.join('/')}/`;
}

export function slugParamsFromPage(page: PageEntry, locale: AppLocale): string[] | undefined {
  const segments = page.route.replace(/^\//, '').replace(/\/$/, '').split('/').filter(Boolean);

  if (locale === 'ru') {
    return segments.length ? segments : undefined;
  }

  if (segments[0] === locale) {
    const rest = segments.slice(1);
    return rest.length ? rest : undefined;
  }

  return segments.length ? segments : undefined;
}

export async function getPageBySlug(
  slug: string[] | undefined,
  locale: AppLocale,
): Promise<PageEntry | null> {
  const route = routeFromSlugAndLocale(slug, locale);
  const pages = await getPagesByLocale(locale);
  return pages.find((page) => page.route === route) ?? null;
}

export async function getPageByRoute(route: string): Promise<PageEntry | null> {
  const pages = await getAllPages();
  return pages.find((page) => page.route === route) ?? null;
}

function stripTitleSuffix(title: string): string {
  return title.replace(/\s*-\s*Nuts онлайн покер клуб pppoker россия\s*$/i, '').trim();
}

export async function getBodyHtml(page: PageEntry): Promise<string> {
  if ((hideLegacyBlogSectionRoutes as readonly string[]).includes(page.route)) {
    try {
      return await fs.readFile(
        path.join(contentRoot, 'bodies', `${page.fileId}-with-blog-slot.html`),
        'utf8',
      );
    } catch {
      // Fall through to raw body during partial dev builds.
    }
  }

  const filePath = path.join(contentRoot, 'bodies', `${page.fileId}.html`);
  return fs.readFile(filePath, 'utf8');
}

export async function getBlogArchivePosts(locale: AppLocale): Promise<BlogPostCard[]> {
  const pages = await getPagesByLocale(locale);
  return pages
    .filter((page) => page.type === 'post' && page.publishedAt)
    .sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!))
    .map((page) => ({
      route: page.route,
      title: stripTitleSuffix(page.title),
      description: page.description,
      publishedAt: page.publishedAt!,
      image: page.ogImage || undefined,
    }));
}

export async function getPostRecord(page: PageEntry): Promise<PostRecord | null> {
  if (!page.hasStructuredPost) return null;
  try {
    const raw = await fs.readFile(
      path.join(contentRoot, 'posts', `${page.fileId}.json`),
      'utf8',
    );
    return JSON.parse(raw) as PostRecord;
  } catch {
    return null;
  }
}

export async function getPageRecord(page: PageEntry): Promise<PageRecord | null> {
  if (!page.hasNativePage) return null;
  try {
    const raw = await fs.readFile(
      path.join(contentRoot, 'pages', `${page.fileId}.json`),
      'utf8',
    );
    return JSON.parse(raw) as PageRecord;
  } catch {
    return null;
  }
}

export function parseBlogPageNumber(route: string): number | null {
  const match = route.match(/\/blog\/page\/(\d+)\/$/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export async function getBlogPaginationPages(locale: AppLocale): Promise<PageEntry[]> {
  const pages = await getPagesByLocale(locale);
  return pages.filter(
    (page) => page.type === 'blog' || parseBlogPageNumber(page.route) !== null,
  );
}
