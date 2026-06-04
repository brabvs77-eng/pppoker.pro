import { promises as fs } from 'fs';
import path from 'path';

import type { ContentManifest, PageEntry } from './types';

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

export async function getPageBySlug(slug: string[] | undefined): Promise<PageEntry | null> {
  const pages = await getAllPages();
  const normalized = slug ?? [];

  if (normalized.length === 0) {
    return pages.find((page) => page.route === '/') ?? null;
  }

  const route = `/${normalized.join('/')}/`;
  return pages.find((page) => page.route === route) ?? null;
}

export async function getBodyHtml(page: PageEntry): Promise<string> {
  const filePath = path.join(contentRoot, 'bodies', `${page.fileId}.html`);
  return fs.readFile(filePath, 'utf8');
}

export function slugToRoute(slug: string[]): string {
  if (slug.length === 0) return '/';
  return `/${slug.join('/')}/`;
}
