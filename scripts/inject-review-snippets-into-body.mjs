import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderReviewSnippetsSection } from './lib/review-snippets-static-html.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bodiesDir = path.join(rootDir, 'content/bodies');
const chromePath = path.join(rootDir, 'apps/web/src/config/elementor-chrome.json');
const slotId = 'native-review-snippets-slot';
const slotPattern = new RegExp(`<div id="${slotId}"></div>`);

const localeByRoute = {
  '/': 'ru',
  '/hy/': 'hy',
  '/en/': 'en',
  '/uz/': 'uz',
  '/kz/': 'kz',
};

async function main() {
  const chrome = JSON.parse(await fs.readFile(chromePath, 'utf8'));
  const reviewRoutes = chrome.homeReviewSlotRoutes ?? [];

  for (const { fileId, route } of reviewRoutes) {
    const bodyPath = path.join(bodiesDir, `${fileId}-with-blog-slot.html`);
    let bodyHtml;
    try {
      bodyHtml = await fs.readFile(bodyPath, 'utf8');
    } catch {
      console.error(`Missing homepage body for review inject: ${route}`);
      process.exitCode = 1;
      continue;
    }

    if (!slotPattern.test(bodyHtml)) {
      if (bodyHtml.includes(`id="${slotId}"`) && bodyHtml.includes('class="review-snippets"')) {
        console.log(`Review snippets already present in ${route} body`);
        continue;
      }

      console.error(`Missing empty #${slotId} in ${fileId}-with-blog-slot.html`);
      process.exitCode = 1;
      continue;
    }

    const locale = localeByRoute[route] ?? 'ru';
    const sectionHtml = renderReviewSnippetsSection({ locale });
    if (!sectionHtml) {
      console.error(`No review snippets to inject into ${route}`);
      process.exitCode = 1;
      continue;
    }

    const injected = bodyHtml.replace(slotPattern, sectionHtml);
    await fs.writeFile(bodyPath, injected, 'utf8');
    console.log(`Injected native review snippets into #${slotId} on ${route}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
