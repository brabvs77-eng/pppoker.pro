import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const legalPath = path.join(rootDir, 'apps/web/src/config/page-translations/legal.json');

export const LEGAL_TARGET_LOCALES = ['uz', 'kz', 'hy', 'tj'];
export const LEGAL_PAGE_IDS = ['user-agreement', 'privacy-policy'];

export function loadLegalTranslations() {
  if (!existsSync(legalPath)) return null;
  return JSON.parse(readFileSync(legalPath, 'utf8'));
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function localeHtmlLang(locale) {
  if (locale === 'tj') return 'tg';
  if (locale === 'kz') return 'kk';
  return locale;
}

export function renderLegalPageHtml({
  locale,
  route,
  title,
  description,
  publishedAt,
  ogImage,
  bodyHtml,
}) {
  const lang = localeHtmlLang(locale);
  const publishedMeta = publishedAt
    ? `<meta property="article:published_time" content="${publishedAt}">`
    : '';

  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${route}">
${publishedMeta}
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${route}">
${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
</head>
<body class="page type-page">
<div class="elementor elementor-location-single page type-page page-${locale}">
<div class="elementor-element elementor-widget elementor-widget-theme-post-content" data-widget_type="theme-post-content.default">
<div class="elementor-widget-container">
${bodyHtml}
</div>
</div>
</div>
</body></html>`;
}
