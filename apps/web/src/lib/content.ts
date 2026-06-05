import { promises as fs } from 'fs';
import path from 'path';

import type { AppLocale } from '@/i18n/routing';
import type { ContentManifest, PageEntry, PostRecord } from './types';

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

export async function getBodyHtml(page: PageEntry): Promise<string> {
  const filePath = path.join(contentRoot, 'bodies', `${page.fileId}.html`);
  return fs.readFile(filePath, 'utf8');
}

export type HomeBodyParts = {
  beforeHtml: string;
  afterHtml: string;
};

/** Pre-split RU homepage body (see `scripts/split-homepage-body.mjs`). */
export async function getHomeBodyParts(page: PageEntry): Promise<HomeBodyParts | null> {
  if (page.route !== '/') return null;

  try {
    const [beforeHtml, afterHtml] = await Promise.all([
      fs.readFile(path.join(contentRoot, 'bodies', `${page.fileId}-before-blog.html`), 'utf8'),
      fs.readFile(path.join(contentRoot, 'bodies', `${page.fileId}-after-blog.html`), 'utf8'),
    ]);
    return { beforeHtml, afterHtml };
  } catch {
    return null;
  }
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
