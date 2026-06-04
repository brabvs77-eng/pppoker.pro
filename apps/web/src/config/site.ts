/** Homepages using native React chrome (promo strip, blog hide, deduped nav). */
export const homepageNativeRoutes = ['/', '/hy/'] as const;

export const hideBlogLoopRoutes = homepageNativeRoutes;
export const homePromoRoutes = homepageNativeRoutes;

/** Elementor widget id for the post loop grid on homepages. */
export const homepageBlogLoopElementId = '39eeae8';

/** Duplicate “manager bonus” items in Elementor nav (hidden when HomePromo is shown). */
export const duplicateManagerMenuItemClass = 'menu-item-3206';

export const siteContacts = {
  telegramManager: 'https://t.me/NUTSsup',
  telegramChannel: 'https://t.me/pppoker_pro',
  whatsapp: 'https://wa.me/message/KIXDUQ7TC2ULM1',
} as const;
