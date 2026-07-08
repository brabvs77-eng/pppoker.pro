import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bodiesDir = path.join(rootDir, 'content/bodies');
const chromePath = path.join(rootDir, 'apps/web/src/config/elementor-chrome.json');

function divTagBalance(html) {
  return (html.match(/<div/gi) ?? []).length - (html.match(/<\/div>/gi) ?? []).length;
}

function verifySlottedBody(
  label,
  html,
  { legacyBlogSectionId, legacyBlogLoopElementId },
  violations,
) {
  if (!html.includes('id="native-home-blog-slot"')) {
    violations.push(`[${label}] Missing native-home-blog-slot in slotted homepage body`);
  }

  if (html.includes(`elementor-element-${legacyBlogSectionId}`)) {
    violations.push(`[${label}] Legacy blog container ${legacyBlogSectionId} still present`);
  }

  if (html.includes(`data-id="${legacyBlogLoopElementId}"`)) {
    violations.push(`[${label}] Legacy blog loop widget ${legacyBlogLoopElementId} still present`);
  }

  const balance = divTagBalance(html);
  if (balance !== 0) {
    violations.push(`[${label}] Unbalanced div tags in slotted homepage body: ${balance}`);
  }
}

async function main() {
  const chrome = JSON.parse(await fs.readFile(chromePath, 'utf8'));
  const defaultLegacySectionId = chrome.legacyBlogSectionIds[0];
  const defaultLegacyLoopId = chrome.legacyBlogSectionIds[1];
  const homeRoutes = chrome.homeBlogSlotRoutes ?? [{ fileId: '_root', route: '/' }];
  const reviewRoutes = new Set(
    (chrome.homeReviewSlotRoutes ?? []).map((entry) => entry.route),
  );
  const reviewsSectionId = chrome.legacyReviewsSectionElementId;
  const violations = [];

  for (const {
    fileId,
    route,
    legacyBlogSectionId,
    legacyBlogLoopElementId,
  } of homeRoutes) {
    const slotBodyPath = path.join(bodiesDir, `${fileId}-with-blog-slot.html`);
    let html;
    try {
      html = await fs.readFile(slotBodyPath, 'utf8');
    } catch {
      violations.push(`[${route}] Missing slotted body: ${fileId}-with-blog-slot.html`);
      continue;
    }

    verifySlottedBody(route, html, {
      legacyBlogSectionId: legacyBlogSectionId ?? defaultLegacySectionId,
      legacyBlogLoopElementId: legacyBlogLoopElementId ?? defaultLegacyLoopId,
    }, violations);

    if (reviewRoutes.has(route)) {
      if (!html.includes('id="native-review-snippets-slot"') && !html.includes('id="native-review-snippets"')) {
        violations.push(`[${route}] Missing native review snippets slot or section`);
      }
      if (reviewsSectionId && html.includes(`elementor-element-${reviewsSectionId}`)) {
        violations.push(`[${route}] Legacy reviews section ${reviewsSectionId} still present`);
      }
    }
  }

  if (violations.length) {
    console.error('Homepage DOM verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    `Verified slotted homepage body HTML for ${homeRoutes.map((entry) => entry.route).join(', ')}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
