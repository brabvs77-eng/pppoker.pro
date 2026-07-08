import type { AppLocale } from '@/i18n/routing';

import { localeBlogRoot } from '@/lib/taxonomyRedirects';

export function homeHref(locale: string): string {
  return locale === 'ru' ? '/' : `/${locale}/`;
}

/** Locales without a native blog archive (HY, TJ) fall back to RU `/blog/`. */
export function blogHref(locale: string): string {
  return `${localeBlogRoot(locale as AppLocale)}/`;
}

export function legalHref(
  locale: string,
  slug: 'user-agreement' | 'privacy-policy',
): string {
  if (locale === 'ru') {
    return slug === 'user-agreement' ? '/en/user-agreement/' : '/en/privacy-policy/';
  }
  return `/${locale}/${slug}/`;
}
