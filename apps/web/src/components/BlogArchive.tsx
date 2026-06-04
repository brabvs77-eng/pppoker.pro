import Link from 'next/link';

import type { PageEntry } from '@/lib/types';

const POSTS_PER_PAGE = 10;

type BlogArchiveProps = {
  posts: PageEntry[];
  page: number;
  locale: string;
  title: string;
};

export function BlogArchive({ posts, page, locale, title }: BlogArchiveProps) {
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const current = Math.min(Math.max(page, 1), totalPages);
  const slice = posts.slice((current - 1) * POSTS_PER_PAGE, current * POSTS_PER_PAGE);
  const prefix = locale === 'ru' ? '' : `/${locale}`;

  return (
    <section className="blog-archive" data-locale={locale}>
      <h1>{title}</h1>
      <ul className="blog-archive__list">
        {slice.map((post) => (
          <li key={post.route}>
            <Link href={`${prefix}${post.route}`}>{post.title}</Link>
            {post.description ? <p>{post.description}</p> : null}
          </li>
        ))}
      </ul>
      <nav className="blog-archive__pagination" aria-label="Pagination">
        {current > 1 ? (
          <Link href={paginationHref(prefix, current - 1)}>← Назад</Link>
        ) : null}
        <span>
          {current} / {totalPages}
        </span>
        {current < totalPages ? (
          <Link href={paginationHref(prefix, current + 1)}>Вперёд →</Link>
        ) : null}
      </nav>
    </section>
  );
}

function paginationHref(prefix: string, page: number) {
  if (page <= 1) return `${prefix}/blog/`;
  return `${prefix}/blog/page/${page}/`;
}
