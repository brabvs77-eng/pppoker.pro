/** Popup-only legacy pages that skip Elementor frontend JS. */
export const POPUP_ONLY_LANDING_ROUTES = [
  '/spasibo/',
  '/uz/thanks/',
  '/uz/uzs/',
  '/__qs/',
  '/mastermega-content/mastermega-content-megamenu-menuitem/',
];

/** User-facing conversion/thank-you landings checked for native chrome. */
export const CONVERSION_LANDING_ROUTES = [
  { label: 'RU thanks', route: '/spasibo/', outPath: 'spasibo/index.html' },
  { label: 'UZ thanks', route: '/uz/thanks/', outPath: 'uz/thanks/index.html' },
  { label: 'UZ UZS', route: '/uz/uzs/', outPath: 'uz/uzs/index.html' },
];
