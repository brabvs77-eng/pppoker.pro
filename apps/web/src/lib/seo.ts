import type { Metadata } from 'next';

import type { PageEntry } from './types';

/** ISO-коды для hreflang: локали проекта -> корректные BCP 47 языки. */
const HREFLANG_CODE_MAP: Record<string, string> = {
  kz: 'kk',
  tj: 'tg',
};

/** Главные страницы локалей: единый hreflang-кластер со всеми шестью версиями. */
const HOME_ROUTES = new Set(['/', '/en/', '/kz/', '/uz/', '/hy/', '/tj/']);

const HOME_LANGUAGES: Record<string, string> = {
  ru: 'https://pppoker.pro/',
  en: 'https://pppoker.pro/en/',
  kk: 'https://pppoker.pro/kz/',
  uz: 'https://pppoker.pro/uz/',
  hy: 'https://pppoker.pro/hy/',
  tg: 'https://pppoker.pro/tj/',
  'x-default': 'https://pppoker.pro/',
};

/**
 * Кластер переводов обзора PPPoker. ВАЖНО: /rus/ (русский обзор) сюда
 * сознательно не включён — страница приносит трафик и по договорённости
 * не модифицируется; hreflang обязан быть взаимным, поэтому кластер
 * ограничен EN/KK/UZ до отдельного решения по /rus/.
 */
const REVIEW_LANGUAGES: Record<string, string> = {
  en: 'https://pppoker.pro/en/pppoker-review-2026/',
  kk: 'https://pppoker.pro/kz/pppoker-zheke-poker-klubtary-platformasyny-2026/',
  uz: 'https://pppoker.pro/uz/pppoker-2026/',
};

const REVIEW_ROUTES = new Set([
  '/en/pppoker-review-2026/',
  '/kz/pppoker-zheke-poker-klubtary-platformasyny-2026/',
  '/uz/pppoker-2026/',
]);

/**
 * Страницы, закрытые от индексации. Thank-you страницы (/spasibo/,
 * /uz/thanks/) сюда сознательно НЕ входят — они приносят трафик.
 */
const NOINDEX_ROUTES = new Set<string>([]);

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
      languages: { ...HOME_LANGUAGES },
    };
  }

  if (REVIEW_ROUTES.has(page.route)) {
    return {
      canonical: absoluteUrl(page.canonical),
      languages: { ...REVIEW_LANGUAGES },
    };
  }

  if (!page.hreflang.length) {
    return { canonical: absoluteUrl(page.canonical) };
  }

  const languages: Record<string, string> = {};
  for (const entry of page.hreflang) {
    const code = HREFLANG_CODE_MAP[entry.hreflang] ?? entry.hreflang;
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
