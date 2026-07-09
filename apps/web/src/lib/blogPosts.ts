import type { AppLocale } from '@/i18n/routing';

import { getPagesByLocale } from '@/lib/content';
import type { BlogPostCard } from '@/lib/blogRotation';

export type { BlogPostCard } from '@/lib/blogRotation';
export { getDailyRotationOffset, sliceRotatedPosts } from '@/lib/blogRotation';

export async function getBlogPostCards(locale: AppLocale): Promise<BlogPostCard[]> {
  const pages = await getPagesByLocale(locale);

  return pages
    .filter((page) => page.type === 'post' && page.publishedAt)
    .sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!))
    .map((page) => ({
      route: page.route,
      title: page.title,
      description: page.description,
      publishedAt: page.publishedAt!,
      image: page.ogImage,
      tags: page.tags ?? [],
    }));
}
