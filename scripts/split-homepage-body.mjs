import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bodyPath = path.join(rootDir, 'content/bodies/_root.html');
const outputPath = path.join(rootDir, 'content/bodies/_root-with-blog-slot.html');
const chromePath = path.join(rootDir, 'apps/web/src/config/elementor-chrome.json');
const slotHtml = '<div id="native-home-blog-slot"></div>';

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

function replaceLegacyBlogWithSlot(bodyHtml, legacySectionId) {
  const classNeedle = `elementor-element-${legacySectionId}`;
  const classIndex = bodyHtml.indexOf(classNeedle);
  if (classIndex === -1) return null;

  const divStart = bodyHtml.lastIndexOf('<div', classIndex);
  if (divStart === -1) return null;

  const divEnd = findMatchingDivClose(bodyHtml, divStart);
  if (divEnd === -1) return null;

  return `${bodyHtml.slice(0, divStart)}${slotHtml}${bodyHtml.slice(divEnd)}`;
}

function divTagBalance(html) {
  return (html.match(/<div/gi) ?? []).length - (html.match(/<\/div>/gi) ?? []).length;
}

async function main() {
  const chrome = JSON.parse(await fs.readFile(chromePath, 'utf8'));
  const legacySectionId = chrome.legacyBlogSectionIds[0];
  const bodyHtml = await fs.readFile(bodyPath, 'utf8');
  const withSlot = replaceLegacyBlogWithSlot(bodyHtml, legacySectionId);

  if (!withSlot) {
    console.error('Failed to insert blog slot on homepage body');
    process.exitCode = 1;
    return;
  }

  const balance = divTagBalance(withSlot);
  if (balance !== 0) {
    console.error(`Homepage body with slot has unbalanced div tags: ${balance}`);
    process.exitCode = 1;
    return;
  }

  await fs.writeFile(outputPath, withSlot, 'utf8');
  console.log(
    `Prepared homepage body with blog slot (${withSlot.length} bytes, div balance ${balance})`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
