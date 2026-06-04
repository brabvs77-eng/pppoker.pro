import { getTranslations } from 'next-intl/server';

import { homeBlogRotatorConfig } from '@/config/site';
import { getBlogPostCards, getDailyRotationOffset } from '@/lib/blogPosts';
import { blogHref } from '@/lib/navigation';

import { HomeBlogRotatorClient } from './HomeBlogRotatorClient';

type HomeBlogRotatorProps = {
  locale: string;
};

export async function HomeBlogRotator({ locale }: HomeBlogRotatorProps) {
  const posts = await getBlogPostCards('ru');
  if (posts.length === 0) return null;

  const t = await getTranslations({ locale, namespace: 'homeBlog' });
  const initialOffset = getDailyRotationOffset(posts.length);

  return (
    <HomeBlogRotatorClient
      posts={posts}
      initialOffset={initialOffset}
      visibleCount={homeBlogRotatorConfig.visibleCount}
      intervalMs={homeBlogRotatorConfig.rotationIntervalMs}
      blogArchiveHref={blogHref('ru')}
      labels={{
        title: t('title'),
        subtitle: t('subtitle'),
        readMore: t('readMore'),
        allPosts: t('allPosts'),
        category: t('category'),
      }}
    />
  );
}
