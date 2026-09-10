import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderHomeDepositOneClickSection } from './lib/deposit-one-click-static-html.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bodiesDir = path.join(rootDir, 'content/bodies');
const chromePath = path.join(rootDir, 'apps/web/src/config/elementor-chrome.json');
const slotId = 'native-home-deposit-one-click-slot';
const slotPattern = new RegExp(`<div id="${slotId}"></div>`);

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
  const depositRoutes = chrome.homeDepositOneClickSlotRoutes ?? [];

  for (const { fileId, route } of depositRoutes) {
    const bodyPath = path.join(bodiesDir, `${fileId}-with-blog-slot.html`);
    let bodyHtml;
    try {
      bodyHtml = await fs.readFile(bodyPath, 'utf8');
    } catch {
      console.error(`Missing homepage body for deposit inject: ${route}`);
      process.exitCode = 1;
      continue;
    }

    if (!slotPattern.test(bodyHtml)) {
      if (bodyHtml.includes(`id="${slotId}"`) && bodyHtml.includes('id="native-home-deposit-one-click"')) {
        console.log(`Native deposit one-click already present in ${route} body`);
        continue;
      }

      console.error(`Missing empty #${slotId} in ${fileId}-with-blog-slot.html`);
      process.exitCode = 1;
      continue;
    }

    const locale = localeByRoute[route] ?? 'ru';
    const sectionHtml = renderHomeDepositOneClickSection({ locale });
    if (!sectionHtml) {
      console.error(`No deposit one-click content to inject into ${route}`);
      process.exitCode = 1;
      continue;
    }

    const injected = bodyHtml.replace(slotPattern, sectionHtml);
    await fs.writeFile(bodyPath, injected, 'utf8');
    console.log(`Injected native deposit one-click into #${slotId} on ${route}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
