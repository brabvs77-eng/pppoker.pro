import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const catalogPath = path.join(rootDir, 'apps/web/src/config/post-translations/catalog.json');
const translationsDir = path.join(rootDir, 'apps/web/src/config/post-translations/posts');
const structuredRoutesPath = path.join(rootDir, 'apps/web/src/config/structured-post-routes.json');

export const TARGET_LOCALES = ['en', 'uz', 'kz', 'hy', 'tj'];

/** Keep in sync with apps/web/src/lib/blogArchive.ts BLOG_ARCHIVE_PAGE_SIZE */
export const BLOG_ARCHIVE_PAGE_SIZE = 6;

export const BLOG_ARCHIVES = {
  en: {
    title: 'Blog — Nuts PPPoker',
    description:
      'PPPoker club Nuts blog: poker strategy, tournament news, bonuses, and practical tips to improve your game.',
    lang: 'en',
  },
  uz: {
    title: 'Blog — Nuts PPPoker',
    description:
      'Nuts klubi PPPoker blogi: poker strategiyasi, turnir yangiliklari, bonuslar va o‘yin mahoratini oshirish bo‘yicha maslahatlar.',
    lang: 'uz',
  },
  kz: {
    title: 'Блог — Nuts PPPoker',
    description:
      'Nuts клубы PPPoker блогы: покер стратегиясы, турнир жаңалықтары, бонустар және ойын дағдыларын дамыту бойынша кеңестер.',
    lang: 'kk',
  },
  hy: {
    title: 'Բլոգ — Nuts PPPoker',
    description:
      'Բլոգ PPPoker ակումբ Nuts. պոկերի ռազմավարություններ, մրցաշարերի նորություններ, բոնուսներ և խաղային հմտություններ զարգացնելու գործնական խորհուրդներ:',
    lang: 'hy',
  },
  tj: {
    title: 'Блог — Nuts PPPoker',
    description:
      'Блоги PPPoker аз клуби Nuts: стратегияи покер, хабарҳои турнир, бонусҳо ва маслиҳатҳои амалӣ барои такмили маҳорати бозӣ.',
    lang: 'tg',
  },
};

export function loadCatalog() {
  return JSON.parse(readFileSync(catalogPath, 'utf8'));
}

export function loadPostTranslations(postId) {
  const filePath = path.join(translationsDir, `${postId}.json`);
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderPostHtml({ locale, route, title, description, publishedAt, image, bodyHtml }) {
  const lang = locale === 'tj' ? 'tg' : locale === 'kz' ? 'kk' : locale;
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${route}">
<meta property="article:published_time" content="${publishedAt}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${route}">
<meta property="og:image" content="${image}">
</head>
<body class="post type-post">
<div class="elementor elementor-location-single post type-post post-${locale}">
<div class="elementor-element elementor-widget elementor-widget-theme-post-content" data-widget_type="theme-post-content.default">
<div class="elementor-widget-container">
${bodyHtml}
</div>
</div>
</div>
</body></html>`;
}

export function renderBlogArchiveHtml({ route, title, description, lang }) {
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${route}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${route}">
</head>
<body class="archive category">
<div class="elementor elementor-location-archive"></div>
</body></html>`;
}

const PAGE_SUFFIX = {
  en: (page, total) => ` — page ${page} of ${total}`,
  uz: (page, total) => ` — ${page}-sahifa, jami ${total}`,
  kz: (page, total) => ` — ${page}-бет, барлығы ${total}`,
  hy: (page, total) => ` — էջ ${page} / ${total}`,
  tj: (page, total) => ` — саҳифа ${page} аз ${total}`,
};

export function blogArchiveRoute(locale, pageNumber) {
  if (pageNumber <= 1) return `/${locale}/blog/`;
  return `/${locale}/blog/page/${pageNumber}/`;
}

export function paginatedBlogArchiveMeta(locale, pageNumber, totalPages) {
  const meta = BLOG_ARCHIVES[locale];
  if (!meta || pageNumber <= 1) return meta;
  const suffixFn = PAGE_SUFFIX[locale];
  const suffix = suffixFn ? suffixFn(pageNumber, totalPages) : ` — page ${pageNumber}`;
  return {
    ...meta,
    title: `${meta.title}${suffix}`,
    description: meta.description ? `${meta.description}${suffix}.` : meta.description,
  };
}

export function blogArchivePageCount(postCount, pageSize = BLOG_ARCHIVE_PAGE_SIZE) {
  return Math.max(1, Math.ceil(postCount / pageSize));
}

export function syncStructuredPostRoutes() {
  const catalog = loadCatalog();
  /** @type {Record<string, string[]>} */
  const routes = Object.fromEntries(TARGET_LOCALES.map((locale) => [locale, []]));

  for (const entry of catalog) {
    const translations = loadPostTranslations(entry.id);
    if (!translations) continue;

    for (const locale of TARGET_LOCALES) {
      const copy = translations[locale];
      const slug = entry.slugs[locale];
      if (!copy || !slug) continue;
      routes[locale].push(`/${locale}/${slug}/`);
    }
  }

  for (const locale of TARGET_LOCALES) {
    routes[locale].sort((a, b) => a.localeCompare(b));
  }

  const payload = `${JSON.stringify(routes, null, 2)}\n`;
  return { routes, payload, structuredRoutesPath };
}
