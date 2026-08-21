import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  loadHomePromoModals,
  renderHomePromoModalsSection,
  renderHotspotTrigger,
} from './lib/promo-modals-static-html.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bodiesDir = path.join(rootDir, 'content/bodies');
const chromePath = path.join(rootDir, 'apps/web/src/config/elementor-chrome.json');
const slotId = 'native-home-promo-modals-slot';
const slotPattern = new RegExp(`<div id="${slotId}"></div>`);

const localeByRoute = {
  '/': 'ru',
  '/hy/': 'hy',
  '/en/': 'en',
  '/uz/': 'uz',
  '/kz/': 'kz',
};

const MODAL_KEYS = ['bonus', 'events', 'jackpot'];

function findMatchingDivClose(html, divStart) {
  let pos = divStart;
  let depth = 0;

  while (pos < html.length) {
    const open = html.indexOf('<div', pos);
    const close = html.indexOf('</div>', pos);
    if (close === -1) return -1;

    if (open !== -1 && open < close) {
      depth += 1;
      pos = open + 4;
      continue;
    }

    depth -= 1;
    pos = close + 6;
    if (depth === 0) return pos;
  }

  return -1;
}

function elementorContainerNeedle(elementId) {
  return `class="elementor-element elementor-element-${elementId}`;
}

function replaceElementorWidget(bodyHtml, elementId, replacement) {
  const classNeedle = elementorContainerNeedle(elementId);
  const classIndex = bodyHtml.indexOf(classNeedle);
  if (classIndex === -1) return bodyHtml;

  const divStart = bodyHtml.lastIndexOf('<div', classIndex);
  if (divStart === -1) return bodyHtml;

  const divEnd = findMatchingDivClose(bodyHtml, divStart);
  if (divEnd === -1) return bodyHtml;

  return `${bodyHtml.slice(0, divStart)}${replacement}${bodyHtml.slice(divEnd)}`;
}

function stripElementorPopups(bodyHtml) {
  let html = bodyHtml;

  while (html.includes('data-elementor-type="popup"')) {
    const markerIndex = html.indexOf('data-elementor-type="popup"');
    const divStart = html.lastIndexOf('<div', markerIndex);
    if (divStart === -1) break;

    const divEnd = findMatchingDivClose(html, divStart);
    if (divEnd === -1) break;

    html = `${html.slice(0, divStart)}${html.slice(divEnd)}`;
  }

  return html;
}

function stripPopupStyles(bodyHtml, styleIds) {
  let html = bodyHtml;

  for (const id of styleIds) {
    const start = html.indexOf(`<style id="elementor-post-${id}"`);
    if (start === -1) continue;
    const end = html.indexOf('</style>', start);
    if (end === -1) continue;
    html = `${html.slice(0, start)}${html.slice(end + '</style>'.length)}`;
  }

  return html;
}

function patchHotspots(bodyHtml, hotspotElementIds, triggers) {
  let html = bodyHtml;

  for (const key of MODAL_KEYS) {
    const elementId = hotspotElementIds[key];
    const label = triggers[key] ?? 'More info';
    html = replaceElementorWidget(html, elementId, renderHotspotTrigger(key, label));
  }

  return html;
}

async function main() {
  const chrome = JSON.parse(await fs.readFile(chromePath, 'utf8'));
  const modalRoutes = chrome.homePromoModalsSlotRoutes ?? [];

  for (const { fileId, route } of modalRoutes) {
    const bodyPath = path.join(bodiesDir, `${fileId}-with-blog-slot.html`);
    let bodyHtml;
    try {
      bodyHtml = await fs.readFile(bodyPath, 'utf8');
    } catch {
      console.error(`Missing homepage body for promo modals inject: ${route}`);
      process.exitCode = 1;
      continue;
    }

    if (!slotPattern.test(bodyHtml)) {
      if (bodyHtml.includes(`id="${slotId}"`) && bodyHtml.includes('id="native-home-promo-modals"')) {
        console.log(`Native promo modals already present in ${route} body`);
        continue;
      }

      console.error(`Missing empty #${slotId} in ${fileId}-with-blog-slot.html`);
      process.exitCode = 1;
      continue;
    }

    const locale = localeByRoute[route] ?? 'ru';
    const { hotspotElementIds, popupTemplateStyleIds, triggers } = loadHomePromoModals(locale);
    const sectionHtml = renderHomePromoModalsSection({ locale });
    if (!sectionHtml) {
      console.error(`No promo modal content to inject into ${route}`);
      process.exitCode = 1;
      continue;
    }

    let patched = patchHotspots(bodyHtml, hotspotElementIds, triggers);
    patched = stripElementorPopups(patched);
    patched = stripPopupStyles(patched, popupTemplateStyleIds);
    patched = patched.replace(slotPattern, sectionHtml);

    if (patched.includes('elementor-location-popup')) {
      console.error(`Legacy Elementor popups still present after strip on ${route}`);
      process.exitCode = 1;
      continue;
    }

    await fs.writeFile(bodyPath, patched, 'utf8');
    console.log(`Injected native promo modals into #${slotId} on ${route}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
