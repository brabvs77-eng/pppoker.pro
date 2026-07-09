import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { BlogBreadcrumbs } from '@/components/native/BlogBreadcrumbs';
import type { AppLocale } from '@/i18n/routing';
import { blogArchiveHref } from '@/lib/blogArchive';
import type { BlogArchiveSlice } from '@/lib/blogArchive';
import { getTagNames } from '@/lib/tagNames';

type NativeBlogArchiveProps = {
  locale: AppLocale;
  archive: BlogArchiveSlice;
};

function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export async function NativeBlogArchive({ locale, archive }: NativeBlogArchiveProps) {
  const t = await getTranslations({ locale, namespace: 'blog' });
  const tagNames = await getTagNames();
  const { posts, pageNumber, totalPages } = archive;

  return (
    <div className="blog-surface">
      <BlogBreadcrumbs locale={locale} current={t('title')} variant="archive" />
      <section className="blog-archive" aria-labelledby="blog-archive-title">
        <header className="blog-archive__header">
          <h1 id="blog-archive-title">{t('title')}</h1>
          {totalPages > 1 ? (
            <p className="blog-archive__meta">{t('pageOf', { page: pageNumber, total: totalPages })}</p>
          ) : null}
        </header>

        {posts.length === 0 ? (
          <p className="blog-archive__empty">{t('empty')}</p>
        ) : (
          <ul className="blog-archive__rows" role="list">
            {posts.map((post, index) => (
              <li key={post.route} className={index % 2 === 1 ? 'blog-archive__row--reverse' : ''}>
                <Link href={post.route} className="blog-archive__row">
                  {post.image ? (
                    <span className="blog-archive__row-image">
                      <img src={post.image} alt="" loading="lazy" />
                    </span>
                  ) : (
                    <span className="blog-archive__row-image blog-archive__row-image--placeholder" />
                  )}
                  <span className="blog-archive__row-body">
                    {post.tags && post.tags.length > 0 ? (
                      <span className="blog-archive__tags">
                        {post.tags.map((tag) => (
                          <span key={tag} className="blog-archive__tag">
                            {tagNames[tag] ?? tag}
                          </span>
                        ))}
                      </span>
                    ) : null}
                    <h2>{post.title}</h2>
                    {post.description ? <p>{post.description}</p> : null}
                    <span className="blog-archive__row-meta">
                      {post.publishedAt ? (
                        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
                      ) : null}
                      <span className="blog-archive__read-more">{t('readMore')}</span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 ? (
          <nav className="blog-archive__pagination" aria-label={t('paginationLabel')}>
            {pageNumber > 1 ? (
              <Link href={blogArchiveHref(locale, pageNumber - 1)} className="blog-archive__pagination-arrow">
                {t('previous')}
              </Link>
            ) : (
              <span className="blog-archive__pagination-arrow blog-archive__pagination-arrow--disabled">
                {t('previous')}
              </span>
            )}

            <span className="blog-archive__pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) =>
                page === pageNumber ? (
                  <span key={page} className="blog-archive__pagination-page blog-archive__pagination-page--current">
                    {page}
                  </span>
                ) : (
                  <Link key={page} href={blogArchiveHref(locale, page)} className="blog-archive__pagination-page">
                    {page}
                  </Link>
                ),
              )}
            </span>

            {pageNumber < totalPages ? (
              <Link
                href={blogArchiveHref(locale, pageNumber + 1)}
                className="blog-archive__pagination-arrow blog-archive__pagination-arrow--primary"
              >
                {t('next')}
              </Link>
            ) : (
              <span className="blog-archive__pagination-arrow blog-archive__pagination-arrow--disabled">
                {t('next')}
              </span>
            )}
          </nav>
        ) : null}
      </section>
    </div>
  );
}
