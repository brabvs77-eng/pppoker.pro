import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderChipCalculatorSection } from './lib/chip-calculator-static-html.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bodiesDir = path.join(rootDir, 'content/bodies');
const chromePath = path.join(rootDir, 'apps/web/src/config/elementor-chrome.json');
const slotId = 'native-chip-calculator-slot';
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
  const calculatorRoutes = chrome.homeChipCalculatorSlotRoutes ?? [];

  for (const { fileId, route } of calculatorRoutes) {
    const bodyPath = path.join(bodiesDir, `${fileId}-with-blog-slot.html`);
    let bodyHtml;
    try {
      bodyHtml = await fs.readFile(bodyPath, 'utf8');
    } catch {
      console.error(`Missing homepage body for chip calculator inject: ${route}`);
      process.exitCode = 1;
      continue;
    }

    if (!slotPattern.test(bodyHtml)) {
      if (bodyHtml.includes(`id="${slotId}"`) && bodyHtml.includes('id="native-chip-calculator"')) {
        console.log(`Chip calculator already present in ${route} body`);
        continue;
      }

      console.error(`Missing empty #${slotId} in ${fileId}-with-blog-slot.html`);
      process.exitCode = 1;
      continue;
    }

    const locale = localeByRoute[route] ?? 'ru';
    const sectionHtml = renderChipCalculatorSection({ locale });
    if (!sectionHtml) {
      console.error(`No chip calculator content to inject into ${route}`);
      process.exitCode = 1;
      continue;
    }

    const injected = bodyHtml.replace(slotPattern, sectionHtml);
    await fs.writeFile(bodyPath, injected, 'utf8');
    console.log(`Injected chip calculator into #${slotId} on ${route}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
