import { taxonomyBlogRedirectDestination } from './taxonomy-blog-redirects.mjs';

/** Body markers that require Elementor frontend JS at runtime. */
export const ELEMENTOR_RUNTIME_MARKERS = [
  'elementor-location-popup',
  'elementor-main-swiper',
  'elementskit-accordion',
  'elementor-widget-slides',
  'elementor-widget-testimonial-carousel',
  'elementor-widget-loop-grid',
];

/** Popups are global Elementor chrome; static thank-you/landing pages do not need JS for them. */
export const ELEMENTOR_POPUP_MARKER = 'elementor-location-popup';

export const INTERACTIVE_RUNTIME_MARKERS = ELEMENTOR_RUNTIME_MARKERS.filter(
  (marker) => marker !== ELEMENTOR_POPUP_MARKER,
);

export function isBlogArchiveRoute(route) {
  if (route === '/blog/') return true;
  if (/^\/blog\/page\/\d+\/$/.test(route)) return true;
  return /^\/(en|uz|kz|hy|tj)\/blog(\/page\/\d+)?\/?$/.test(route);
}

export function bodyNeedsElementorRuntime(bodyHtml) {
  return INTERACTIVE_RUNTIME_MARKERS.some((marker) => bodyHtml.includes(marker));
}

/**
 * Whether PageShell should load Elementor frontend JS for this page.
 */
export function needsElementorRuntime({
  route,
  locale,
  bodyHtml,
  hasStructuredPost = false,
  hasNativePage = false,
}) {
  if (hasStructuredPost) return false;
  if (hasNativePage) return false;
  if (isBlogArchiveRoute(route)) return false;
  if (taxonomyBlogRedirectDestination(route, locale)) return false;

  return bodyNeedsElementorRuntime(bodyHtml);
}
