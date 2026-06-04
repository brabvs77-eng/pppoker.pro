import type { Metadata } from 'next';

import type { PageEntry } from './types';

export function buildPageMetadata(page: PageEntry): Metadata {
  const alternates = buildAlternates(page);

  return {
    title: page.title,
    description: page.description || undefined,
    alternates,
    openGraph: {
      title: page.title,
      description: page.description || undefined,
      url: page.canonical.startsWith('http') ? page.canonical : `https://pppoker.pro${page.canonical}`,
      locale: page.lang.replace('-', '_'),
      type: page.type === 'post' || page.type === 'blog' ? 'article' : 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function buildAlternates(page: PageEntry): Metadata['alternates'] {
  if (!page.hreflang.length) {
    return { canonical: absoluteUrl(page.canonical) };
  }

  const languages: Record<string, string> = {};
  for (const entry of page.hreflang) {
    if (entry.hreflang === 'x-default') continue;
    languages[entry.hreflang] = absoluteUrl(entry.href);
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
