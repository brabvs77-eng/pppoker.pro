import { promises as fs, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { load } from 'cheerio';

import { discoverWordPressPages } from '../src/lib/wordpressHtml.mjs';
import { assertNoHekler, normalizeUrls } from '../src/lib/normalizeUrls.mjs';
import { computeCssBudget } from './compute-css-budget.mjs';
import { isBlogArchiveRoute, needsElementorRuntime } from './lib/elementor-runtime-budget.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(rootDir, 'content');
const bodiesDir = path.join(contentDir, 'bodies');
const postsDir = path.join(contentDir, 'posts');
const pagesDir = path.join(contentDir, 'pages');
const SITE_URL = 'https://pppoker.pro';

function loadNativePageRoutes() {
  const config = JSON.parse(
    readFileSync(path.join(rootDir, 'apps/web/src/config/native-pages.json'), 'utf8'),
  );
  return new Set(config.routes ?? []);
}

function routeToFileId(route) {
  if (route === '/') return '_root';
  return route.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '__');
}

function detectLocale(route) {
  const segment = route.split('/').filter(Boolean)[0];
  if (['en', 'uz', 'kz', 'hy', 'tj'].includes(segment)) return segment;
  return 'ru';
}

function isNativePageRoute(route, nativePageRoutes) {
  return nativePageRoutes.has(route);
}

function classifyPage(route, bodyHtml, nativePageRoutes) {
  if (isBlogArchiveRoute(route)) return 'blog';
  if (isNativePageRoute(route, nativePageRoutes)) return 'page';
  if (route.startsWith('/category/')) return 'category';
  if (route.startsWith('/tag/')) return 'tag';
  if (route.startsWith('/team/')) return 'team';
  if (route === '/' || /^\/(en|uz|kz|hy|tj)\/?$/.test(route)) return 'home';
  if (bodyHtml.includes('e-loop-item') || bodyHtml.includes('type-post')) return 'post';
  return 'page';
}

function normalizeRecord(attributes) {
  const normalized = {};
  for (const [key, value] of Object.entries(attributes)) {
    normalized[key] = typeof value === 'string' ? normalizeUrls(value) : value;
  }
  return normalized;
}

function extractHreflang($) {
  const alternates = [];
  $('head link[rel="alternate"][hreflang]').each((_, el) => {
    const hreflang = $(el).attr('hreflang');
    const href = $(el).attr('href');
    if (hreflang && href) {
      alternates.push({
        hreflang,
        href: normalizeUrls(href),
      });
    }
  });
  return alternates;
}

function extractStylesheets($) {
  const sheets = new Set();
  $('head link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) sheets.add(normalizeUrls(href));
  });
  return [...sheets];
}

function extractHeadInlineStyles($) {
  const blocks = [];
  $('head style').each((_, el) => {
    const html = $(el).html();
    if (html?.trim()) blocks.push(normalizeUrls(html));
  });
  return blocks;
}

function extractBodyScripts($) {
  const scripts = [];
  $('body script[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src) scripts.push(normalizeUrls(src));
  });
  return [...new Set(scripts)];
}

/** Ordered head/body script tags required for Elementor widgets (jQuery, inline config, etc.). */
function extractRuntimeScripts($) {
  const entries = [];

  const pushScript = (el) => {
    const src = $(el).attr('src');
    const type = $(el).attr('type') ?? undefined;
    const id = $(el).attr('id') ?? undefined;

    if (src) {
      const normalized = normalizeUrls(src);
      if (normalized.includes('googletagmanager.com') || normalized.includes('googleoptimize.com')) {
        return;
      }
      entries.push({ kind: 'external', src: normalized, type, id });
      return;
    }

    const content = $(el).html()?.trim();
    if (!content) return;
    entries.push({ kind: 'inline', content: normalizeUrls(content), type, id });
  };

  $('head script').each((_, el) => pushScript(el));
  $('body script').each((_, el) => pushScript(el));

  return entries;
}

