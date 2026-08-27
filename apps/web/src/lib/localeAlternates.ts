import { homeHref } from '@/lib/navigation';
import type { HreflangEntry, PageEntry } from './types';

/** Display order in header/footer language switcher. */
export const SITE_LOCALE_ORDER = ['uz', 'ru', 'kz', 'hy', 'en', 'tj'] as const;

export type SiteLocaleCode = (typeof SITE_LOCALE_ORDER)[number];

/** BCP 47 codes from SEO config → site route/flag codes. */
const FROM_BCP47: Record<string, SiteLocaleCode> = {
  kk: 'kz',
  tg: 'tj',
};

function toSiteLocale(code: string): SiteLocaleCode | null {
  if ((SITE_LOCALE_ORDER as readonly string[]).includes(code)) {
    return code as SiteLocaleCode;
  }
  return FROM_BCP47[code] ?? null;
}

/** Reject WPML misfires (e.g. TJ home tagged as hreflang=ru → /tj/). */
function hrefMatchesLocale(href: string, locale: SiteLocaleCode): boolean {
  let pathname: string;
  try {
    pathname = new URL(href, 'https://pppoker.pro').pathname;
  } catch {
    return false;
  }

  if (locale === 'ru') {
    return !SITE_LOCALE_ORDER.filter((code) => code !== 'ru').some(
      (code) => pathname === `/${code}` || pathname.startsWith(`/${code}/`),
    );
  }

  return pathname === `/${locale}` || pathname.startsWith(`/${locale}/`);
}

/**
 * Always expose every site locale in chrome switchers.
 * Prefer a page-level alternate when present and sane; otherwise locale home.
 * (Legacy WP extract often omits TJ / entire hreflang clusters.)
 */
export function getLocaleAlternates(page: PageEntry): HreflangEntry[] {
  const byLocale = new Map<SiteLocaleCode, string>();

  for (const entry of page.hreflang) {
    if (entry.hreflang === 'x-default') continue;
    const site = toSiteLocale(entry.hreflang);
    if (!site || byLocale.has(site)) continue;
    if (!hrefMatchesLocale(entry.href, site)) continue;
    byLocale.set(site, entry.href);
  }

  return SITE_LOCALE_ORDER.map((locale) => ({
    hreflang: locale,
    href: byLocale.get(locale) ?? homeHref(locale),
  }));
}
