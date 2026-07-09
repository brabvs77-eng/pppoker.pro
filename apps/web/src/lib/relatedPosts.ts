import type { BlogPostCard } from './blogRotation';

/**
 * Related-by-tag ranking: shared tag count desc, then recency desc.
 * Posts with zero shared tags are excluded.
 */
export function getRelatedPosts(
  current: Pick<BlogPostCard, 'route' | 'tags'>,
  allPosts: BlogPostCard[],
  count = 3,
): BlogPostCard[] {
  const currentTags = new Set(current.tags ?? []);
  if (currentTags.size === 0) return [];

  return allPosts
    .filter((post) => post.route !== current.route)
    .map((post) => ({
      post,
      shared: (post.tags ?? []).filter((tag) => currentTags.has(tag)).length,
    }))
    .filter((entry) => entry.shared > 0)
    .sort((a, b) => {
      if (b.shared !== a.shared) return b.shared - a.shared;
      return Date.parse(b.post.publishedAt) - Date.parse(a.post.publishedAt);
    })
    .slice(0, count)
    .map((entry) => entry.post);
}
