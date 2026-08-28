import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bodiesDir = path.join(rootDir, 'content/bodies');
const chromePath = path.join(rootDir, 'apps/web/src/config/elementor-chrome.json');
const slotHtml = '<div id="native-home-blog-slot"></div>';
const reviewSlotHtml = '<div id="native-review-snippets-slot"></div>';
const chipCalculatorSlotHtml = '<div id="native-chip-calculator-slot"></div>';
const faqSlotHtml = '<div id="native-home-faq-slot"></div>';
const registrationSlotHtml = '<div id="native-home-registration-slot"></div>';
const appDownloadSlotHtml = '<div id="native-home-app-download-slot"></div>';
const cashGamesSlotHtml = '<div id="native-home-cash-games-slot"></div>';
const promoBlocksSlotHtml = '<div id="native-home-promo-blocks-slot"></div>';
const promoModalsSlotHtml = '<div id="native-home-promo-modals-slot"></div>';
const withdrawMethodsSlotHtml = '<div id="native-home-withdraw-methods-slot"></div>';
const whyNutsSlotHtml = '<div id="native-home-why-nuts-slot"></div>';
const promoCardsSlotHtml = '<div id="native-home-promo-cards-slot"></div>';
const heroSlotHtml = '<div id="native-home-hero-slot"></div>';

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

function elementorContainerNeedle(elementId) {
  return `class="elementor-element elementor-element-${elementId}`;
}

function stripElementorSection(bodyHtml, elementId) {
  const classNeedle = elementorContainerNeedle(elementId);
  const classIndex = bodyHtml.indexOf(classNeedle);
  if (classIndex === -1) return bodyHtml;

  const divStart = bodyHtml.lastIndexOf('<div', classIndex);
  if (divStart === -1) return bodyHtml;

  const divEnd = findMatchingDivClose(bodyHtml, divStart);
  if (divEnd === -1) return bodyHtml;

  return `${bodyHtml.slice(0, divStart)}${bodyHtml.slice(divEnd)}`;
}

function insertSlotBeforeSection(bodyHtml, elementId, slotMarkup) {
  const classNeedle = elementorContainerNeedle(elementId);
  const classIndex = bodyHtml.indexOf(classNeedle);
  if (classIndex === -1) return bodyHtml;

  const divStart = bodyHtml.lastIndexOf('<div', classIndex);
  if (divStart === -1) return bodyHtml;

  return `${bodyHtml.slice(0, divStart)}${slotMarkup}${bodyHtml.slice(divStart)}`;
}

function replaceElementorSectionWithSlot(bodyHtml, elementId, slotMarkup) {
  const classNeedle = elementorContainerNeedle(elementId);
  const classIndex = bodyHtml.indexOf(classNeedle);
  if (classIndex === -1) return bodyHtml;

  const divStart = bodyHtml.lastIndexOf('<div', classIndex);
  if (divStart === -1) return bodyHtml;

  const divEnd = findMatchingDivClose(bodyHtml, divStart);
  if (divEnd === -1) return bodyHtml;

  return `${bodyHtml.slice(0, divStart)}${slotMarkup}${bodyHtml.slice(divEnd)}`;
}

function appendBlogSlotBeforeFooter(bodyHtml) {
  const colophonStart = bodyHtml.search(/<footer[^>]*\bid="colophon"/i);
  if (colophonStart === -1) return null;
  return `${bodyHtml.slice(0, colophonStart)}${slotHtml}${bodyHtml.slice(colophonStart)}`;
}

function ensureSlot(html, needles, slotMarkup, beforeNeedle) {
  const needleList = Array.isArray(needles) ? needles : [needles];
  if (needleList.some((needle) => html.includes(needle))) return html;

  const beforeIndex = html.indexOf(beforeNeedle);
  if (beforeIndex === -1) return html;

  return `${html.slice(0, beforeIndex)}${slotMarkup}${html.slice(beforeIndex)}`;
}

function appendPromoModalsSlotBeforeFooter(bodyHtml) {
  const colophonStart = bodyHtml.search(/<footer[^>]*\bid="colophon"/i);
  if (colophonStart !== -1) {
    return `${bodyHtml.slice(0, colophonStart)}${promoModalsSlotHtml}${bodyHtml.slice(colophonStart)}`;
  }
  return `${bodyHtml}${promoModalsSlotHtml}`;
}

function replaceLegacyBlogWithSlot(bodyHtml, legacySectionId) {
  const classNeedle = elementorContainerNeedle(legacySectionId);
  if (!bodyHtml.includes(classNeedle)) return null;
  return replaceElementorSectionWithSlot(bodyHtml, legacySectionId, slotHtml);
}

function divTagBalance(html) {
  return (html.match(/<div/gi) ?? []).length - (html.match(/<\/div>/gi) ?? []).length;
}

