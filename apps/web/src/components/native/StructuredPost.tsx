import type { PostRecord } from '@/lib/types';

type StructuredPostProps = {
  post: PostRecord;
};

function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** Native article layout for posts extracted to content/posts/*.json */
export function StructuredPost({ post }: StructuredPostProps) {
  const formattedDate = post.publishedAt ? formatDate(post.publishedAt, post.locale) : '';

  return (
    <article className="post-article" data-route={post.route}>
      <header className="post-article__header">
        <h1>{post.title}</h1>
        {formattedDate ? (
          <time dateTime={post.publishedAt}>{formattedDate}</time>
        ) : null}
      </header>
      <div
        className="post-article__content"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  );
}
