import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');

const HOME_PAGES = [
  { label: 'RU', outPath: 'index.html', minSwipers: 0, requireFaq: true, requireRegistration: true, requireCashGames: true, requirePromoModals: true, requireRuntime: false, minReviewCards: 6 },
  { label: 'EN', outPath: 'en/index.html', minSwipers: 0, requireFaq: true, requireRegistration: true, requireCashGames: true, requirePromoModals: true, requireRuntime: false, minReviewCards: 6 },
  { label: 'HY', outPath: 'hy/index.html', minSwipers: 0, requireFaq: true, requireRegistration: true, requireCashGames: true, requirePromoModals: true, requireRuntime: false, minReviewCards: 6 },
  { label: 'UZ', outPath: 'uz/index.html', minSwipers: 0, requireFaq: true, requireRegistration: true, requireCashGames: true, requirePromoModals: true, requireRuntime: false, minReviewCards: 6 },
  { label: 'KZ', outPath: 'kz/index.html', minSwipers: 0, requireFaq: true, requireRegistration: true, requireCashGames: true, requirePromoModals: true, requireRuntime: false, minReviewCards: 6 },
  { label: 'TJ', outPath: 'tj/index.html', minSwipers: 0, requireFaq: false, requireRegistration: false, requireCashGames: false, requirePromoModals: false, requireRuntime: false },
];

function verifyHomepageWidgets(
  { label, minSwipers, minReviewCards = 0, requireFaq, requireRegistration, requireCashGames, requirePromoModals, requireRuntime },
  html,
  violations,
) {
  if (requireFaq) {
    if (html.includes('href="#collapse-')) {
      violations.push(`[${label}] FAQ accordion still uses lowercase #collapse- href anchors`);
    }
    if (html.includes('class="elementskit-accordion"') || html.includes('elementor-widget-elementskit-accordion')) {
      violations.push(`[${label}] Legacy elementskit-accordion markup still present`);
    }
    if (!html.includes('id="native-home-faq"')) {
      violations.push(`[${label}] Missing native home FAQ section`);
    }
    if (!html.includes('class="home-faq__item"')) {
      violations.push(`[${label}] Missing native FAQ accordion items`);
    }
  }

  if (requireRegistration) {
    if (html.includes('class="elementor-main-swiper"')) {
      violations.push(`[${label}] Legacy elementor-main-swiper carousel still present`);
    }
    if (!html.includes('id="native-home-registration"')) {
      violations.push(`[${label}] Missing native home registration section`);
    }
    if (!html.includes('class="home-reg__slide"')) {
      violations.push(`[${label}] Missing native registration slides`);
    }
  }

  if (requireCashGames) {
    if (html.includes('class="elementor-element elementor-element-79d6e08')) {
      violations.push(`[${label}] Legacy cash games section still present`);
    }
    if (!html.includes('id="native-home-cash-games"')) {
      violations.push(`[${label}] Missing native home cash games section`);
    }
    if (!html.includes('<article class="home-cash__card')) {
      violations.push(`[${label}] Missing native cash game cards`);
    }
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

  if (!requireRuntime && html.includes('elementor-frontend-js')) {
    violations.push(`[${label}] Elementor runtime should not load on native home shell`);
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

  if (requirePromoModals) {
    if (!html.includes('id="native-home-promo-modals"')) {
      violations.push(`[${label}] Missing native promo modals section`);
    }
    if (html.includes('elementor-location-popup')) {
      violations.push(`[${label}] Legacy Elementor popup markup still present`);
    }
    if (html.includes('data-elementor-type="popup"')) {
      violations.push(`[${label}] Legacy Elementor popup containers still present`);
    }
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
    `Verified homepage widget markup on ${checked.join(', ')} (FAQ, registration, cash games, promo modals).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
