/**
 * One-off generator: extracts localized popup copy into home-promo-modals.json.
 * Re-run when WordPress popup templates change.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { load } from 'cheerio';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(rootDir, 'apps/web/src/config/home-promo-modals.json');

const localeFiles = {
  ru: 'index.html',
  en: 'en/index.html',
  hy: 'hy/index.html',
  uz: 'uz/index.html',
  kz: 'kz/index.html',
};

const popupIdsByLocale = {
  ru: { bonus: '3989', events: '3946', jackpot: '3981' },
  en: { bonus: '886', events: '834', jackpot: '893' },
  hy: { bonus: '3989', events: '3946', jackpot: '3981' },
  uz: { bonus: '3992', events: '3975', jackpot: '3984' },
  kz: { bonus: '3986', events: '3971', jackpot: '3979' },
};

const hotspotLabels = {
  ru: { bonus: 'ПОДРОБНЕЕ', events: 'ПОДРОБНЕЕ', jackpot: 'ПОДРОБНЕЕ' },
  en: { bonus: 'More info', events: 'More info', jackpot: 'More info' },
  hy: { bonus: 'Կարդ մորե', events: 'Կարդ մորե', jackpot: 'Կարդ մորե' },
  uz: { bonus: 'Batafsil', events: 'Batafsil', jackpot: 'Batafsil' },
  kz: { bonus: 'ТОЛЫҒЫРАҚ', events: 'ТОЛЫҒЫРАҚ', jackpot: 'ТОЛЫҒЫРАҚ' },
};

function extractPopupBody($, popup) {
  const chunks = [];
  const contentRoot = popup.find('.elementor-element-dbda4a5').first();
  const root = contentRoot.length ? contentRoot : popup;

  root.find('.elementor-widget-heading .elementor-heading-title').each((index, el) => {
    if (index === 0 && $(el).closest('h2').length) return;
    const tag = $(el).prop('tagName')?.toLowerCase() === 'h2' ? 'h2' : 'p';
    const html = $(el).html()?.trim();
    if (html) chunks.push(`<${tag} class="home-promo-modal__para">${html}</${tag}>`);
  });

  root.find('.eael-dual-header .title').each((_, el) => {
    const lead = $(el).find('.lead').html()?.trim();
    const rest = $(el)
      .contents()
      .filter((_, node) => node.type === 'text' || (node.type === 'tag' && !$(node).hasClass('lead')))
      .text()
      .trim();
    const inner = lead
      ? `<strong class="home-promo-modal__emph">${lead}</strong>${rest ? ` ${rest}` : ''}`
      : $(el).html()?.trim();
    if (inner) chunks.push(`<p class="home-promo-modal__para">${inner}</p>`);
  });

  return chunks.join('\n');
}

function extractPopup($, popupId) {
  const popup = $(`[data-elementor-type="popup"][data-elementor-id="${popupId}"]`).first();
  if (!popup.length) return null;

  const titleHtml =
    popup.find('h2.elementor-heading-title').first().html()?.trim() ??
    popup.find('.elementor-heading-title').first().html()?.trim() ??
    '';

  const iconSrc =
    popup.find('.elementor-element-05a3f0c img, .elementor-element-9cef1e5 img').first().attr('src') ?? '';

  return {
    titleHtml,
    iconSrc,
    bodyHtml: extractPopupBody($, popup),
  };
}

async function main() {
  const modalsByLocale = {};

  for (const [locale, file] of Object.entries(localeFiles)) {
    const html = await fs.readFile(path.join(rootDir, file), 'utf8');
    const $ = load(html);
    const ids = popupIdsByLocale[locale];
    const labels = hotspotLabels[locale];

    modalsByLocale[locale] = {
      triggers: labels,
      modals: {},
    };

    for (const kind of ['bonus', 'events', 'jackpot']) {
      const extracted = extractPopup($, ids[kind]);
      if (!extracted?.titleHtml) {
        console.error(`Missing popup ${kind} (${ids[kind]}) for ${locale}`);
        process.exitCode = 1;
        continue;
      }
      modalsByLocale[locale].modals[kind] = extracted;
    }
  }

  const config = {
    hotspotElementIds: {
      bonus: '4b0f657',
      events: '0f49f23',
      jackpot: '4dc426c',
    },
    popupTemplateStyleIds: ['886', '834', '893', '840'],
    modalsByLocale,
  };

  await fs.writeFile(outPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${outPath}`);
}

main();
