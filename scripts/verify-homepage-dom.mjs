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
  const faqRoutes = new Set(
    (chrome.homeFaqSlotRoutes ?? []).map((entry) => entry.route),
  );
  const cashGamesRoutes = new Set(
    (chrome.homeCashGamesSlotRoutes ?? []).map((entry) => entry.route),
  );
  const promoBlocksRoutes = new Set(
    (chrome.homePromoBlocksSlotRoutes ?? []).map((entry) => entry.route),
  );
  const promoModalsRoutes = new Set(
    (chrome.homePromoModalsSlotRoutes ?? []).map((entry) => entry.route),
  );
  const heroRoutes = new Set(
    (chrome.homeHeroSlotRoutes ?? []).map((entry) => entry.route),
  );
  const registrationRoutes = new Set(
    (chrome.homeRegistrationSlotRoutes ?? []).map((entry) => entry.route),
  );
  const stripMastheadRoutes = new Set(
    (chrome.stripLegacyMastheadRoutes ?? []).map((entry) => entry.fileId),
  );
  const widsterByFileId = chrome.legacyWidsterSectionElementIdsByFileId ?? {};
  const duplicateCtaIds = chrome.homepageDuplicateCtaElementIds ?? [];
  const reviewsSectionId = chrome.legacyReviewsSectionElementId;
  const faqSectionId = chrome.legacyFaqSectionElementId;
  const registrationDesktopSectionId = chrome.legacyRegistrationDesktopSectionElementId;
  const registrationMobileSectionId = chrome.legacyRegistrationMobileSectionElementId;
  const cashGamesSectionId = chrome.legacyCashGamesSectionElementId;
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

    if (faqRoutes.has(route)) {
      if (!html.includes('id="native-home-faq-slot"') && !html.includes('id="native-home-faq"')) {
        violations.push(`[${route}] Missing native FAQ slot or section`);
      }
      if (faqSectionId && html.includes(`class="elementor-element elementor-element-${faqSectionId}`)) {
        violations.push(`[${route}] Legacy FAQ section ${faqSectionId} still present`);
      }
    }

    if (registrationRoutes.has(route)) {
      if (!html.includes('id="native-home-registration-slot"') && !html.includes('id="native-home-registration"')) {
        violations.push(`[${route}] Missing native registration slot or section`);
      }
      if (registrationDesktopSectionId && html.includes(`class="elementor-element elementor-element-${registrationDesktopSectionId}`)) {
        violations.push(`[${route}] Legacy registration desktop section ${registrationDesktopSectionId} still present`);
      }
      if (registrationMobileSectionId && html.includes(`class="elementor-element elementor-element-${registrationMobileSectionId}`)) {
        violations.push(`[${route}] Legacy registration mobile section ${registrationMobileSectionId} still present`);
      }
    }

    if (cashGamesRoutes.has(route)) {
      if (!html.includes('id="native-home-cash-games-slot"') && !html.includes('id="native-home-cash-games"')) {
        violations.push(`[${route}] Missing native cash games slot or section`);
      }
      if (cashGamesSectionId && html.includes(`class="elementor-element elementor-element-${cashGamesSectionId}`)) {
        violations.push(`[${route}] Legacy cash games section ${cashGamesSectionId} still present`);
      }
    }

    if (registrationRoutes.has(route)) {
      for (const spacerId of chrome.legacyEmptySpacerElementIds ?? []) {
        if (html.includes(`class="elementor-element elementor-element-${spacerId}`)) {
          violations.push(`[${route}] Legacy empty spacer ${spacerId} still present`);
        }
      }
    }

    if (promoBlocksRoutes.has(route)) {
      if (!html.includes('id="native-home-promo-blocks-slot"') && !html.includes('id="native-home-promo-blocks"')) {
        violations.push(`[${route}] Missing native promo blocks slot or section`);
      }
      const promoEntry = (chrome.homePromoBlocksSlotRoutes ?? []).find((entry) => entry.route === route);
      if (promoEntry?.legacyCrashPromoSectionElementId && html.includes(`class="elementor-element elementor-element-${promoEntry.legacyCrashPromoSectionElementId}`)) {
        violations.push(`[${route}] Legacy CRASH promo section ${promoEntry.legacyCrashPromoSectionElementId} still present`);
      }
      if (promoEntry?.legacyRusPokerPromoSectionElementId && html.includes(`class="elementor-element elementor-element-${promoEntry.legacyRusPokerPromoSectionElementId}`)) {
        violations.push(`[${route}] Legacy Russian Poker promo section ${promoEntry.legacyRusPokerPromoSectionElementId} still present`);
      }
    }

    if (promoModalsRoutes.has(route)) {
      if (!html.includes('id="native-home-promo-modals-slot"') && !html.includes('id="native-home-promo-modals"')) {
        violations.push(`[${route}] Missing native promo modals slot or section`);
      }
    }

    if (heroRoutes.has(route)) {
      if (!html.includes('id="native-home-hero-slot"') && !html.includes('id="native-home-hero"')) {
        violations.push(`[${route}] Missing native hero slot or section`);
      }
      if (chrome.homepageHeroRootElementId && html.includes(`class="elementor-element elementor-element-${chrome.homepageHeroRootElementId}`)) {
        violations.push(`[${route}] Legacy hero section ${chrome.homepageHeroRootElementId} still present`);
      }
    }

    if (stripMastheadRoutes.has(fileId) && html.includes('id="masthead"')) {
      violations.push(`[${route}] Legacy #masthead still present in slotted body`);
    }

    if (registrationRoutes.has(route)) {
      const widsterId = widsterByFileId[fileId];
      if (widsterId && html.includes(`class="elementor-element elementor-element-${widsterId}`)) {
        violations.push(`[${route}] Legacy Widster section ${widsterId} still present`);
      }
      for (const ctaId of duplicateCtaIds) {
        if (html.includes(`class="elementor-element elementor-element-${ctaId}`)) {
          violations.push(`[${route}] Duplicate hero CTA ${ctaId} still present`);
        }
      }
      if (html.includes('id="widster-')) {
        violations.push(`[${route}] Widster embed still present`);
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
