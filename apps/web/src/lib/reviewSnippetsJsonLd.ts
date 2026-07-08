import reviewSnippetsConfig from '@/config/review-snippets.json';
import type { AppLocale } from '@/i18n/routing';

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

  const graph = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Nuts PPPoker Club',
    url: 'https://pppoker.pro/',
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
