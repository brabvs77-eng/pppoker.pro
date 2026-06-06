'use client';

import dynamic from 'next/dynamic';

import type { BlogPostCard } from '@/lib/blogRotation';

const HomeBlogRotatorClient = dynamic(
  () => import('./HomeBlogRotatorClient').then((mod) => mod.HomeBlogRotatorClient),
  { ssr: false },
);

type HomeBlogRotatorMountProps = {
  posts: BlogPostCard[];
  initialOffset: number;
  visibleCount: number;
  intervalMs: number;
  blogArchiveHref: string;
  labels: {
    title: string;
    subtitle: string;
    readMore: string;
    allPosts: string;
    category: string;
  };
};

export function HomeBlogRotatorMount(props: HomeBlogRotatorMountProps) {
  return <HomeBlogRotatorClient {...props} />;
}
