import elementorChrome from './elementor-chrome.json';
import footerPaymentIcons from './footer-payment-icons.json';
import nativePagesConfig from './native-pages.json';

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

/** Legal/about pages rendered via NativePage (content/pages/*.json). */
export const nativePageRoutes = nativePagesConfig.routes as readonly string[];

/** Homepages: hide legacy Elementor blog loop and show native blog slot instead. */
export const hideLegacyBlogSectionRoutes = elementorChrome.homeBlogSlotRoutes.map(
  (entry) => entry.route,
) as readonly string[];

/** Homepages whose body HTML is post-processed in split-homepage-body.mjs. */
export const preparedHomepageBodyRoutes = [
  ...elementorChrome.homeBlogSlotRoutes.map((entry) => entry.route),
  ...elementorChrome.stripLegacyFooterRoutes
    .filter(
      (entry) =>
        !elementorChrome.homeBlogSlotRoutes.some((home) => home.route === entry.route),
    )
    .map((entry) => entry.route),
] as readonly string[];

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
} as const;

export const siteSocial = {
  instagram: 'https://www.instagram.com/pppoker_union_nuts/',
  youtube: 'https://www.youtube.com/@nutsinternationalpokerlovers70',
} as const;

/** Decorative payment-method icons in native SiteFooter (legacy `.main_footer .shape_figure`). */
export const siteFooterPaymentIcons = footerPaymentIcons.icons;

/** PNG/WebP icons for footer social cards (legacy `#colophon`). */
export const siteFooterAssets = {
  telegramIcon: '/assets/media/2025/02/tg464.png',
  instagramIcon: '/assets/media/2025/02/Ehrhhr1.png',
  youtubeIcon: '/assets/media/2025/02/Elligege.png',
  partnerIcon: '/assets/media/2025/02/Ellipggege.webp',
} as const;

/** iplanuts partner link — `/eng/` for EN/UZ/KZ, `/ru/` for RU/HY/TJ (legacy export). */
export function iplanutsHref(locale: string): string {
  return locale === 'en' || locale === 'uz' || locale === 'kz'
    ? 'https://iplanuts.com/eng/'
    : 'https://iplanuts.com/ru/';
}

/** Legal entity block shown in native SiteFooter (legacy #colophon). */
export const siteLegalEntity = {
  associationName: 'International Poker Lovers Association NUTS',
  copyrightStartYear: 2017,
  address: "QQ7V+C7G, 34 Chargali St, T'bilisi, Georgia",
  phoneDisplay: '+995 599 99 59 78',
  phoneHref: 'tel:+995599995978',
} as const;

/** Yandex Metrika + Google Tag (Site Kit) — same IDs as legacy WordPress export. */
export const siteAnalytics = {
  yandexMetrikaId: 98592596,
  googleTagId: 'GT-KF6XSGPD',
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
