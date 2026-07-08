import type { PostRecord } from '@/lib/types';

import type { AppLocale } from '@/i18n/routing';
import { blogHref, homeHref } from '@/lib/navigation';

import { buildBreadcrumbListJsonLd } from './breadcrumbJsonLd';
import { buildBlogPostingNode } from './blogPostingJsonLd';
import { buildOrganizationNode, buildWebSiteNode } from './organizationJsonLd';
import { absoluteUrl } from './urls';

type BlogArchiveGraphInput = {
  kind: 'archive';
  locale: AppLocale;
  route: string;
  breadcrumbHome: string;
  breadcrumbBlog: string;
};

type BlogPostGraphInput = {
  kind: 'post';
  locale: AppLocale;
  post: PostRecord;
  breadcrumbHome: string;
  breadcrumbBlog: string;
};

export type BlogGraphInput = BlogArchiveGraphInput | BlogPostGraphInput;

export function buildBlogGraphJsonLd(input: BlogGraphInput): string {
  const { locale } = input;
  const organization = buildOrganizationNode(locale);
  const website = buildWebSiteNode(locale);

  const breadcrumbItems =
    input.kind === 'archive'
      ? [
          { name: input.breadcrumbHome, path: homeHref(locale) },
          { name: input.breadcrumbBlog, path: blogHref(locale) },
        ]
      : [
          { name: input.breadcrumbHome, path: homeHref(locale) },
          { name: input.breadcrumbBlog, path: blogHref(locale) },
          {
            name: buildBlogPostingNode(input.post).headline as string,
            path: input.post.route,
          },
        ];

  const graph: Record<string, unknown>[] = [
    website,
    organization,
    buildBreadcrumbListJsonLd(breadcrumbItems),
  ];

  if (input.kind === 'post') {
    graph.push(buildBlogPostingNode(input.post));
  } else {
    graph.push({
      '@type': 'CollectionPage',
      '@id': absoluteUrl(input.route),
      url: absoluteUrl(input.route),
      name: input.breadcrumbBlog,
      isPartOf: { '@id': website['@id'] as string },
      inLanguage: website.inLanguage,
    });
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  });
}