function fixElementskitAccordionHashes(html) {
  // Legacy WP markup: href="#collapse-…" but id="Collapse-…" — broken anchor without JS.
  return html.replace(/href="#collapse-/g, 'href="#Collapse-');
}

function extractBodyHtml($) {
  const body = $('body').first().clone();
  body.find('script').remove();
  const html = normalizeUrls(body.html() ?? '');
  return fixElementskitAccordionHashes(html);
}

function extractJsonLd($) {
  const blocks = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).html()?.trim();
    if (raw) blocks.push(normalizeUrls(raw));
  });
  return blocks;
}

function extractPostArticleHtml($) {
  const widget = $('.elementor-widget-theme-post-content').first();
  if (widget.length) {
    return normalizeUrls(widget.html() ?? '');
  }
  return null;
}

function extractRedirectTarget($) {
  const meta = $('head meta[http-equiv="refresh" i]').attr('content');
  if (!meta) return null;

  const match = meta.match(/url=([^;]+)/i);
  if (!match) return null;

  let target = normalizeUrls(match[1].trim());
  if (target.startsWith('http')) {
    try {
      const url = new URL(target);
      target = url.pathname || '/';
    } catch {
      return null;
    }
  }

  if (!target.startsWith('/')) {
    target = `/${target}`;
  }

  return target.endsWith('/') || target === '/' ? target : `${target}/`;
}

function extractPublishedTime($) {
  const meta =
    $('meta[property="article:published_time"]').attr('content') ||
    $('meta[property="og:updated_time"]').attr('content') ||
    '';
  return meta ? normalizeUrls(meta) : '';
}

async function writePostRecord(fileId, record) {
  await fs.mkdir(postsDir, { recursive: true });
  const serialized = JSON.stringify(record, null, 2);
  assertNoHekler(serialized, `content/posts/${fileId}.json`);
  await fs.writeFile(path.join(postsDir, `${fileId}.json`), `${serialized}\n`, 'utf8');
}

async function writePageRecord(fileId, record) {
  await fs.mkdir(pagesDir, { recursive: true });
  const serialized = JSON.stringify(record, null, 2);
  assertNoHekler(serialized, `content/pages/${fileId}.json`);
  await fs.writeFile(path.join(pagesDir, `${fileId}.json`), `${serialized}\n`, 'utf8');
}

