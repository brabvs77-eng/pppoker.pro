/** Homepages using native React chrome (promo strip, deduped nav). */
export const homepageNativeRoutes = ['/', '/hy/'] as const;

export const homePromoRoutes = homepageNativeRoutes;

/** RU homepage: hide legacy Elementor blog loop and show native rotator instead. */
export const hideLegacyBlogSectionRoutes = ['/'] as const;

/** Elementor containers for the static blog grid on homepages. */
export const homepageLegacyBlogSectionElementId = '39311d7';
export const homepageBlogLoopElementId = '39eeae8';

/** Native rotating blog block on the RU homepage. */
export const homepageRotatingBlogRoutes = ['/'] as const;

/** DOM mount point inside #wordpress-page-root (see homepageBodySlot). */
export const nativeHomeBlogSlotId = 'native-home-blog-slot';

export const homeBlogRotatorConfig = {
  visibleCount: 6,
  rotationIntervalMs: 8_000,
} as const;

/** Duplicate “manager bonus” items in Elementor nav (hidden when HomePromo is shown). */
export const duplicateManagerMenuItemClass = 'menu-item-3206';

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
export const homepageHeroRootElementId = '23c91dc';

/**
 * Empty spacer containers (min-height 100px) for the old fixed header.
 * `8141f77` — blog/archive templates; `3f45d89` — single post & pages.
 */
export const legacyHeaderSpacerElementIds = ['8141f77', '3f45d89'] as const;

/**
 * Hero widgets that duplicate HomePromo CTAs (play button, hotspot, manager icon row).
 * Shared element IDs across RU (`elementor-3117`) and HY (`elementor-4301`) homepages.
 */
export const homepageDuplicateCtaElementIds = [
  'd014ade',
  '404896e',
  'b5a91f5',
] as const;

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
