export type BlogPostCard = {
  route: string;
  title: string;
  description: string;
  publishedAt: string;
  image?: string;
};

/** Starting offset for homepage rotation (changes daily). */
export function getDailyRotationOffset(postCount: number, now = Date.now()): number {
  if (postCount <= 0) return 0;
  const dayIndex = Math.floor(now / 86_400_000);
  return dayIndex % postCount;
}

export function sliceRotatedPosts(
  posts: BlogPostCard[],
  offset: number,
  count: number,
): BlogPostCard[] {
  if (posts.length === 0 || count <= 0) return [];
  if (posts.length <= count) return posts;

  const normalizedOffset = ((offset % posts.length) + posts.length) % posts.length;
  const result: BlogPostCard[] = [];

  for (let i = 0; i < count; i += 1) {
    result.push(posts[(normalizedOffset + i) % posts.length]!);
  }

  return result;
}
