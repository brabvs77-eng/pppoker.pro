import type { MetadataRoute } from 'next';

import { getAllPages } from '@/lib/content';

export const dynamic = 'force-static';

const SITE_URL = 'https://pppoker.pro';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getAllPages();

  return pages.map((page) => ({
    url: `${SITE_URL}${page.route === '/' ? '' : page.route.replace(/\/$/, '')}/`,
    lastModified: new Date(),
    changeFrequency: page.type === 'post' ? 'weekly' : 'monthly',
    priority: page.type === 'home' ? 1 : page.type === 'post' ? 0.8 : 0.6,
  }));
}
