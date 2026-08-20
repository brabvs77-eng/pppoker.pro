import type { Metadata } from 'next';

import hreflangConfig from '@/config/hreflang.json';
import type { PageEntry } from './types';

const HOME_ROUTES = new Set(hreflangConfig.homeRoutes);
const REVIEW_ROUTES = new Set(hreflangConfig.reviewRoutes);

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

export function buildPageMetadata(page: PageEntry): Metadata {
  const alternates = buildAlternates(page);
  const description = page.description ? sanitizeDescription(page.description) : undefined;
  const indexable = !NOINDEX_ROUTES.has(page.route);

  return {
    title: page.title,
    description,
    alternates,
    openGraph: {
      title: page.title,
      description,
      url: page.canonical.startsWith('http') ? page.canonical : `https://pppoker.pro${page.canonical}`,
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
