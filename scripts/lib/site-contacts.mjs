/** Keep in sync with apps/web/src/config/site.ts → siteContacts */
export const siteContacts = {
  telegramManager: 'https://t.me/NUTSsup',
  telegramChannel: 'https://t.me/+Sj5sG5o0aqJkMTBi',
  telegramDepositBot: 'https://t.me/NUTS111777_bot',
};

/** Keep in sync with apps/web/src/config/site.ts → siteLegalEntity */
export const siteLegalEntity = {
  address: '354000, г. Сочи, ул. Навагинская, д. 9, БЦ «Навагинский», офис 412',
  phoneDisplay: '+7 (862) 255-44-19',
  phoneHref: 'tel:+78622554419',
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
