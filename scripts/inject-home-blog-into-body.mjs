import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  loadHomeBlogLabels,
  loadHomeBlogPosts,
  renderHomeBlogSection,
} from './lib/home-blog-static-html.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bodiesDir = path.join(rootDir, 'content/bodies');
const chromePath = path.join(rootDir, 'apps/web/src/config/elementor-chrome.json');
const slotId = 'native-home-blog-slot';
const slotPattern = new RegExp(`<div id="${slotId}"></div>`);

const localeByRoute = {
  '/': 'ru',
  '/hy/': 'hy',
  '/en/': 'en',
  '/uz/': 'uz',
  '/kz/': 'kz',
};

const postsLocaleByRoute = {
  '/hy/': 'ru',
};

async function main() {
  const chrome = JSON.parse(await fs.readFile(chromePath, 'utf8'));
  const homeRoutes = chrome.homeBlogSlotRoutes ?? [{ fileId: '_root', route: '/' }];

  for (const { fileId, route } of homeRoutes) {
    const bodyPath = path.join(bodiesDir, `${fileId}-with-blog-slot.html`);
    const bodyHtml = await fs.readFile(bodyPath, 'utf8');
    const locale = localeByRoute[route] ?? 'ru';
    const postsLocale = postsLocaleByRoute[route] ?? locale;
    const posts = loadHomeBlogPosts(postsLocale);
    const labels = loadHomeBlogLabels(locale);

    if (!slotPattern.test(bodyHtml)) {
      if (bodyHtml.includes(`id="${slotId}"`) && bodyHtml.includes('class="home-blog"')) {
        console.log(`Home blog already present in ${route} body`);
        continue;
      }

      console.error(`Missing empty #${slotId} in ${fileId}-with-blog-slot.html`);
      process.exitCode = 1;
      continue;
    }

    const blogHtml = renderHomeBlogSection({
      posts,
      labels,
      locale,
      blogArchiveHref: locale === 'ru' ? '/blog/' : `/${locale}/blog/`,
    });

    if (!blogHtml) {
      console.error(`No home blog posts to inject into ${route}`);
      process.exitCode = 1;
      continue;
    }

    const nextBody = bodyHtml.replace(slotPattern, `<div id="${slotId}">${blogHtml}</div>`);
    await fs.writeFile(bodyPath, nextBody, 'utf8');
    console.log(`Injected native home blog into #${slotId} on ${route}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
