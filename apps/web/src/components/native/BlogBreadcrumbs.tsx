import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import type { AppLocale } from '@/i18n/routing';
import { blogHref, homeHref } from '@/lib/navigation';

type BlogBreadcrumbsProps = {
  locale: AppLocale;
  current: string;
  variant: 'archive' | 'post';
};

export async function BlogBreadcrumbs({ locale, current, variant }: BlogBreadcrumbsProps) {
  const t = await getTranslations({ locale, namespace: 'blog' });
  const home = homeHref(locale);
  const blog = blogHref(locale);

  return (
    <nav className="blog-breadcrumbs" aria-label={t('breadcrumbsLabel')}>
      <ol className="blog-breadcrumbs__list">
        <li className="blog-breadcrumbs__item">
          <Link href={home}>{t('breadcrumbHome')}</Link>
        </li>
        {variant === 'post' ? (
          <li className="blog-breadcrumbs__item">
            <Link href={blog}>{t('title')}</Link>
          </li>
        ) : null}
        <li className="blog-breadcrumbs__item blog-breadcrumbs__item--current" aria-current="page">
          {current}
        </li>
      </ol>
    </nav>
  );
}
