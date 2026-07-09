import reviewSnippetsConfig from '@/config/review-snippets.json';
import { siteBranding, siteContacts } from '@/config/site';
import type { AppLocale } from '@/i18n/routing';
import { homeHref } from '@/lib/navigation';
import { absoluteUrl } from '@/lib/jsonLd/urls';

type ReviewSnippet = {
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
};

type ReviewLocale = keyof typeof reviewSnippetsConfig.reviewsByLocale;

export function buildReviewSnippetsJsonLd(locale: AppLocale): string {
  const reviewLocale = (locale in reviewSnippetsConfig.reviewsByLocale
    ? locale
    : 'ru') as ReviewLocale;
  const reviews = reviewSnippetsConfig.reviewsByLocale[reviewLocale];
  const { aggregate } = reviewSnippetsConfig;
  const siteUrl = absoluteUrl(homeHref(locale));

  // Distinct @id: the legacy Yoast graph already defines `#organization` on the
  // same page; sharing that id merges the entities and Google then sees the
  // aggregate rating attached to a multiply-defined node (GSC review-snippet
  // error "Отзыву назначено несколько общих оценок").
  const graph = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}#nuts-club`,
    name: 'Nuts PPPoker Club',
    alternateName: ['Nuts', 'pppoker.pro'],
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(siteBranding.logoSrc),
    },
    sameAs: [siteContacts.telegramChannel],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        url: siteContacts.telegramManager,
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(aggregate.ratingValue),
      reviewCount: String(aggregate.reviewCount),
      bestRating: String(aggregate.bestRating),
      worstRating: '1',
    },
    review: (reviews as ReviewSnippet[]).slice(0, 3).map((review) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: review.name },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(review.rating),
        bestRating: String(aggregate.bestRating),
      },
      reviewBody: review.text,
    })),
  };

  return JSON.stringify(graph);
}
