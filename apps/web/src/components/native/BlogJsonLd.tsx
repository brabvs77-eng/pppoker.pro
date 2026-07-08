import type { PostRecord } from '@/lib/types';

import type { AppLocale } from '@/i18n/routing';
import { buildBlogGraphJsonLd } from '@/lib/jsonLd/buildBlogGraph';

type BlogJsonLdArchiveProps = {
  variant: 'archive';
  locale: AppLocale;
  route: string;
  breadcrumbHome: string;
  breadcrumbBlog: string;
};

type BlogJsonLdPostProps = {
  variant: 'post';
  locale: AppLocale;
  post: PostRecord;
  breadcrumbHome: string;
  breadcrumbBlog: string;
};

type BlogJsonLdProps = BlogJsonLdArchiveProps | BlogJsonLdPostProps;

/** Native JSON-LD graph for blog archive and structured posts. */
export function BlogJsonLd(props: BlogJsonLdProps) {
  const json =
    props.variant === 'archive'
      ? buildBlogGraphJsonLd({
          kind: 'archive',
          locale: props.locale,
          route: props.route,
          breadcrumbHome: props.breadcrumbHome,
          breadcrumbBlog: props.breadcrumbBlog,
        })
      : buildBlogGraphJsonLd({
          kind: 'post',
          locale: props.locale,
          post: props.post,
          breadcrumbHome: props.breadcrumbHome,
          breadcrumbBlog: props.breadcrumbBlog,
        });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
