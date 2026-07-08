import type { PostRecord } from '@/lib/types';

import type { AppLocale } from '@/i18n/routing';
import { homeHref } from '@/lib/navigation';

import { absoluteUrl } from './urls';

function articleHeadline(title: string): string {
  const marker = ' - Nuts';
  const index = title.indexOf(marker);
  return index > 0 ? title.slice(0, index).trim() : title.trim();
}

function localeLanguageTag(locale: AppLocale): string {
  const tags: Record<AppLocale, string> = {
    ru: 'ru-RU',
    en: 'en-US',
    uz: 'uz-UZ',
    kz: 'kk-KZ',
    hy: 'hy-AM',
    tj: 'tg-TJ',
  };
  return tags[locale] ?? 'ru-RU';
}

export function buildBlogPostingNode(post: PostRecord) {
  const locale = post.locale as AppLocale;
  const pageUrl = absoluteUrl(post.route);
  const siteUrl = absoluteUrl(homeHref(locale));
  const headline = articleHeadline(post.title);

  return {
    '@type': 'BlogPosting',
    '@id': `${pageUrl}#blogposting`,
    headline,
    name: headline,
    description: post.description,
    url: pageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    image: post.image ? [absoluteUrl(post.image)] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'Nuts PPPoker Club',
      url: siteUrl,
    },
    publisher: {
      '@id': `${siteUrl}#organization`,
    },
    articleSection: 'Blog',
    inLanguage: localeLanguageTag(locale),
    isPartOf: {
      '@id': `${siteUrl}#website`,
    },
  };
}
