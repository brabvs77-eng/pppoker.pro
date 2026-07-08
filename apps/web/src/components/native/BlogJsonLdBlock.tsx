import { getTranslations } from 'next-intl/server';

import { BlogJsonLd } from '@/components/native/BlogJsonLd';
import type { AppLocale } from '@/i18n/routing';
import type { PostRecord } from '@/lib/types';

type BlogJsonLdBlockArchiveProps = {
  locale: AppLocale;
  route: string;
  post?: never;
};

type BlogJsonLdBlockPostProps = {
  locale: AppLocale;
  post: PostRecord;
  route?: never;
};

type BlogJsonLdBlockProps = BlogJsonLdBlockArchiveProps | BlogJsonLdBlockPostProps;

/** Loads breadcrumb labels and emits native blog JSON-LD. */
export async function BlogJsonLdBlock(props: BlogJsonLdBlockProps) {
  const t = await getTranslations({ locale: props.locale, namespace: 'blog' });
  const labels = {
    breadcrumbHome: t('breadcrumbHome'),
    breadcrumbBlog: t('title'),
  };

  if (props.post) {
    return (
      <BlogJsonLd
        variant="post"
        locale={props.locale}
        post={props.post}
        breadcrumbHome={labels.breadcrumbHome}
        breadcrumbBlog={labels.breadcrumbBlog}
      />
    );
  }

  return (
    <BlogJsonLd
      variant="archive"
      locale={props.locale}
      route={props.route}
      breadcrumbHome={labels.breadcrumbHome}
      breadcrumbBlog={labels.breadcrumbBlog}
    />
  );
}
