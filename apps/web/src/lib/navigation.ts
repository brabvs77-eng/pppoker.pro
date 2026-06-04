export function homeHref(locale: string): string {
  return locale === 'ru' ? '/' : `/${locale}/`;
}

export function blogHref(locale: string): string {
  return locale === 'ru' ? '/blog/' : `/${locale}/blog/`;
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