async function generateLlmsTxt(pages) {
  const active = pages.filter((page) => !page.isRedirect);
  const lines = [
    '# Nuts онлайн покер клуб pppoker россия',
    '',
    '> Онлайн покер на деньги — PPPoker. Надежный покер-рум с выводом, бонусами и турнирами.',
    '',
    `Generated ${new Date().toISOString().split('T')[0]}. All URLs: ${SITE_URL}`,
    '',
    '## Страницы',
  ];

  for (const page of active.filter((p) => ['home', 'page'].includes(p.type)).slice(0, 12)) {
    lines.push(`- [${page.title}](${SITE_URL}${page.route === '/' ? '' : page.route.replace(/^\//, '')})`);
  }

  lines.push('', '## Записи блога');
  for (const page of active.filter((p) => p.type === 'post').slice(0, 20)) {
    const pathPart = page.route.replace(/^\//, '').replace(/\/$/, '');
    lines.push(`- [${page.title}](${SITE_URL}/${pathPart}/)`);
  }

  lines.push('', '## Optional', `- [Sitemap index](${SITE_URL}/sitemap_index.xml)`, '');

  const llms = lines.join('\n');
  assertNoHekler(llms, 'llms.txt');
  await fs.writeFile(path.join(rootDir, 'llms.txt'), llms, 'utf8');
}

async function main() {
  await fs.rm(contentDir, { recursive: true, force: true });
  await fs.mkdir(bodiesDir, { recursive: true });

  const nativePageRoutes = loadNativePageRoutes();
  const pages = await discoverWordPressPages(rootDir);
  const manifestPages = [];

  for (const page of pages) {
    const source = await fs.readFile(page.sourcePath, 'utf8');
    const $ = load(source, { decodeEntities: false });
    const body = $('body').first();
    const bodyHtml = extractBodyHtml($);
    const stylesheets = extractStylesheets($);
    const type = classifyPage(page.route, bodyHtml, nativePageRoutes);
    const fileId = routeToFileId(page.route);

    assertNoHekler(bodyHtml, `body ${page.route}`);

    await fs.writeFile(path.join(bodiesDir, `${fileId}.html`), bodyHtml, 'utf8');

    const entry = {
      route: page.route,
      slug: page.route === '/' ? [] : page.route.replace(/^\//, '').replace(/\/$/, '').split('/'),
      fileId,
      source: page.relativePath,
      locale: detectLocale(page.route),
      type,
      title: normalizeUrls($('head title').first().text().replace(/\s+/g, ' ').trim()),
      description: normalizeUrls($('head meta[name="description"]').first().attr('content') ?? ''),
      canonical: normalizeUrls($('head link[rel="canonical"]').first().attr('href') ?? page.route),
      lang: $('html').attr('lang') ?? '',
      publishedAt: type === 'post' ? extractPublishedTime($) : '',
      ogImage: normalizeUrls($('meta[property="og:image"]').first().attr('content') ?? ''),
      hreflang: extractHreflang($),
      stylesheets,
      headInlineStyles: extractHeadInlineStyles($),
      bodyScripts: extractBodyScripts($),
      runtimeScripts: extractRuntimeScripts($),
      bodyAttributes: normalizeRecord(body.attr() ?? {}),
      jsonLd: extractJsonLd($),
      isRedirect: Boolean($('head meta[http-equiv="refresh" i]').length),
      redirectTo: null,
      hasStructuredPost: false,
      hasNativePage: false,
      needsElementorRuntime: true,
    };

    if (entry.isRedirect) {
      entry.redirectTo = extractRedirectTarget($);
    }

    if (isNativePageRoute(page.route, nativePageRoutes)) {
      const articleHtml = extractPostArticleHtml($);
      if (articleHtml) {
        entry.hasNativePage = true;
        await writePageRecord(fileId, {
          route: entry.route,
          locale: entry.locale,
          title: entry.title,
          description: entry.description,
          html: articleHtml,
        });
      }
    } else if (type === 'post') {
      const articleHtml = extractPostArticleHtml($);
      if (articleHtml) {
        entry.hasStructuredPost = true;
        await writePostRecord(fileId, {
          route: entry.route,
          locale: entry.locale,
          title: entry.title,
          description: entry.description,
          publishedAt: extractPublishedTime($),
          html: articleHtml,
        });
      }
    }

    entry.needsElementorRuntime = needsElementorRuntime({
      route: entry.route,
      locale: entry.locale,
      bodyHtml,
      hasStructuredPost: entry.hasStructuredPost,
      hasNativePage: entry.hasNativePage,
    });

    manifestPages.push(entry);
  }

  const budget = computeCssBudget(manifestPages);

  const manifest = {
    generatedAt: new Date().toISOString(),
    pageCount: budget.pages.length,
    coreStylesheets: budget.coreStylesheets,
    allStylesheets: budget.allStylesheets,
    globalStylesheets: budget.allStylesheets,
    cssBudget: budget.stats,
    pages: budget.pages.sort((a, b) => a.route.localeCompare(b.route)),
  };

  const manifestJson = JSON.stringify(manifest, null, 2);
  assertNoHekler(manifestJson, 'manifest.json');

  await fs.writeFile(path.join(contentDir, 'manifest.json'), `${manifestJson}\n`, 'utf8');
  await generateLlmsTxt(budget.pages);

  console.log(`Extracted ${budget.pages.length} pages to content/`);
  console.log(
    `CSS budget: ${budget.stats.coreCount} core + ~${budget.stats.averagePageSpecific.toFixed(1)} page-specific stylesheets`,
  );
  const structured = budget.pages.filter((p) => p.hasStructuredPost);
  const nativePages = budget.pages.filter((p) => p.hasNativePage);
  console.log(`Structured posts: ${structured.length}`);
  console.log(
    `Native pages: ${nativePages.length} (${nativePages.map((p) => p.route).join(', ')})`,
  );
  const enPosts = structured.filter((p) => p.locale === 'en');
  if (enPosts.length) {
    console.log(`EN structured posts: ${enPosts.map((p) => p.route).join(', ')}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