function stripLegacyFooter(bodyHtml) {
  const colophonStart = bodyHtml.search(/<footer[^>]*\bid="colophon"/i);
  if (colophonStart === -1) return bodyHtml;

  const footerEnd = bodyHtml.indexOf('</footer>', colophonStart);
  if (footerEnd === -1) return bodyHtml;

  return `${bodyHtml.slice(0, colophonStart)}${bodyHtml.slice(footerEnd + '</footer>'.length)}`;
}

function stripLegacyMasthead(bodyHtml) {
  const mastheadStart = bodyHtml.search(/<header[^>]*\bid="masthead"/i);
  if (mastheadStart === -1) return bodyHtml;

  const headerEnd = bodyHtml.indexOf('</header>', mastheadStart);
  if (headerEnd === -1) return bodyHtml;

  return `${bodyHtml.slice(0, mastheadStart)}${bodyHtml.slice(headerEnd + '</header>'.length)}`;
}

const WIDSTER_MOUNT_ID = 'widster-4bb2def655b84202f7ff7cb928f06ce6079db77538f28084840b145afb0f1daa';
const WIDSTER_MOUNT_HTML = `<div id="${WIDSTER_MOUNT_ID}"></div>`;

function ensureWidsterMount(bodyHtml) {
  if (bodyHtml.includes(`id="${WIDSTER_MOUNT_ID}"`) || bodyHtml.includes('id="widster-')) {
    return bodyHtml;
  }

  const footerIdx = bodyHtml.indexOf('id="colophon"');
  if (footerIdx !== -1) {
    const sectionStart = bodyHtml.lastIndexOf('<', footerIdx);
    if (sectionStart !== -1) {
      return `${bodyHtml.slice(0, sectionStart)}${WIDSTER_MOUNT_HTML}\n${bodyHtml.slice(sectionStart)}`;
    }
  }

  return `${bodyHtml}\n${WIDSTER_MOUNT_HTML}`;
}

function stripDeadHomeMarkup(bodyHtml, { stripMasthead, duplicateCtaIds }) {
  let processed = bodyHtml;

  if (stripMasthead) {
    processed = stripLegacyMasthead(processed);
  }

  // Widster mount stays in the body; native home shells load its script via WidsterEmbed.

  for (const elementId of duplicateCtaIds ?? []) {
    processed = stripElementorSection(processed, elementId);
  }

  return processed;
}

