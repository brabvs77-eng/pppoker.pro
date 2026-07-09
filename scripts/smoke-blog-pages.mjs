import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

import { startStaticServer } from './lib/smoke-static-server.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');
const port = 9877;

const BLOG_SMOKE_PAGES = [
  {
    label: 'RU archive',
    urlPath: '/blog/',
    surface: '.blog-surface',
    shell: '.blog-archive',
    title: '#blog-archive-title',
    minBreadcrumbLinks: 1,
  },
  {
    label: 'EN archive',
    urlPath: '/en/blog/',
    surface: '.blog-surface',
    shell: '.blog-archive',
    title: '#blog-archive-title',
    minBreadcrumbLinks: 1,
  },
  {
    label: 'RU post',
    urlPath: '/blog-chto-takoe-ev-v-pokere/',
    surface: '.blog-surface',
    shell: '.post-article',
    title: '.post-article__header h1',
    heroImage: '.post-article__hero-image',
    minBreadcrumbLinks: 2,
  },
];

function parseRgb(color) {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function isLightText(rgb) {
  const [r, g, b] = rgb;
  return r >= 180 && g >= 180 && b >= 180;
}

function isAccentHeading(rgb) {
  const [r, g, b] = rgb;
  return (r >= 200 && g >= 200 && b >= 200) || (r >= 240 && g >= 200 && b <= 130);
}

function isDarkBackground(rgb) {
  const [r, g, b] = rgb;
  return r <= 60 && g <= 60 && b <= 80;
}

async function smokeBlogPage(page, { label, urlPath, surface, shell, title, heroImage, minBreadcrumbLinks = 0 }) {
  const violations = [];
  await page.goto(`http://127.0.0.1:${port}${urlPath}`, {
    waitUntil: 'load',
    timeout: 90_000,
  });

  const state = await page.evaluate(({ surface, shell, title, heroImage, minBreadcrumbLinks }) => {
    const surfaceEl = document.querySelector(surface);
    const root = document.querySelector(shell);
    const heading = document.querySelector(title);
    if (!surfaceEl || !root || !heading) {
      return { missing: !surfaceEl ? surface : !root ? shell : title };
    }

    const surfaceStyle = getComputedStyle(surfaceEl);
    const surfaceRect = surfaceEl.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const rootStyle = getComputedStyle(root);
    const titleStyle = getComputedStyle(heading);
    const hero = heroImage ? document.querySelector(heroImage) : null;
    const breadcrumbLinks = document.querySelectorAll('.blog-breadcrumbs a').length;
    return {
      surfaceBg: surfaceStyle.backgroundColor,
      surfaceFullWidth: surfaceRect.width >= viewportWidth * 0.98,
      rootBg: rootStyle.backgroundColor,
      titleColor: titleStyle.color,
      hasPostContent: !!document.querySelector('.post-article__content p'),
      heroSrc: hero?.getAttribute('src') ?? null,
      heroVisible: hero ? hero.getBoundingClientRect().height > 0 : false,
      breadcrumbLinks,
      minBreadcrumbLinks,
    };
  }, { surface, shell, title, heroImage, minBreadcrumbLinks });

  if (state.missing) {
    violations.push(`[${label}] Missing element ${state.missing}`);
    return violations;
  }

  const titleRgb = parseRgb(state.titleColor);
  const bgRgb = parseRgb(state.surfaceBg);

  if (!titleRgb || !(shell === '.blog-archive' ? isAccentHeading(titleRgb) : isLightText(titleRgb))) {
    violations.push(`[${label}] Heading text not readable on dark background: ${state.titleColor}`);
  }
  if (!bgRgb || !isDarkBackground(bgRgb)) {
    violations.push(`[${label}] Blog surface background not dark enough: ${state.surfaceBg}`);
  }
  if (!state.surfaceFullWidth) {
    violations.push(`[${label}] Blog surface does not span full viewport width`);
  }
  if (state.breadcrumbLinks < state.minBreadcrumbLinks) {
    violations.push(
      `[${label}] Expected at least ${state.minBreadcrumbLinks} breadcrumb links, found ${state.breadcrumbLinks}`,
    );
  }

  if (shell === '.post-article') {
    if (!state.heroSrc || !state.heroVisible) {
      violations.push(`[${label}] Featured hero image missing or not visible`);
    }

    if (state.hasPostContent) {
      const paragraphColor = await page.evaluate(() => {
        const paragraph = document.querySelector('.post-article__content p');
        return paragraph ? getComputedStyle(paragraph).color : null;
      });
      const paragraphRgb = paragraphColor ? parseRgb(paragraphColor) : null;
      if (!paragraphRgb || !isLightText(paragraphRgb)) {
        violations.push(`[${label}] Body text not light enough: ${paragraphColor}`);
      }
    }
  }

  return violations;
}

async function main() {
  const server = await startStaticServer(outDir, port);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const violations = [];

  try {
    for (const entry of BLOG_SMOKE_PAGES) {
      violations.push(...(await smokeBlogPage(page, entry)));
    }

    if (violations.length === 0) {
      await page.goto(`http://127.0.0.1:${port}/hy/`, {
        waitUntil: 'load',
        timeout: 90_000,
      });
      const hyBlogHref = await page.evaluate(() => {
        const link = document.querySelector('.site-header__nav a[href="/blog/"]');
        return link?.getAttribute('href') ?? null;
      });
      if (hyBlogHref !== '/blog/') {
        violations.push(`[HY header] Blog link must fall back to /blog/, got ${hyBlogHref}`);
      }
    }
  } finally {
    await browser.close();
    await server.close();
  }

  if (violations.length) {
    console.error('Blog page smoke failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    `Blog page smoke passed for ${BLOG_SMOKE_PAGES.length} routes + HY blog link (full-width dark surface, breadcrumbs, hero image).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
