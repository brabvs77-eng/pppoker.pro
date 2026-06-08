import elementorChrome from './elementor-chrome.json';

/** Homepages using native React chrome (promo strip, deduped nav). */
export const homepageNativeRoutes = [
  '/',
  '/en/',
  '/hy/',
  '/uz/',
  '/kz/',
  '/tj/',
] as const;

export const homePromoRoutes = homepageNativeRoutes;

/** Homepages: hide legacy Elementor blog loop and show native blog slot instead. */
export const hideLegacyBlogSectionRoutes = elementorChrome.homeBlogSlotRoutes.map(
  (entry) => entry.route,
) as readonly string[];

/** Elementor containers for the static blog grid on homepages. */
export const homepageLegacyBlogSectionElementId = elementorChrome.legacyBlogSectionIds[0];
export const homepageBlogLoopElementId = elementorChrome.legacyBlogSectionIds[1];

/** DOM mount point inside #wordpress-page-root (see homepageBodySlot). */
export const nativeHomeBlogSlotId = 'native-home-blog-slot';

/** Duplicate “manager bonus” items in Elementor nav (hidden when HomePromo is shown). */
export const duplicateManagerMenuItemClass = elementorChrome.duplicateManagerMenuItemClass;

export const siteBranding = {
  logoSrc: '/assets/media/2024/07/NUTS.webp',
  logoAlt: 'Nuts PPPoker',
} as const;

/** Elementor footer template (replaced by native SiteFooter). */
export const elementorFooterSelector = '#colophon, footer#colophon, .main_footer';

/**
 * Masthead selectors for Elementor header/footer templates (locale-specific post ids).
 * RU: `elementor-3180` + `elementor-3120`; EN: `elementor-256` + `elementor-445`; etc.
 */
export const elementorMastheadHeaderSelector =
  '#masthead .elementor[data-elementor-post-type="elementor-hf"]';

export const elementorMastheadSecondaryNavSelector =
  '#masthead > .elementor[data-elementor-type="section"]';

/** @deprecated RU-only class names — prefer {@link elementorMastheadHeaderSelector}. */
export const elementorGlobalHeaderClass = 'elementor-3180';

/** @deprecated RU-only class names — prefer {@link elementorMastheadSecondaryNavSelector}. */
export const elementorSecondaryNavClass = 'elementor-3120';

/** Homepage hero outer container (legacy top padding for old fixed header). */
export const homepageHeroRootElementId = elementorChrome.homepageHeroRootElementId;

/**
 * Empty spacer containers (min-height 100px) for the old fixed header.
 * `8141f77` — blog/archive templates; `3f45d89` — single post & pages.
 */
export const legacyHeaderSpacerElementIds = elementorChrome.legacyHeaderSpacerElementIds;

/**
 * Hero widgets that duplicate HomePromo CTAs (play button, hotspot, manager icon row).
 * Shared element IDs across locale homepages (RU `elementor-3117`, HY `elementor-4301`, etc.).
 */
export const homepageDuplicateCtaElementIds = elementorChrome.homepageDuplicateCtaElementIds;

export const siteContacts = {
  telegramManager: 'https://t.me/NUTSsup',
  telegramChannel: 'https://t.me/+Sj5sG5o0aqJkMTBi',
  whatsapp: 'https://wa.clck.bar/995592934850',
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

export { elementorChrome };
