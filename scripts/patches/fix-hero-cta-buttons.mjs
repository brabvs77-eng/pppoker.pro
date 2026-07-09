/**
 * Codemod: replaces the promo bar under the header ("Онлайн-покер на деньги
 * в PPPoker" + 3 buttons) with nothing, and inserts 2 large animated CTA
 * buttons (Telegram + WhatsApp) into the hero section instead.
 *
 * Matched by visible text for the promo bar (when present in legacy HTML) and
 * by element `elementor-element-eb760f3` for button insertion.
 *
 * Usage:
 *   node scripts/patches/fix-hero-cta-buttons.mjs           # dry run
 *   node scripts/patches/fix-hero-cta-buttons.mjs --write   # applies
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import { load } from 'cheerio';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WRITE = process.argv.includes('--write');

const PROMO_BAR_TEXT = 'Онлайн-покер на деньги в PPPoker';
const HERO_ANCHOR_CLASS = 'elementor-element-eb760f3';
const OLD_HOTSPOT_CLASS = 'elementor-element-d014ade';

const TELEGRAM_URL = 'https://t.me/NUTSsup';
const WHATSAPP_URL = 'https://wa.clck.bar/995592934850';

const LOCALE_BUTTONS = {
  ru: { telegram: 'Написать в Telegram', whatsapp: 'Написать в WhatsApp' },
  en: { telegram: 'Message on Telegram', whatsapp: 'Message on WhatsApp' },
  uz: { telegram: 'Telegramga yozish', whatsapp: 'WhatsAppga yozish' },
  kz: { telegram: 'Telegram-ға жазу', whatsapp: 'WhatsApp-қа жазу' },
  hy: { telegram: 'Գրել Telegram-ում', whatsapp: 'Գրել WhatsApp-ում' },
  tj: { telegram: 'Дар Telegram навиштан', whatsapp: 'Дар WhatsApp навиштан' },
};

const STYLE_ID = 'hero-cta-buttons-fix';
const STYLE_BLOCK = `
<style id="${STYLE_ID}">
  @keyframes hero-cta-float { from { transform: translateY(0); } to { transform: translateY(-6px); } }
  @keyframes hero-cta-pulse-tg {
    0%, 100% { box-shadow: 0 0 0 0 rgba(41,182,246,0.5), 0 14px 30px rgba(0,0,0,0.35); }
    50% { box-shadow: 0 0 0 10px rgba(41,182,246,0), 0 14px 30px rgba(0,0,0,0.35); }
  }
  @keyframes hero-cta-pulse-wa {
    0%, 100% { box-shadow: 0 0 0 0 rgba(97,206,112,0.5), 0 14px 30px rgba(0,0,0,0.35); }
    50% { box-shadow: 0 0 0 10px rgba(97,206,112,0), 0 14px 30px rgba(0,0,0,0.35); }
  }
  .hero-cta-group { display: flex; gap: 18px; flex-wrap: wrap; margin: 28px 0; }
  .hero-cta-btn {
    display: flex; align-items: center; gap: 12px; text-decoration: none;
    padding: 16px 26px; border-radius: 16px; font: 700 17px/1.2 system-ui, sans-serif;
    animation: hero-cta-float 2.6s ease-in-out infinite alternate;
    transition: transform 0.2s ease;
  }
  .hero-cta-btn:hover { transform: translateY(-8px) scale(1.03); }
  .hero-cta-btn--telegram { background: #29b6f6; color: #0a0d14; animation-name: hero-cta-float, hero-cta-pulse-tg; animation-duration: 2.6s, 2.4s; }
  .hero-cta-btn--whatsapp { background: #61ce70; color: #0a0d14; animation-name: hero-cta-float, hero-cta-pulse-wa; animation-duration: 2.6s, 2.4s; animation-delay: 0.3s, 0s; }
  .hero-cta-icon { width: 26px; height: 26px; flex-shrink: 0; }

  @media (max-width: 640px) {
    .hero-cta-group { flex-direction: column; gap: 12px; }
    .hero-cta-btn { justify-content: center; width: 100%; padding: 15px 20px; font-size: 15.5px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .hero-cta-btn { animation: none !important; }
  }
</style>`;

const TELEGRAM_ICON =
  '<svg class="hero-cta-icon" viewBox="0 0 24 24" fill="none"><path d="M21.5 3.5L2.7 10.7c-1.2.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.5.8 1 .8s.7-.2 1-.5l2.4-2.3 4.8 3.6c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.4-1.9-1.6-1.5z" fill="#0a0d14"/></svg>';
const WHATSAPP_ICON =
  '<svg class="hero-cta-icon" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.4A10 10 0 1012 2z" fill="#0a0d14"/><path d="M8.5 7.5c.3-.6.6-.6.9-.6h.7c.2 0 .5 0 .7.6.3.7 1 2.2 1 2.4 0 .2 0 .4-.2.6l-.6.7c-.2.2-.4.4-.2.8.2.4 1 1.6 2.1 2.6 1.4 1.2 2 1.4 2.4 1.2.4-.2.6-.6.9-1 .3-.4.6-.3 1-.2.4.2 2.3 1.1 2.7 1.3.4.2.6.3.7.5.1.2.1 1.1-.3 2.1-.4 1-2.3 1.9-3.2 2-.9.1-1 .8-6.1-1.5-5-2.3-6.5-8-6.6-8.4-.1-.4-1-1.4-1-2.7 0-1.3.7-2 1-2.2.3-.3.6-.4.9-.4h.6c.2 0 .4 0 .6.5z" fill="#61ce70"/></svg>';

function localeFromPath(relativePath) {
  const firstSegment = relativePath.split('/')[0];
  if (firstSegment === 'index.html') return 'ru';
  if (Object.hasOwn(LOCALE_BUTTONS, firstSegment)) return firstSegment;
  return 'ru';
}

function buttonsHtml(locale) {
  const labels = LOCALE_BUTTONS[locale] ?? LOCALE_BUTTONS.ru;
  return `
<div class="hero-cta-group">
  <a href="${TELEGRAM_URL}" target="_blank" rel="noopener" class="hero-cta-btn hero-cta-btn--telegram">
    ${TELEGRAM_ICON}
    ${labels.telegram}
  </a>
  <a href="${WHATSAPP_URL}" target="_blank" rel="noopener" class="hero-cta-btn hero-cta-btn--whatsapp">
    ${WHATSAPP_ICON}
    ${labels.whatsapp}
  </a>
</div>`;
}

async function findLegacyHtmlFiles() {
  return glob('**/index.html', {
    cwd: rootDir,
    nodir: true,
    ignore: ['node_modules/**', 'apps/web/**', 'assets/**', 'content/**'],
  });
}

