import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderHomeWhyNutsSection } from './lib/why-nuts-static-html.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bodiesDir = path.join(rootDir, 'content/bodies');
const chromePath = path.join(rootDir, 'apps/web/src/config/elementor-chrome.json');
const slotId = 'native-home-why-nuts-slot';
const slotPattern = new RegExp(`<div id="${slotId}"></div>`);
const existingSectionPattern =
  /<section class="home-why" id="native-home-why-nuts"[\s\S]*?<\/div>\s*<\/section>/;

const localeByRoute = {
  '/': 'ru',
  '/hy/': 'hy',
  '/en/': 'en',
  '/uz/': 'uz',
  '/kz/': 'kz',
  '/tj/': 'tj',
};

async function main() {
  const chrome = JSON.parse(await fs.readFile(chromePath, 'utf8'));
  const whyNutsRoutes = chrome.homeWhyNutsSlotRoutes ?? [];

  for (const { fileId, route } of whyNutsRoutes) {
    const bodyPath = path.join(bodiesDir, `${fileId}-with-blog-slot.html`);
    let bodyHtml;
    try {
      bodyHtml = await fs.readFile(bodyPath, 'utf8');
    } catch {
      console.error(`Missing homepage body for why-nuts inject: ${route}`);
      process.exitCode = 1;
      continue;
    }

    const locale = localeByRoute[route] ?? 'ru';
    const sectionHtml = renderHomeWhyNutsSection({ locale });
    if (!sectionHtml) {
      console.error(`No why-nuts content to inject into ${route}`);
      process.exitCode = 1;
      continue;
    }

    if (!slotPattern.test(bodyHtml)) {
      if (existingSectionPattern.test(bodyHtml)) {
        const injected = bodyHtml.replace(existingSectionPattern, () => sectionHtml);
        await fs.writeFile(bodyPath, injected, 'utf8');
        console.log(`Re-injected native why-nuts on ${route}`);
        continue;
      }

      if (bodyHtml.includes(`id="${slotId}"`) && bodyHtml.includes('id="native-home-why-nuts"')) {
        console.log(`Native why-nuts already present in ${route} body`);
        continue;
      }

      console.error(`Missing empty #${slotId} in ${fileId}-with-blog-slot.html`);
      process.exitCode = 1;
      continue;
    }

    const injected = bodyHtml.replace(slotPattern, () => sectionHtml);
    await fs.writeFile(bodyPath, injected, 'utf8');
    console.log(`Injected native why-nuts into #${slotId} on ${route}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
