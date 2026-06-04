'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { BlogPostCard } from '@/lib/blogRotation';
import { sliceRotatedPosts } from '@/lib/blogRotation';

type HomeBlogRotatorClientProps = {
  posts: BlogPostCard[];
  initialOffset: number;
  visibleCount: number;
  intervalMs: number;
  blogArchiveHref: string;
  legacyBlogAnchorClass: string;
  labels: {
    title: string;
    subtitle: string;
    readMore: string;
    allPosts: string;
    category: string;
  };
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

export function HomeBlogRotatorClient({
  posts,
  initialOffset,
  visibleCount,
  intervalMs,
  blogArchiveHref,
  legacyBlogAnchorClass,
  labels,
}: HomeBlogRotatorClientProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(initialOffset);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const anchor = document.querySelector(
      `#wordpress-page-root .${legacyBlogAnchorClass}`,
    );
    if (anchor instanceof HTMLElement) {
      anchor.insertAdjacentElement('afterend', section);
    }
  }, [legacyBlogAnchorClass]);

  useEffect(() => {
    setOffset(initialOffset);
  }, [initialOffset]);

  useEffect(() => {
    if (posts.length <= visibleCount) return undefined;

    const timer = window.setInterval(() => {
      setOffset((current) => (current + 1) % posts.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [posts.length, visibleCount, intervalMs]);

  const visible = sliceRotatedPosts(posts, offset, visibleCount);

  if (visible.length === 0) return null;

  return (
    <section ref={sectionRef} className="home-blog" aria-labelledby="home-blog-title">
      <div className="home-blog__inner">
        <header className="home-blog__header">
          <div>
            <h2 id="home-blog-title" className="home-blog__title">
              {labels.title}
            </h2>
            <p className="home-blog__subtitle">{labels.subtitle}</p>
          </div>
          <Link className="home-blog__all" href={blogArchiveHref}>
            {labels.allPosts}
          </Link>
        </header>

        <ul className="home-blog__grid" role="list">
          {visible.map((post) => (
            <li key={post.route}>
              <article className="home-blog__card">
                <Link className="home-blog__card-link" href={post.route}>
                  {post.image ? (
                    <img
                      className="home-blog__image"
                      src={post.image}
                      alt=""
                      width={400}
                      height={250}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="home-blog__image home-blog__image--placeholder" aria-hidden />
                  )}
                  <div className="home-blog__body">
                    <time className="home-blog__date" dateTime={post.publishedAt}>
                      {formatDate(post.publishedAt, 'ru')}
                    </time>
                    <h3 className="home-blog__card-title">{post.title}</h3>
                    {post.description ? (
                      <p className="home-blog__excerpt">{post.description}</p>
                    ) : null}
                    <span className="home-blog__meta">{labels.category}</span>
                    <span className="home-blog__more">{labels.readMore}</span>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
