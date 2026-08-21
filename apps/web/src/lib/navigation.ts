import type { AppLocale } from '@/i18n/routing';

import nativePagesConfig from '@/config/native-pages.json';

import { localeBlogRoot } from '@/lib/taxonomyRedirects';

export function homeHref(locale: string): string {
  return locale === 'ru' ? '/' : `/${locale}/`;
}

/** Locales with a native blog archive route. HY/TJ use seeded stub HTML. */
export function blogHref(locale: string): string {
  return `${localeBlogRoot(locale as AppLocale)}/`;
}

export function legalHref(
  locale: string,
  slug: 'user-agreement' | 'privacy-policy',
): string {
  const byLocale = nativePagesConfig.legalByLocale as
    | Partial<Record<AppLocale, Partial<Record<'user-agreement' | 'privacy-policy', string>>>>
    | undefined;
  const localeRoutes = byLocale?.[locale as AppLocale];
  if (localeRoutes?.[slug]) return localeRoutes[slug];
  return nativePagesConfig.legalFallback[slug];
}
