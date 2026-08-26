import type { Metadata } from 'next';

import hreflangConfig from '@/config/hreflang.json';
import reviewSnippetsConfig from '@/config/review-snippets.json';
import type { PageEntry } from './types';
import { computeReviewAggregate } from './reviewSnippetsAggregate';

const HOME_ROUTES = new Set(hreflangConfig.homeRoutes);
const REVIEW_ROUTES = new Set(hreflangConfig.reviewRoutes);

type ReviewLocale = keyof typeof reviewSnippetsConfig.reviewsByLocale;

const HOME_OG_REVIEW_SUFFIX: Record<string, (rating: number, count: number) => string> = {
  ru: (rating, count) => ` Рейтинг ${formatRating(rating, 'ru')}/5 на основе ${count} отзывов.`,
  en: (rating, count) => ` Rated ${formatRating(rating, 'en')}/5 based on ${count} player reviews.`,
  uz: (rating, count) => ` Reyting ${formatRating(rating, 'uz')}/5 — ${count} ta sharh.`,
  kz: (rating, count) => ` Рейтинг ${formatRating(rating, 'kz')}/5 — ${count} пікір.`,
  hy: (rating, count) => ` Գնահատական ${formatRating(rating, 'hy')}/5 — ${count} կարծիք.`,
  tj: (rating, count) => ` Рейтинг ${formatRating(rating, 'tj')}/5 — ${count} шарҳ.`,
};

/**
 * Страницы, закрытые от индексации. Thank-you страницы (/spasibo/,
 * /uz/thanks/) сюда сознательно НЕ входят — они приносят трафик.
 */
const NOINDEX_ROUTES = new Set<string>([]);

function normalizeHreflangCode(code: string): string {
  return hreflangConfig.codeMap[code as keyof typeof hreflangConfig.codeMap] ?? code;
}

/** Убирает кавычки-обёртки, попавшие в meta description из WP. */
function sanitizeDescription(description: string): string {
  return description.trim().replace(/^["«»\u201C\u201D]+/, '').replace(/["«»\u201C\u201D]+$/, '').trim();
}

function formatRating(value: number, locale: string): string {
  if (locale === 'ru' || locale === 'hy' || locale === 'kz' || locale === 'tj') {
    return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function homepageOgDescription(page: PageEntry, baseDescription?: string): string | undefined {
  const reviewLocale = (page.locale in reviewSnippetsConfig.reviewsByLocale
    ? page.locale
    : 'ru') as ReviewLocale;
  const reviews = reviewSnippetsConfig.reviewsByLocale[reviewLocale];
  const aggregate = computeReviewAggregate(reviews, reviewSnippetsConfig.aggregate.bestRating);
  const suffixBuilder = HOME_OG_REVIEW_SUFFIX[reviewLocale] ?? HOME_OG_REVIEW_SUFFIX.ru;
  const suffix = suffixBuilder
    ? suffixBuilder(aggregate.ratingValue, aggregate.reviewCount)
    : '';

  if (!baseDescription) return suffix.trim() || undefined;
  return `${baseDescription}${suffix}`;
}

export function buildPageMetadata(page: PageEntry): Metadata {
  const alternates = buildAlternates(page);
  const baseDescription = page.description ? sanitizeDescription(page.description) : undefined;
  const isHomepage = HOME_ROUTES.has(page.route);
  const description = isHomepage ? homepageOgDescription(page, baseDescription) : baseDescription;
  const indexable = !NOINDEX_ROUTES.has(page.route);
  const canonicalUrl = absoluteUrl(page.canonical);

  return {
    title: page.title,
    description,
    alternates,
    openGraph: {
      title: page.title,
      description,
      url: canonicalUrl,
      siteName: 'Nuts PPPoker',
      locale: page.lang.replace('-', '_'),
      type: page.type === 'post' || page.type === 'blog' ? 'article' : 'website',
      ...(page.ogImage
        ? {
            images: [
              {
                url: absoluteUrl(page.ogImage),
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description,
      ...(page.ogImage ? { images: [absoluteUrl(page.ogImage)] } : {}),
    },
    robots: {
      index: indexable,
      follow: true,
    },
  };
}

function buildAlternates(page: PageEntry): Metadata['alternates'] {
  if (HOME_ROUTES.has(page.route)) {
    return {
      canonical: absoluteUrl(page.canonical),
      languages: { ...hreflangConfig.homeLanguages },
    };
  }

  if (REVIEW_ROUTES.has(page.route)) {
    return {
      canonical: absoluteUrl(page.canonical),
      languages: { ...hreflangConfig.reviewLanguages },
    };
  }

  if (!page.hreflang.length) {
    return { canonical: absoluteUrl(page.canonical) };
  }

  const languages: Record<string, string> = {};
  for (const entry of page.hreflang) {
    const code = normalizeHreflangCode(entry.hreflang);
    languages[code] = absoluteUrl(entry.href);
  }

  return {
    canonical: absoluteUrl(page.canonical),
    languages,
  };
}

function absoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http')) return pathOrUrl;
  return `https://pppoker.pro${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}
