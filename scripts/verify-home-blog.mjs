import { readFileSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generatedDir = path.join(rootDir, 'apps/web/src/generated');

const homepages = [
  {
    label: 'RU',
    path: path.join(rootDir, 'apps/web/out/index.html'),
    footerMarker: 'id="colophon"',
    extraMarkers: ['instagram.com'],
    locale: 'ru',
  },
  {
    label: 'HY',
    path: path.join(rootDir, 'apps/web/out/hy/index.html'),
    footerMarker: 'class="site-footer"',
    extraMarkers: [],
    locale: 'ru',
  },
  {
    label: 'EN',
    path: path.join(rootDir, 'apps/web/out/en/index.html'),
    footerMarker: 'class="site-footer"',
    extraMarkers: [],
    locale: 'en',
    legacyBlogLoopElementId: '97d6258',
  },
];

function expectedCardCount(locale) {
  const fileName = locale === 'en' ? 'enHomeBlogPosts.json' : 'ruHomeBlogPosts.json';
  try {
    const posts = JSON.parse(
      readFileSync(path.join(generatedDir, fileName), 'utf8'),
    );
    return Math.min(6, posts.length);
  } catch {
    return 6;
  }
}

function verifyHomeBlogHtml(
  { label, footerMarker, extraMarkers, legacyBlogLoopElementId = '39eeae8' },
  html,
  expectedCards,
  violations,
) {
  if (!html.includes('data-hide-legacy-blog')) {
    violations.push(`[${label}] Missing data-hide-legacy-blog on homepage`);
  }

  if (!html.includes('id="native-home-blog-slot"')) {
    violations.push(`[${label}] Missing #native-home-blog-slot mount on homepage`);
  }

  if (!html.includes('class="home-blog"')) {
    violations.push(`[${label}] Missing native home-blog section`);
  }

  const homeBlogSections = html.match(/<section class="home-blog"/g) ?? [];
  if (homeBlogSections.length !== 1) {
    violations.push(
      `[${label}] Expected exactly 1 home-blog section, found ${homeBlogSections.length}`,
    );
  }

  const cardCount = (html.match(/<article class="home-blog__card"/g) ?? []).length;
  if (cardCount !== expectedCards) {
    violations.push(
      `[${label}] Expected exactly ${expectedCards} home-blog cards, found ${cardCount}`,
    );
  }

  if (html.includes(`data-id="${legacyBlogLoopElementId}"`)) {
    violations.push(
      `[${label}] Legacy Elementor blog loop widget (${legacyBlogLoopElementId}) still in homepage HTML`,
    );
  }

  const slotIndex = html.indexOf('id="native-home-blog-slot"');
  const homeBlogIndex = html.indexOf('class="home-blog"');
  const footerIndex = html.indexOf(footerMarker);

  if (slotIndex === -1 || homeBlogIndex === -1 || homeBlogIndex < slotIndex) {
    violations.push(`[${label}] home-blog is not inside #native-home-blog-slot`);
  }

  if (homeBlogIndex !== -1 && footerIndex !== -1 && homeBlogIndex > footerIndex) {
    violations.push(`[${label}] home-blog section renders after footer`);
  }

  const markers = [footerMarker, 'class="site-footer"', ...extraMarkers];
  for (const marker of markers) {
    if (!html.includes(marker)) {
      violations.push(`[${label}] Missing expected homepage marker: ${marker}`);
    }
  }

  return cardCount;
}

async function main() {
  const violations = [];
  const summaries = [];

  for (const homepage of homepages) {
    let html;
    try {
      html = await fs.readFile(homepage.path, 'utf8');
    } catch {
      violations.push(`[${homepage.label}] Missing homepage output: ${homepage.path}`);
      continue;
    }

    const expectedCards = expectedCardCount(homepage.locale);
    const cardCount = verifyHomeBlogHtml(homepage, html, expectedCards, violations);
    if (!violations.some((line) => line.startsWith(`[${homepage.label}]`))) {
      summaries.push(`${homepage.label}: ${cardCount} cards`);
    }
  }

  if (violations.length) {
    console.error('Home blog verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    `Verified native home blog on ${summaries.join(', ')} (inside slot, before footer).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
