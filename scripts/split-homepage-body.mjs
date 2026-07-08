import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bodiesDir = path.join(rootDir, 'content/bodies');
const chromePath = path.join(rootDir, 'apps/web/src/config/elementor-chrome.json');
const slotHtml = '<div id="native-home-blog-slot"></div>';
const reviewSlotHtml = '<div id="native-review-snippets-slot"></div>';

function findMatchingDivClose(html, divStart) {
  let pos = divStart;
  let depth = 0;
  const len = html.length;

  while (pos < len) {
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

function replaceElementorSectionWithSlot(bodyHtml, elementId, slotMarkup) {
  const classNeedle = `elementor-element-${elementId}`;
  const classIndex = bodyHtml.indexOf(classNeedle);
  if (classIndex === -1) return bodyHtml;

  const divStart = bodyHtml.lastIndexOf('<div', classIndex);
  if (divStart === -1) return bodyHtml;

  const divEnd = findMatchingDivClose(bodyHtml, divStart);
  if (divEnd === -1) return bodyHtml;

  return `${bodyHtml.slice(0, divStart)}${slotMarkup}${bodyHtml.slice(divEnd)}`;
}

function replaceLegacyBlogWithSlot(bodyHtml, legacySectionId) {
  const classNeedle = `elementor-element-${legacySectionId}`;
  if (!bodyHtml.includes(classNeedle)) return null;
  return replaceElementorSectionWithSlot(bodyHtml, legacySectionId, slotHtml);
}

function divTagBalance(html) {
  return (html.match(/<div/gi) ?? []).length - (html.match(/<\/div>/gi) ?? []).length;
}

async function main() {
  const chrome = JSON.parse(await fs.readFile(chromePath, 'utf8'));
  const defaultLegacySectionId = chrome.legacyBlogSectionIds[0];
  const reviewsSectionId = chrome.legacyReviewsSectionElementId;
  const homeRoutes = chrome.homeBlogSlotRoutes ?? [{ fileId: '_root', route: '/' }];
  const reviewRoutes = new Set(
    (chrome.homeReviewSlotRoutes ?? []).map((entry) => entry.route),
  );

  for (const { fileId, route, legacyBlogSectionId } of homeRoutes) {
    const legacySectionId = legacyBlogSectionId ?? defaultLegacySectionId;
    const bodyPath = path.join(bodiesDir, `${fileId}.html`);
    const outputPath = path.join(bodiesDir, `${fileId}-with-blog-slot.html`);

    let bodyHtml;
    try {
      bodyHtml = await fs.readFile(bodyPath, 'utf8');
    } catch {
      console.error(`Missing homepage body for ${route}: ${fileId}.html`);
      process.exitCode = 1;
      continue;
    }

    const withSlot = replaceLegacyBlogWithSlot(bodyHtml, legacySectionId);
    if (!withSlot) {
      console.error(`Failed to insert blog slot on ${route}`);
      process.exitCode = 1;
      continue;
    }

    const withReviewSlot =
      reviewsSectionId && reviewRoutes.has(route)
        ? replaceElementorSectionWithSlot(withSlot, reviewsSectionId, reviewSlotHtml)
        : withSlot;

    const balance = divTagBalance(withReviewSlot);
    if (balance !== 0) {
      console.error(`Homepage body for ${route} has unbalanced div tags: ${balance}`);
      process.exitCode = 1;
      continue;
    }

    await fs.writeFile(outputPath, withReviewSlot, 'utf8');
    console.log(`Prepared ${route} body with blog slot (${withReviewSlot.length} bytes)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
