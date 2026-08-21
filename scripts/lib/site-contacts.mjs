/** Keep in sync with apps/web/src/config/site.ts → siteContacts */
export const siteContacts = {
  telegramManager: 'https://t.me/NUTSsup',
  telegramChannel: 'https://t.me/+Sj5sG5o0aqJkMTBi',
};

/** Keep in sync with apps/web/src/config/site.ts → siteLegalEntity */
export const siteLegalEntity = {
  address: "QQ7V+C7G, 34 Chargali St, T'bilisi, Georgia",
  phoneDisplay: '+995 599 99 59 78',
  phoneHref: 'tel:+995599995978',
};

/** Keep in sync with apps/web/src/config/site.ts → siteSocial */
export const siteSocial = {
  instagram: 'https://www.instagram.com/pppoker_union_nuts/',
  youtube: 'https://www.youtube.com/@nutsinternationalpokerlovers70',
};

/** Keep in sync with apps/web/src/config/site.ts → iplanutsHref */
export function iplanutsHref(locale) {
  return locale === 'en' || locale === 'uz' || locale === 'kz'
    ? 'https://iplanuts.com/eng/'
    : 'https://iplanuts.com/ru/';
}

export const FOOTER_PAYMENT_ICON_COUNT = 10;
