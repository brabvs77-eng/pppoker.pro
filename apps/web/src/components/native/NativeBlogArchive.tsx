import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import type { AppLocale } from '@/i18n/routing';
import { blogArchiveHref } from '@/lib/blogArchive';
import type { BlogArchiveSlice } from '@/lib/blogArchive';

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
  const { posts, pageNumber, totalPages } = archive;

  return (
    <section className="blog-archive" aria-labelledby="blog-archive-title">
      <header className="blog-archive__header">
        <h1 id="blog-archive-title">{t('title')}</h1>
        {totalPages > 1 ? (
          <p className="blog-archive__meta">
            {t('pageOf', { page: pageNumber, total: totalPages })}
          </p>
        ) : null}
      </header>

      {posts.length === 0 ? (
        <p className="blog-archive__empty">{t('empty')}</p>
      ) : (
        <ul className="blog-archive__list" role="list">
          {posts.map((post) => (
            <li key={post.route}>
              <article>
                <Link href={post.route}>
                  <h2>{post.title}</h2>
                </Link>
                {post.publishedAt ? (
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
                ) : null}
                {post.description ? <p>{post.description}</p> : null}
                <span className="blog-archive__read-more">{t('readMore')}</span>
              </article>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav className="blog-archive__pagination" aria-label={t('paginationLabel')}>
          {pageNumber > 1 ? (
            <Link href={blogArchiveHref(locale, pageNumber - 1)}>{t('previous')}</Link>
          ) : null}
          <span>
            {pageNumber} / {totalPages}
          </span>
          {pageNumber < totalPages ? (
            <Link href={blogArchiveHref(locale, pageNumber + 1)}>{t('next')}</Link>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