/** Find the promo bar by exact visible text, then walk up to a removable container. */
function removePromoBar($, notes) {
  let target = null;
  $('h1,h2,h3,h4,span,div').each((_, el) => {
    if (target) return;
    const own = $(el).clone().children().remove().end().text().trim();
    if (own === PROMO_BAR_TEXT) target = $(el);
  });
  if (!target) {
    notes.push(`Promo bar text "${PROMO_BAR_TEXT}" not found in this file — nothing to remove here.`);
    return false;
  }

  let container = target;
  for (let i = 0; i < 6; i += 1) {
    const parent = container.parent();
    if (!parent.length) break;
    container = parent;
    const cls = container.attr('class') || '';
    if (/\be-con\b|\belementor-section\b/.test(cls)) break;
  }

  container.remove();
  notes.push(`Removed promo bar container (matched by text "${PROMO_BAR_TEXT}").`);
  return true;
}

function insertHeroButtons($, locale, notes) {
  const anchor = $(`.${HERO_ANCHOR_CLASS}`).first();
  if (!anchor.length) {
    notes.push(`Hero anchor .${HERO_ANCHOR_CLASS} not found — buttons not inserted in this file.`);
    return false;
  }
  if ($(`#${STYLE_ID}`).length || anchor.nextAll('.hero-cta-group').first().length) return false;

  anchor.after(buttonsHtml(locale));
  anchor.before(STYLE_BLOCK);

  const oldHotspot = $(`.${OLD_HOTSPOT_CLASS}`);
  if (oldHotspot.length) {
    oldHotspot.attr('style', `${oldHotspot.attr('style') || ''};display:none;`);
    notes.push(`Hid the old single Telegram hotspot (.${OLD_HOTSPOT_CLASS}) — left in DOM, not deleted.`);
  }

  return true;
}

function dedupeExistingPatch($) {
  let changed = false;
  const styles = $(`style#${STYLE_ID}`);
  if (styles.length > 1) {
    styles.slice(1).remove();
    changed = true;
  }
  const groups = $('.hero-cta-group');
  if (groups.length > 1) {
    groups.slice(1).remove();
    changed = true;
  }
  return changed;
}

async function main() {
  const files = await findLegacyHtmlFiles();
  const report = [];

  for (const relativePath of files) {
    const fullPath = path.join(rootDir, relativePath);
    const original = await fs.readFile(fullPath, 'utf8');
    if (!original.includes(PROMO_BAR_TEXT) && !original.includes(HERO_ANCHOR_CLASS)) continue;

    const locale = localeFromPath(relativePath);
    const $ = load(original, { decodeEntities: false });
    const notes = [];
    const deduped = dedupeExistingPatch($);
    const barRemoved = removePromoBar($, notes);
    const buttonsInserted = insertHeroButtons($, locale, notes);

    if (barRemoved || buttonsInserted || deduped) {
      report.push({ file: relativePath, barRemoved, buttonsInserted, notes });
      if (WRITE) {
        await fs.writeFile(fullPath, $.html(), 'utf8');
      }
    }
  }

  if (!report.length) {
    console.log('No matching promo bar or hero anchor found in any file.');
    return;
  }

  console.log(`${WRITE ? 'Applied' : 'Would apply'} fixes in ${report.length} file(s):\n`);
  for (const row of report) {
    console.log(`  ${row.file}`);
    for (const note of row.notes) console.log(`    - ${note}`);
  }

  if (!WRITE) {
    console.log('\nDry run only — re-run with --write to apply.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
