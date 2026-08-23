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
const cashGamesSlotHtml = '<div id="native-home-cash-games-slot"></div>';
const promoBlocksSlotHtml = '<div id="native-home-promo-blocks-slot"></div>';
const promoModalsSlotHtml = '<div id="native-home-promo-modals-slot"></div>';
const withdrawMethodsSlotHtml = '<div id="native-home-withdraw-methods-slot"></div>';

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

function stripDeadHomeMarkup(bodyHtml, { stripMasthead, widsterSectionId, duplicateCtaIds }) {
  let processed = bodyHtml;

  if (stripMasthead) {
    processed = stripLegacyMasthead(processed);
  }

  if (widsterSectionId) {
    processed = stripElementorSection(processed, widsterSectionId);
  }

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
  const whyNutsSectionId = chrome.legacyWhyNutsSectionElementId;
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
  const cashGamesRoutes = new Set(
    (chrome.homeCashGamesSlotRoutes ?? []).map((entry) => entry.route),
  );
  const withdrawMethodsRoutes = new Set(
    (chrome.homeWithdrawMethodsSlotRoutes ?? []).map((entry) => entry.route),
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
  const widsterByFileId = chrome.legacyWidsterSectionElementIdsByFileId ?? {};
  const duplicateCtaIds = chrome.homepageDuplicateCtaElementIds ?? [];

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

    if (cashGamesSectionId && cashGamesRoutes.has(route)) {
      processed = replaceElementorSectionWithSlot(processed, cashGamesSectionId, cashGamesSlotHtml);
    }

    if (whyNutsSectionId && withdrawMethodsRoutes.has(route)) {
      processed = insertSlotBeforeSection(processed, whyNutsSectionId, withdrawMethodsSlotHtml);
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
    if (promoEntry) {
      processed = stripElementorSection(
        replaceElementorSectionWithSlot(
          processed,
          promoEntry.legacyCrashPromoSectionElementId,
          promoBlocksSlotHtml,
        ),
        promoEntry.legacyRusPokerPromoSectionElementId,
      );
    }

    if (promoModalsRoutes.has(route)) {
      processed = appendPromoModalsSlotBeforeFooter(processed);
    }

    processed = stripDeadHomeMarkup(processed, {
      stripMasthead: stripMastheadRoutes.has(fileId),
      widsterSectionId:
        registrationRoutes.has(route) ? widsterByFileId[fileId] : undefined,
      duplicateCtaIds: registrationRoutes.has(route) ? duplicateCtaIds : [],
    });

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
      widsterSectionId: undefined,
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
