import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

import { startStaticServer } from './lib/smoke-static-server.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');
const port = 9877;

const BLOG_SMOKE_PAGES = [
  { label: 'RU archive', urlPath: '/blog/', shell: '.blog-archive', title: '#blog-archive-title' },
  { label: 'EN archive', urlPath: '/en/blog/', shell: '.blog-archive', title: '#blog-archive-title' },
  {
    label: 'RU post',
    urlPath: '/blog-chto-takoe-ev-v-pokere/',
    shell: '.post-article',
    title: '.post-article__header h1',
  },
];

function parseRgb(color) {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function isDarkText(rgb) {
  const [r, g, b] = rgb;
  return r <= 80 && g <= 80 && b <= 80;
}

function isLightBackground(rgb) {
  const [r, g, b] = rgb;
  return r >= 200 && g >= 200 && b >= 200;
}

async function smokeBlogPage(page, { label, urlPath, shell, title }) {
  const violations = [];
  await page.goto(`http://127.0.0.1:${port}${urlPath}`, {
    waitUntil: 'networkidle',
    timeout: 90_000,
  });

  const state = await page.evaluate(({ shell, title }) => {
    const root = document.querySelector(shell);
    const heading = document.querySelector(title);
    if (!root || !heading) {
      return { missing: !root ? shell : title };
    }

    const rootStyle = getComputedStyle(root);
    const titleStyle = getComputedStyle(heading);
    return {
      rootBg: rootStyle.backgroundColor,
      titleColor: titleStyle.color,
      hasPostContent: !!document.querySelector('.post-article__content p'),
    };
  }, { shell, title });

  if (state.missing) {
    violations.push(`[${label}] Missing element ${state.missing}`);
    return violations;
  }

  const titleRgb = parseRgb(state.titleColor);
  const bgRgb = parseRgb(state.rootBg);

  if (!titleRgb || !isDarkText(titleRgb)) {
    violations.push(`[${label}] Heading text not dark enough: ${state.titleColor}`);
  }
  if (!bgRgb || !isLightBackground(bgRgb)) {
    violations.push(`[${label}] Shell background not light enough: ${state.rootBg}`);
  }

  if (shell === '.post-article' && state.hasPostContent) {
    const paragraphColor = await page.evaluate(() => {
      const paragraph = document.querySelector('.post-article__content p');
      return paragraph ? getComputedStyle(paragraph).color : null;
    });
    const paragraphRgb = paragraphColor ? parseRgb(paragraphColor) : null;
    if (!paragraphRgb || !isDarkText(paragraphRgb)) {
      violations.push(`[${label}] Body text not dark enough: ${paragraphColor}`);
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
        waitUntil: 'networkidle',
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
    `Blog page smoke passed for ${BLOG_SMOKE_PAGES.length} routes + HY blog link fallback (readable dark-on-light text).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
