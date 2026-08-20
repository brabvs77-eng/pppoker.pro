import { readFileSync } from 'node:fs';
import path from 'node:path';

const LEGAL_SLUGS = ['user-agreement', 'privacy-policy'];
const LOCALES = ['ru', 'en', 'uz', 'kz', 'hy', 'tj'];

export function loadNativePagesConfig(rootDir) {
  const configPath = path.join(rootDir, 'apps/web/src/config/native-pages.json');
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

export function legalHrefForLocale(locale, slug, config) {
  const localeRoute = config.legalByLocale?.[locale]?.[slug];
  if (localeRoute) return localeRoute;
  return (
    config.legalFallback?.[slug] ??
    (slug === 'user-agreement' ? '/en/user-agreement/' : '/en/privacy-policy/')
  );
}

/** 301 sources for locale-prefixed legal URLs that are not native yet. */
export function collectLegalFallbackRedirects(config) {
  const redirects = [];

  for (const locale of LOCALES) {
    for (const slug of LEGAL_SLUGS) {
      const target = legalHrefForLocale(locale, slug, config);
      const candidate = locale === 'ru' ? `/${slug}/` : `/${locale}/${slug}/`;

      if (candidate === target) continue;
      if (config.legalByLocale?.[locale]?.[slug]) continue;

      redirects.push({
        source: candidate.replace(/\/$/, ''),
        destination: target.replace(/\/$/, ''),
      });
    }
  }

  return redirects;
}

export { LEGAL_SLUGS, LOCALES };
