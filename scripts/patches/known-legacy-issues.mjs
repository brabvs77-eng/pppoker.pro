/**
 * Catalog of known defects in the WordPress/Simply Static HTML export at repo root.
 * Consumed by scripts/patches/fix-legacy-html.mjs and audit-rudiments.mjs.
 */

/** @type {readonly string[]} */
export const LEGACY_GLOBS = [
  '**/index.html',
  'page-sitemap.xml',
  'apps/web/public/page-sitemap.xml',
];

/** @type {readonly string[]} */
export const LEGACY_IGNORE = [
  '**/node_modules/**',
  '**/apps/web/.next/**',
  '**/apps/web/out/**',
  '**/content/**',
  '**/.git/**',
];

/**
 * Safe string replacements applied on every build (idempotent).
 * @type {readonly { id: string; description: string; search: string; replace: string }[]}
 */
export const AUTO_FIXES = [
  {
    id: 'kz-flag-path',
    description: 'Broken KZ flag path in WPML footer / custom lang switcher',
    search: '/assets/media/flags/kz.png',
    replace: '/assets/vendor/sitepress-multilingual-cms/res/flags/kz.png',
  },
  {
    id: 'but-back-webp-full',
    description: 'Button back image PNG → WebP (full size)',
    search: '/assets/media/2024/07/but-back.png',
    replace: '/assets/media/2024/07/but-back.webp',
  },
  {
    id: 'but-back-webp-thumb',
    description: 'Button back image PNG srcset thumb → WebP',
    search: '/assets/media/2024/07/but-back-300x96.png',
    replace: '/assets/media/2024/07/but-back-300x96.webp',
  },
  {
    id: 'testimonial-photo-webp',
    description: 'Roman Shaposhnikov testimonial photo JPG → WebP',
    search: '/assets/media/2024/07/maxresdefault.jpg',
    replace: '/assets/media/2024/07/maxresdefault.webp',
  },
  {
    id: 'rus-poker-video-mp4',
    description: 'Missing 1212-2-1.mp4 → existing Russian Poker clip in repo',
    search: '/assets/media/2025/12/1212-2-1.mp4',
    replace: '/assets/media/2025/12/video_2025-12-06_19-00-19-v2.mp4',
  },
  {
    id: 'hy-turbo-thumb-webp',
    description: 'Elementor thumb PNG → WebP sibling (HY homepage turbo block)',
    search: '/assets/media/elementor/thumbs/turbo-rfpvvde70baxs2bn03t8cay7kcycahc678ci7akrg8.png',
    replace: '/assets/media/elementor/thumbs/turbo-rfpvvde70baxs2bn03t8cay7kcycahc678ci7akrg8.webp',
  },
  {
    id: 'hy-4-1-1-thumb-webp',
    description: 'Elementor thumb PNG → WebP sibling (HY homepage)',
    search: '/assets/media/elementor/thumbs/4-1-1-rfpvvec18whoke7mfdgazu9lsu6z1ukj68dsq85nog.png',
    replace: '/assets/media/elementor/thumbs/4-1-1-rfpvvec18whoke7mfdgazu9lsu6z1ukj68dsq85nog.webp',
  },
];

/**
 * Regex-based auto fixes (multiline / pattern).
 * @type {readonly { id: string; description: string; pattern: RegExp; replace: string | ((substring: string, ...args: unknown[]) => string) }[]}
 */
export const AUTO_FIX_REGEX = [
  {
    id: 'robots-meta-robotext',
    description:
      'Remove stray duplicate robots meta tags (robotext) — keep the first Yoast tag only',
    pattern: /(\s*<meta\s+name="robots"\s+content="[^"]*"\s*>\s*){2,}/gi,
    replace: (match) => {
      const first = match.match(/<meta\s+name="robots"\s+content="[^"]*"\s*>/i);
      return first ? `\n\t${first[0]}\n` : match;
    },
  },
];

/** Elementor popup template IDs from the EN library that must not appear on RU pages. */
export const EN_POPUP_TEMPLATE_IDS = ['886', '834', '893', '840'];

/** English phrases inside popups that indicate a wrong-locale template leak. */
export const EN_POPUP_MARKERS = [
  'First deposit bonus of 150% up to 500 dollars',
  'Write a promo code to the operator',
  'and get access to the bonus!',
  'The bonus is credited only on the FIRST deposit',
  'The jackpot is not unusual',
];

/** Placeholder / lorem-style text accidentally left in production pages. */
export const RUDIMENT_TEXT_PATTERNS = [
  'Идейные соображения высшего порядка',
];

/**
 * Legacy HTML must not contain these substrings after fix:legacy-html runs.
 * @type {readonly { id: string; needle: string; hint: string }[]}
 */
export const FORBIDDEN_LEGACY_NEEDLES = [
  {
    id: 'kz-flag-path',
    needle: '/assets/media/flags/kz.png',
    hint: 'Run npm run fix:legacy-html — KZ flag should use WPML vendor path',
  },
  {
    id: 'but-back-png',
    needle: 'but-back.png',
    hint: 'Run npm run fix:legacy-html — button image should be WebP',
  },
  {
    id: 'maxresdefault-jpg',
    needle: '/assets/media/2024/07/maxresdefault.jpg',
    hint: 'Run npm run fix:legacy-html — testimonial photo should be WebP',
  },
];

/** @type {readonly { id: string; needle: string; hint: string }[]} */
export const FORBIDDEN_RUDIMENT_NEEDLES = RUDIMENT_TEXT_PATTERNS.map((pattern) => ({
  id: 'rudiment-text',
  needle: pattern,
  hint: 'Run npm run fix:legacy-html — remove placeholder export text',
}));

/**
 * @param {string} relativePath
 * @returns {boolean}
 */
export function isRuLegacyPage(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
  if (!normalized.endsWith('index.html')) return false;
  if (
    normalized.startsWith('en/') ||
    normalized.startsWith('uz/') ||
    normalized.startsWith('kz/') ||
    normalized.startsWith('hy/') ||
    normalized.startsWith('tj/') ||
    normalized.startsWith('mastermega-content/')
  ) {
    return false;
  }
  return true;
}

/**
 * @param {string} html
 * @param {string} relativePath
 * @returns {string[]}
 */
export function detectEnglishPopupsOnRu(html, relativePath) {
  if (!isRuLegacyPage(relativePath)) return [];

  const findings = [];

  for (const id of EN_POPUP_TEMPLATE_IDS) {
    if (html.includes(`data-elementor-id="${id}"`)) {
      findings.push(`EN Elementor popup template id=${id}`);
    }
  }

  for (const phrase of EN_POPUP_MARKERS) {
    if (html.includes(phrase)) {
      findings.push(`English popup copy: "${phrase}"`);
    }
  }

  return findings;
}
