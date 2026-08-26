import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderHomeAppDownloadSection } from './lib/app-download-static-html.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bodiesDir = path.join(rootDir, 'content/bodies');
const chromePath = path.join(rootDir, 'apps/web/src/config/elementor-chrome.json');
const slotId = 'native-home-app-download-slot';
const slotPattern = new RegExp(`<div id="${slotId}"></div>`);
const existingSectionPattern =
  /<section class="home-download" id="reg"[\s\S]*?<\/div>\s*<\/section>/;

const localeByRoute = {
  '/': 'ru',
  '/hy/': 'hy',
  '/en/': 'en',
  '/uz/': 'uz',
  '/kz/': 'kz',
};

async function main() {
  const chrome = JSON.parse(await fs.readFile(chromePath, 'utf8'));
  const appDownloadRoutes = chrome.homeAppDownloadSlotRoutes ?? [];

  for (const { fileId, route } of appDownloadRoutes) {
    const bodyPath = path.join(bodiesDir, `${fileId}-with-blog-slot.html`);
    let bodyHtml;
    try {
      bodyHtml = await fs.readFile(bodyPath, 'utf8');
    } catch {
      console.error(`Missing homepage body for app-download inject: ${route}`);
      process.exitCode = 1;
      continue;
    }

    const locale = localeByRoute[route] ?? 'ru';
    const sectionHtml = renderHomeAppDownloadSection({ locale });
    if (!sectionHtml) {
      console.error(`No app-download content to inject into ${route}`);
      process.exitCode = 1;
      continue;
    }

    if (!slotPattern.test(bodyHtml)) {
      if (existingSectionPattern.test(bodyHtml)) {
        const injected = bodyHtml.replace(existingSectionPattern, () => sectionHtml);
        await fs.writeFile(bodyPath, injected, 'utf8');
        console.log(`Re-injected native app-download on ${route}`);
        continue;
      }

      if (bodyHtml.includes('id="native-home-app-download"')) {
        console.log(`Native app-download already present in ${route} body`);
        continue;
      }

      console.error(`Missing empty #${slotId} in ${fileId}-with-blog-slot.html`);
      process.exitCode = 1;
      continue;
    }

    const injected = bodyHtml.replace(slotPattern, () => sectionHtml);
    await fs.writeFile(bodyPath, injected, 'utf8');
    console.log(`Injected native app-download into #${slotId} on ${route}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
