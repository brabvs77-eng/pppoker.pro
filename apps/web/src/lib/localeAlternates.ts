import type { HreflangEntry, PageEntry } from './types';

const LOCALE_ORDER = ['uz', 'ru', 'kz', 'hy', 'en', 'tj'] as const;

export function getLocaleAlternates(page: PageEntry): HreflangEntry[] {
  const entries = page.hreflang.filter((entry) => entry.hreflang !== 'x-default');

  return entries.sort(
    (a, b) =>
      LOCALE_ORDER.indexOf(a.hreflang as (typeof LOCALE_ORDER)[number]) -
      LOCALE_ORDER.indexOf(b.hreflang as (typeof LOCALE_ORDER)[number]),
  );
}