async function main() {
  const chrome = JSON.parse(await fs.readFile(chromePath, 'utf8'));
  const defaultLegacySectionId = chrome.legacyBlogSectionIds[0];
  const reviewsSectionId = chrome.legacyReviewsSectionElementId;
  const faqSectionId = chrome.legacyFaqSectionElementId;
  const registrationDesktopSectionId = chrome.legacyRegistrationDesktopSectionElementId;
  const registrationMobileSectionId = chrome.legacyRegistrationMobileSectionElementId;
  const cashGamesSectionId = chrome.legacyCashGamesSectionElementId;
  const appDownloadSectionId = chrome.legacyAppDownloadSectionElementId;
  const whyNutsSectionId = chrome.legacyWhyNutsSectionElementId;
  const promoCardsSectionId = chrome.legacyPromoCardsSectionElementId;
  const heroSectionId = chrome.homepageHeroRootElementId;
  const homeRoutes = chrome.homeBlogSlotRoutes ?? [{ fileId: '_root', route: '/' }];
  const reviewRoutes = new Set(
    (chrome.homeReviewSlotRoutes ?? []).map((entry) => entry.route),
  );
  const chipCalculatorRoutes = new Set(
    (chrome.homeChipCalculatorSlotRoutes ?? []).map((entry) => entry.route),
  );
  const faqRoutes = new Set(
    (chrome.homeFaqSlotRoutes ?? []).map((entry) => entry.route),
  );
  const registrationRoutes = new Set(
    (chrome.homeRegistrationSlotRoutes ?? []).map((entry) => entry.route),
  );
  const appDownloadRoutes = new Set(
    (chrome.homeAppDownloadSlotRoutes ?? []).map((entry) => entry.route),
  );
  const cashGamesRoutes = new Set(
    (chrome.homeCashGamesSlotRoutes ?? []).map((entry) => entry.route),
  );
  const withdrawMethodsRoutes = new Set(
    (chrome.homeWithdrawMethodsSlotRoutes ?? []).map((entry) => entry.route),
  );
  const whyNutsRoutes = new Set(
    (chrome.homeWhyNutsSlotRoutes ?? []).map((entry) => entry.route),
  );
  const promoCardsRoutes = new Set(
    (chrome.homePromoCardsSlotRoutes ?? []).map((entry) => entry.route),
  );
  const heroRoutes = new Set(
    (chrome.homeHeroSlotRoutes ?? []).map((entry) => entry.route),
  );
  const promoBlocksByRoute = new Map(
    (chrome.homePromoBlocksSlotRoutes ?? []).map((entry) => [entry.route, entry]),
  );
  const promoModalsRoutes = new Set(
    (chrome.homePromoModalsSlotRoutes ?? []).map((entry) => entry.route),
  );
  const stripFooterRoutes = new Set(
    (chrome.stripLegacyFooterRoutes ?? []).map((entry) => entry.fileId),
  );
  const stripMastheadRoutes = new Set(
    (chrome.stripLegacyMastheadRoutes ?? []).map((entry) => entry.fileId),
  );
  const duplicateCtaIds = chrome.homepageDuplicateCtaElementIds ?? [];
  const appendNativeSlotsRoutes = new Set(
    homeRoutes.filter((entry) => entry.appendNativeSlotsWhenMissing).map((entry) => entry.route),
  );

  for (const { fileId, route, legacyBlogSectionId, appendBlogSlotWhenMissing } of homeRoutes) {
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

    let withSlot = replaceLegacyBlogWithSlot(bodyHtml, legacySectionId);
    if (!withSlot && appendBlogSlotWhenMissing) {
      withSlot = appendBlogSlotBeforeFooter(bodyHtml);
      if (withSlot) {
        console.log(`Appended blog slot on ${route} (no legacy blog section)`);
      }
    }
    if (!withSlot) {
      console.error(`Failed to insert blog slot on ${route}`);
      process.exitCode = 1;
      continue;
    }

    let processed = withSlot;

    if (heroSectionId && heroRoutes.has(route)) {
      processed = replaceElementorSectionWithSlot(processed, heroSectionId, heroSlotHtml);
    }

    if (registrationDesktopSectionId && registrationRoutes.has(route)) {
      processed = replaceElementorSectionWithSlot(
        processed,
        registrationDesktopSectionId,
        registrationSlotHtml,
      );
    }

    if (registrationMobileSectionId && registrationRoutes.has(route)) {
      processed = stripElementorSection(processed, registrationMobileSectionId);
    }

    if (appDownloadSectionId && appDownloadRoutes.has(route)) {
      processed = replaceElementorSectionWithSlot(processed, appDownloadSectionId, appDownloadSlotHtml);
    }

    if (cashGamesSectionId && cashGamesRoutes.has(route)) {
      processed = replaceElementorSectionWithSlot(processed, cashGamesSectionId, cashGamesSlotHtml);
    }

    if (whyNutsSectionId && withdrawMethodsRoutes.has(route)) {
      processed = insertSlotBeforeSection(processed, whyNutsSectionId, withdrawMethodsSlotHtml);
    }

    if (whyNutsSectionId && whyNutsRoutes.has(route)) {
      processed = replaceElementorSectionWithSlot(processed, whyNutsSectionId, whyNutsSlotHtml);
    }

    if (promoCardsSectionId && promoCardsRoutes.has(route)) {
      processed = replaceElementorSectionWithSlot(processed, promoCardsSectionId, promoCardsSlotHtml);
    }

    if (reviewsSectionId && chipCalculatorRoutes.has(route)) {
      processed = insertSlotBeforeSection(processed, reviewsSectionId, chipCalculatorSlotHtml);
    }

    if (reviewsSectionId && reviewRoutes.has(route)) {
      processed = replaceElementorSectionWithSlot(processed, reviewsSectionId, reviewSlotHtml);
    }

    if (faqSectionId && faqRoutes.has(route)) {
      processed = replaceElementorSectionWithSlot(processed, faqSectionId, faqSlotHtml);
    }

    if (registrationRoutes.has(route)) {
      for (const spacerId of chrome.legacyEmptySpacerElementIds ?? []) {
        processed = stripElementorSection(processed, spacerId);
      }
    }

    const promoEntry = promoBlocksByRoute.get(route);
    if (promoEntry?.legacyCrashPromoSectionElementId) {
      processed = stripElementorSection(
        replaceElementorSectionWithSlot(
          processed,
          promoEntry.legacyCrashPromoSectionElementId,
          promoBlocksSlotHtml,
        ),
        promoEntry.legacyRusPokerPromoSectionElementId,
      );
    }

    // When the legacy Elementor section IDs above are absent from the body
    // (e.g. TJ, whose export uses its own distinct Elementor element IDs),
    // the replace* helpers are no-ops and the slots never land in the body.
    // Append the missing slots before the blog slot instead, preserving the
    // hero → app-download → registration → cash-games → withdraw-methods →
    // why-nuts → promo-cards → promo-blocks → chip-calculator → reviews →
    // faq → blog top-to-bottom order (app-download must precede registration;
    // see verify-homepage-dom.mjs).
    if (appendNativeSlotsRoutes.has(route)) {
      const blogSlotNeedle = '<div id="native-home-blog-slot"';

      if (heroSectionId && heroRoutes.has(route)) {
        processed = ensureSlot(
          processed,
          ['native-home-hero-slot', 'id="native-home-hero"'],
          heroSlotHtml,
          blogSlotNeedle,
        );
      }
      if (appDownloadRoutes.has(route)) {
        processed = ensureSlot(
          processed,
          ['native-home-app-download-slot', 'id="native-home-app-download"'],
          appDownloadSlotHtml,
          blogSlotNeedle,
        );
      }
      if (registrationRoutes.has(route)) {
        processed = ensureSlot(
          processed,
          ['native-home-registration-slot', 'id="native-home-registration"'],
          registrationSlotHtml,
          blogSlotNeedle,
        );
      }
      if (cashGamesRoutes.has(route)) {
        processed = ensureSlot(
          processed,
          ['native-home-cash-games-slot', 'id="native-home-cash-games"'],
          cashGamesSlotHtml,
          blogSlotNeedle,
        );
      }
      if (withdrawMethodsRoutes.has(route)) {
        processed = ensureSlot(
          processed,
          ['native-home-withdraw-methods-slot', 'id="native-home-withdraw-methods"'],
          withdrawMethodsSlotHtml,
          blogSlotNeedle,
        );
      }
      if (whyNutsRoutes.has(route)) {
        processed = ensureSlot(
          processed,
          ['native-home-why-nuts-slot', 'id="native-home-why-nuts"'],
          whyNutsSlotHtml,
          blogSlotNeedle,
        );
      }
      if (promoCardsRoutes.has(route)) {
        processed = ensureSlot(
          processed,
          ['native-home-promo-cards-slot', 'id="native-home-promo-cards"'],
          promoCardsSlotHtml,
          blogSlotNeedle,
        );
      }
      if (promoEntry) {
        processed = ensureSlot(
          processed,
          ['native-home-promo-blocks-slot', 'id="native-home-promo-blocks"'],
          promoBlocksSlotHtml,
          blogSlotNeedle,
        );
      }
      if (chipCalculatorRoutes.has(route)) {
        processed = ensureSlot(
          processed,
          ['native-chip-calculator-slot', 'id="native-chip-calculator"'],
          chipCalculatorSlotHtml,
          blogSlotNeedle,
        );
      }
      if (reviewRoutes.has(route)) {
        processed = ensureSlot(
          processed,
          ['native-review-snippets-slot', 'id="native-review-snippets"'],
          reviewSlotHtml,
          blogSlotNeedle,
        );
      }
      if (faqRoutes.has(route)) {
        processed = ensureSlot(
          processed,
          ['native-home-faq-slot', 'id="native-home-faq"'],
          faqSlotHtml,
          blogSlotNeedle,
        );
      }
    }

    if (promoModalsRoutes.has(route)) {
      processed = appendPromoModalsSlotBeforeFooter(processed);
    }

    processed = stripDeadHomeMarkup(processed, {
      stripMasthead: stripMastheadRoutes.has(fileId),
      duplicateCtaIds: registrationRoutes.has(route) ? duplicateCtaIds : [],
    });
    processed = ensureWidsterMount(processed);

    const withoutLegacyFooter = stripFooterRoutes.has(fileId)
      ? stripLegacyFooter(processed)
      : processed;

    const balance = divTagBalance(withoutLegacyFooter);
    if (balance !== 0) {
      console.error(`Homepage body for ${route} has unbalanced div tags: ${balance}`);
      process.exitCode = 1;
      continue;
    }

    await fs.writeFile(outputPath, withoutLegacyFooter, 'utf8');
    console.log(`Prepared ${route} body with blog slot (${withoutLegacyFooter.length} bytes)`);
  }

  const homeFileIds = new Set(homeRoutes.map((entry) => entry.fileId));
  for (const { fileId, route } of chrome.stripLegacyFooterRoutes ?? []) {
    if (homeFileIds.has(fileId)) continue;

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

    let processed = stripDeadHomeMarkup(bodyHtml, {
      stripMasthead: stripMastheadRoutes.has(fileId),
      duplicateCtaIds: [],
    });

    const withoutLegacyFooter = stripLegacyFooter(processed);
    if (withoutLegacyFooter === processed) {
      console.warn(`No #colophon footer to strip on ${route}`);
    }

    await fs.writeFile(outputPath, withoutLegacyFooter, 'utf8');
    console.log(`Prepared ${route} body without legacy footer (${withoutLegacyFooter.length} bytes)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
