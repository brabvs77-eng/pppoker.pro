import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bodyPath = path.join(rootDir, 'content/bodies/_root.html');
const legacySectionId = '39311d7';

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

function splitHomepageBody(bodyHtml, legacySectionId) {
  const classNeedle = `elementor-element-${legacySectionId}`;
  const classIndex = bodyHtml.indexOf(classNeedle);
  if (classIndex === -1) return null;

  const divStart = bodyHtml.lastIndexOf('<div', classIndex);
  if (divStart === -1) return null;

  const divEnd = findMatchingDivClose(bodyHtml, divStart);
  if (divEnd === -1) return null;

  return {
    beforeHtml: bodyHtml.slice(0, divStart),
    afterHtml: bodyHtml.slice(divEnd),
  };
}

async function main() {
  const bodyHtml = await fs.readFile(bodyPath, 'utf8');
  const split = splitHomepageBody(bodyHtml, legacySectionId);

  if (!split) {
    console.error('Failed to split homepage body around legacy blog section');
    process.exitCode = 1;
    return;
  }

  const beforePath = path.join(rootDir, 'content/bodies/_root-before-blog.html');
  const afterPath = path.join(rootDir, 'content/bodies/_root-after-blog.html');

  await fs.writeFile(beforePath, split.beforeHtml, 'utf8');
  await fs.writeFile(afterPath, split.afterHtml, 'utf8');

  console.log(
    `Split homepage body: before ${split.beforeHtml.length} bytes, after ${split.afterHtml.length} bytes (removed legacy blog section)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
