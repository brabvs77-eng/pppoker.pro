import type { PostRecord } from '@/lib/types';

type PostArticleProps = {
  post: PostRecord;
  bodyClassName?: string;
};

export function PostArticle({ post, bodyClassName }: PostArticleProps) {
  return (
    <article
      className={['post-article', bodyClassName].filter(Boolean).join(' ')}
      data-route={post.route}
      data-locale={post.locale}
    >
      <header className="post-article__header">
        <h1>{post.title}</h1>
        {post.publishedAt ? (
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        ) : null}
      </header>
      <div
        className="post-article__content elementor"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  );
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('ru-RU').format(new Date(iso));
  } catch {
    return iso;
  }
}
