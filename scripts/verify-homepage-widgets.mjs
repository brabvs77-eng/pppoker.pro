import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');

const HOME_PAGES = [
  { label: 'RU', outPath: 'index.html', minSwipers: 2, requireFaq: true, requireRuntime: true, minReviewCards: 6 },
  { label: 'EN', outPath: 'en/index.html', minSwipers: 2, requireFaq: true, requireRuntime: true, minReviewCards: 6 },
  { label: 'HY', outPath: 'hy/index.html', minSwipers: 2, requireFaq: true, requireRuntime: true, minReviewCards: 6 },
  { label: 'UZ', outPath: 'uz/index.html', minSwipers: 2, requireFaq: true, requireRuntime: true, minReviewCards: 6 },
  { label: 'KZ', outPath: 'kz/index.html', minSwipers: 2, requireFaq: true, requireRuntime: true, minReviewCards: 6 },
  { label: 'TJ', outPath: 'tj/index.html', minSwipers: 0, requireFaq: false, requireRuntime: false },
];

function verifyHomepageWidgets({ label, minSwipers, minReviewCards = 0, requireFaq, requireRuntime }, html, violations) {
  if (requireFaq && html.includes('href="#collapse-')) {
    violations.push(`[${label}] FAQ accordion still uses lowercase #collapse- href anchors`);
  }

  if (
    requireRuntime &&
    !html.includes('LegacyElementorBoot') &&
    !html.includes('elementorFrontend')
  ) {
    if (!html.includes('elementor-frontend-js')) {
      violations.push(`[${label}] Missing elementor-frontend-js on homepage`);
    }
  }

  const swiperCount = (html.match(/class="[^"]*elementor-main-swiper[^"]*"/g) ?? []).length;
  if (swiperCount < minSwipers) {
    violations.push(
      `[${label}] Expected at least ${minSwipers} elementor-main-swiper carousels, found ${swiperCount}`,
    );
  }

  if (minReviewCards > 0) {
    const reviewCount = (html.match(/class="review-snippets__card"/g) ?? []).length;
    if (reviewCount < minReviewCards) {
      violations.push(
        `[${label}] Expected at least ${minReviewCards} native review cards, found ${reviewCount}`,
      );
    }
    if (!html.includes('id="native-review-snippets"')) {
      violations.push(`[${label}] Missing native review snippets section`);
    }
  }

  if (!html.includes('elementor-location-popup')) {
    violations.push(`[${label}] Missing elementor-location-popup markup on homepage`);
  }
}

async function main() {
  const violations = [];
  const checked = [];

  for (const page of HOME_PAGES) {
    const filePath = path.join(outDir, page.outPath);
    let html;
    try {
      html = await fs.readFile(filePath, 'utf8');
    } catch {
      violations.push(`[${page.label}] Missing homepage output: ${page.outPath}`);
      continue;
    }

    verifyHomepageWidgets(page, html, violations);
    if (!violations.some((line) => line.startsWith(`[${page.label}]`))) {
      checked.push(page.label);
    }
  }

  if (violations.length) {
    console.error('Homepage widgets verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    `Verified homepage widget markup on ${checked.join(', ')} (FAQ, carousels, popups).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
