import { siteBranding, siteContacts } from '@/config/site';
import type { AppLocale } from '@/i18n/routing';
import { homeHref } from '@/lib/navigation';

import { absoluteUrl } from './urls';

const ORG_DESCRIPTIONS: Record<AppLocale, string> = {
  ru: 'Онлайн покер-клуб NUTS на PPPoker: кэш, турниры, быстрые выплаты.',
  en: 'NUTS PPPoker club: cash games, tournaments, and fast payouts.',
  uz: 'NUTS PPPoker klubi: kesh o‘yinlar, turnirlar va tez to‘lovlar.',
  kz: 'NUTS PPPoker клубы: кэш ойындар, турнирлер және жылдам төлемдер.',
  hy: 'NUTS PPPoker ակումբ՝ կեշ խաղեր, մրցաշարեր և արագ վճարումներ։',
  tj: 'Клуби NUTS PPPoker: бозиҳои кэш, мусобиқаҳо ва пардохтҳои зуд.',
};

export function buildOrganizationNode(locale: AppLocale) {
  const siteUrl = absoluteUrl(homeHref(locale));

  return {
    '@type': 'Organization',
    '@id': `${siteUrl}#organization`,
    name: 'Nuts PPPoker Club',
    alternateName: ['Nuts', 'pppoker.pro'],
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(siteBranding.logoSrc),
    },
    description: ORG_DESCRIPTIONS[locale] ?? ORG_DESCRIPTIONS.ru,
    sameAs: [siteContacts.telegramChannel],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        url: siteContacts.telegramManager,
        availableLanguage: ['ru', 'en', 'uz', 'kk', 'hy'],
      },
    ],
  };
}

export function buildWebSiteNode(locale: AppLocale) {
  const siteUrl = absoluteUrl(homeHref(locale));

  return {
    '@type': 'WebSite',
    '@id': `${siteUrl}#website`,
    url: siteUrl,
    name: 'pppoker.pro',
    alternateName: 'Nuts',
    publisher: { '@id': `${siteUrl}#organization` },
    inLanguage: locale === 'ru' ? 'ru-RU' : `${locale}-${locale.toUpperCase()}`,
  };
}
