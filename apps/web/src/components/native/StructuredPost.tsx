import { getTranslations } from 'next-intl/server';

import type { PostRecord } from '@/lib/types';

import { BlogBreadcrumbs } from '@/components/native/BlogBreadcrumbs';
import type { AppLocale } from '@/i18n/routing';
import type { BlogPostCard } from '@/lib/blogRotation';
import { getTagNames } from '@/lib/tagNames';

type StructuredPostProps = {
  post: PostRecord;
  relatedPosts?: BlogPostCard[];
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
export async function StructuredPost({ post, relatedPosts = [] }: StructuredPostProps) {
  const formattedDate = post.publishedAt ? formatDate(post.publishedAt, post.locale) : '';
  const locale = post.locale as AppLocale;
  const tagNames = await getTagNames();
  const t = await getTranslations({ locale, namespace: 'blog' });

  return (
    <div className="blog-surface">
      <BlogBreadcrumbs locale={locale} current={post.title} variant="post" />
      <article className="post-article" data-route={post.route}>
        <header className="post-article__header">
          {post.tags && post.tags.length > 0 ? (
            <div className="post-article__tags">
              {post.tags.map((tag) => (
                <span key={tag} className="post-article__tag">
                  {tagNames[tag] ?? tag}
                </span>
              ))}
            </div>
          ) : null}
          <h1>{post.title}</h1>
          {formattedDate ? (
            <time dateTime={post.publishedAt}>{formattedDate}</time>
          ) : null}
        </header>
        {post.image ? (
          <figure className="post-article__hero">
            <img
              className="post-article__hero-image"
              src={post.image}
              alt=""
              width={1200}
              height={675}
              loading="eager"
              decoding="async"
            />
          </figure>
        ) : null}
        <div
          className="post-article__content"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {relatedPosts.length > 0 ? (
          <aside className="post-article__related">
            <h2>{t('relatedTitle')}</h2>
            <div className="post-article__related-grid">
              {relatedPosts.map((related) => (
                <a key={related.route} href={related.route} className="post-article__related-card">
                  {related.image ? <img src={related.image} alt="" loading="lazy" /> : null}
                  <span>{related.title}</span>
                </a>
              ))}
            </div>
          </aside>
        ) : null}
      </article>
    </div>
  );
}
