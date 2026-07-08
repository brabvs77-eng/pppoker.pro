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

export function isBlogArchiveRoute(route) {
  if (route === '/blog/') return true;
  if (/^\/blog\/page\/\d+\/$/.test(route)) return true;
  return /^\/(en|uz|kz|hy|tj)\/blog(\/page\/\d+)?\/?$/.test(route);
}

export function bodyNeedsElementorRuntime(bodyHtml) {
  return ELEMENTOR_RUNTIME_MARKERS.some((marker) => bodyHtml.includes(marker));
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
