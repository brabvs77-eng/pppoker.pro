/** Homepages using native React chrome (promo strip, blog hide, deduped nav). */
export const homepageNativeRoutes = ['/', '/hy/'] as const;

export const hideBlogLoopRoutes = homepageNativeRoutes;
export const homePromoRoutes = homepageNativeRoutes;

/** Elementor widget id for the post loop grid on homepages. */
export const homepageBlogLoopElementId = '39eeae8';

/** Duplicate “manager bonus” items in Elementor nav (hidden when HomePromo is shown). */
export const duplicateManagerMenuItemClass = 'menu-item-3206';

export const siteBranding = {
  logoSrc: '/assets/media/2024/07/NUTS.webp',
  logoAlt: 'Nuts PPPoker',
} as const;

/** Elementor footer template (replaced by native SiteFooter). */
export const elementorFooterSelector = '#colophon, footer#colophon, .main_footer';

/** Global Elementor header template inside #masthead (replaced by native SiteHeader). */
export const elementorGlobalHeaderClass = 'elementor-3180';

export const siteContacts = {
  telegramManager: 'https://t.me/NUTSsup',
  telegramChannel: 'https://t.me/pppoker_pro',
  whatsapp: 'https://wa.me/message/KIXDUQ7TC2ULM1',
} as const;

const FLAG_BASE = '/assets/vendor/sitepress-multilingual-cms/res/flags';

export const localeFlags = {
  ru: `${FLAG_BASE}/ru.png`,
  en: `${FLAG_BASE}/en.png`,
  uz: `${FLAG_BASE}/uz.png`,
  kz: `${FLAG_BASE}/kz.png`,
  hy: `${FLAG_BASE}/hy.png`,
  tj: `${FLAG_BASE}/tj.png`,
} as const;
