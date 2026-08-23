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
const overridesPath = path.join(rootDir, 'apps/web/src/config/home-promo-modals-overrides.json');

const localeFiles = {
  ru: 'index.html',
  en: 'en/index.html',
  hy: 'hy/index.html',
  uz: 'uz/index.html',
  kz: 'kz/index.html',
};

const hotspotElementIds = {
  bonus: '4b0f657',
  events: '0f49f23',
  jackpot: '4dc426c',
};

const popupIdOverrides = {
  hy: { bonus: '886', events: '834', jackpot: '893' },
};

const hotspotLabels = {
  ru: { bonus: 'ПОДРОБНЕЕ', events: 'ПОДРОБНЕЕ', jackpot: 'ПОДРОБНЕЕ' },
  en: { bonus: 'More info', events: 'More info', jackpot: 'More info' },
  hy: { bonus: 'Կարդ մորե', events: 'Կարդ մորե', jackpot: 'Կարդ մորե' },
  uz: { bonus: 'Batafsil', events: 'Batafsil', jackpot: 'Batafsil' },
  kz: { bonus: 'ТОЛЫҒЫРАҚ', events: 'ТОЛЫҒЫРАҚ', jackpot: 'ТОЛЫҒЫРАҚ' },
};

const jackpotIntroByLocale = {
  ru: [
    'Играя в кэш-игры в Nuts,\nвы можете выиграть джекпот.',
    'В PPPOKER есть два вида джекпотов',
  ],
  en: [
    'By playing cash games at Nuts, you can win a jackpot.',
    'PPPOKER has two types of jackpots',
  ],
  hy: [
    'Nuts-ում կեշ խաղեր խաղալով,',
    'PPPOKER-ում կան ջեքփոթի երկու տեսակ',
  ],
  uz: [
    "Nuts klubida kesh o'yinlarini o'ynab, jekpot yutib olishingiz mumkin.",
    "PPPOKERda ikki xil jekpot mavjud",
  ],
  kz: [
    'Nuts клубында кэш ойындарын ойнап, джекпот ұтып алуға болады.',
    'PPPOKER-де екі түрлі джекпот бар',
  ],
};

function decodePopupIdFromActionUrl(url) {
  const match = url.match(/settings%3D([^"&]+)/);
  if (!match) return null;
  try {
    const json = JSON.parse(Buffer.from(decodeURIComponent(match[1]), 'base64').toString('utf8'));
    return json.id != null ? String(json.id) : null;
  } catch {
    return null;
  }
}

function popupIdFromHotspot($, elementId) {
  const widget = $(`.elementor-element-${elementId}`).first();
  if (!widget.length) return null;

  const anchorHref = widget.find('a.e-hotspot--link[href*="popup:open"]').attr('href');
  if (anchorHref) {
    const id = decodePopupIdFromActionUrl(anchorHref);
    if (id) return id;
  }

  const rawLink = widget.attr('data-ha-element-link');
  if (rawLink) {
    try {
      const parsed = JSON.parse(rawLink.replace(/&quot;/g, '"'));
      const id = decodePopupIdFromActionUrl(parsed.url ?? '');
      if (id) return id;
    } catch {
      // ignore malformed JSON
    }
  }

  return null;
}

function isResponsiveDuplicate($, el) {
  const widget = $(el).closest('.elementor-widget');
  return (
    widget.hasClass('elementor-hidden-desktop') ||
    widget.hasClass('elementor-hidden-tablet') ||
    widget.hasClass('elementor-hidden-mobile')
  );
}

function normalizeIconSrc(src) {
  if (!src) return '';
  return src.replace(/\.png$/i, '.webp');
}

function extractPopupBody($, popup) {
  const chunks = [];
  const contentRoot = popup.find('.elementor-element-dbda4a5').first();
  const root = contentRoot.length ? contentRoot : popup;

  root.find('.elementor-widget-heading .elementor-heading-title').each((index, el) => {
    if (isResponsiveDuplicate($, el)) return;
    if (index === 0 && $(el).closest('h2').length) return;
    const tag = $(el).prop('tagName')?.toLowerCase() === 'h2' ? 'h2' : 'p';
    const html = $(el).html()?.trim();
    if (html) chunks.push(`<${tag} class="home-promo-modal__para">${html}</${tag}>`);
  });

  root.find('.eael-dual-header .title').each((_, el) => {
    if (isResponsiveDuplicate($, el)) return;
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

function stripRussianJackpotIntro(bodyHtml) {
  return bodyHtml
    .replace(/<p class="home-promo-modal__para">Играя в кэш-игры[\s\S]*?<\/p>\n?/g, '')
    .replace(/<p class="home-promo-modal__para">В PPPOKER есть два вида джекпотов<\/p>\n?/g, '');
}

function applyJackpotIntro(locale, bodyHtml) {
  let html = locale === 'ru' ? bodyHtml : stripRussianJackpotIntro(bodyHtml);
  if (html.includes('Играя в кэш-игры') || html.includes('By playing cash games at Nuts')) {
    return html;
  }

  const intros = jackpotIntroByLocale[locale];
  if (!intros?.length) return html;

  const prefix = intros.map((text) => `<p class="home-promo-modal__para">${text}</p>`).join('\n');
  return `${prefix}\n${html}`;
}

function extractPopup($, popupId) {
  const popup = $(`[data-elementor-type="popup"][data-elementor-id="${popupId}"]`).first();
  if (!popup.length) return null;

  const titleHtml =
    popup.find('h2.elementor-heading-title').first().html()?.trim() ??
    popup.find('.elementor-heading-title').first().html()?.trim() ??
    '';

  const iconSrc = normalizeIconSrc(
    popup.find('.elementor-element-05a3f0c img, .elementor-element-9cef1e5 img').first().attr('src') ?? '',
  );

  return {
    titleHtml,
    iconSrc,
    bodyHtml: extractPopupBody($, popup),
  };
}

async function main() {
  const modalsByLocale = {};
  let manualOverrides = {};
  try {
    manualOverrides = JSON.parse(await fs.readFile(overridesPath, 'utf8'));
  } catch {
    // optional overrides file
  }

  for (const [locale, file] of Object.entries(localeFiles)) {
    const manualLocale = manualOverrides[locale];
    if (manualLocale?.modals) {
      modalsByLocale[locale] = {
        triggers: manualLocale.triggers ?? hotspotLabels[locale],
        modals: manualLocale.modals,
      };
      continue;
    }

    const html = await fs.readFile(path.join(rootDir, file), 'utf8');
    const $ = load(html);
    const labels = hotspotLabels[locale];
    const overrides = popupIdOverrides[locale] ?? {};

    modalsByLocale[locale] = {
      triggers: labels,
      modals: {},
    };

    for (const kind of ['bonus', 'events', 'jackpot']) {
      const popupId =
        overrides[kind] ?? popupIdFromHotspot($, hotspotElementIds[kind]);
      if (!popupId) {
        console.error(`Missing popup id for ${locale}/${kind}`);
        process.exitCode = 1;
        continue;
      }

      const extracted = extractPopup($, popupId);
      if (!extracted?.titleHtml) {
        console.error(`Missing popup ${kind} (${popupId}) for ${locale}`);
        process.exitCode = 1;
        continue;
      }

      if (kind === 'jackpot') {
        extracted.bodyHtml = applyJackpotIntro(locale, extracted.bodyHtml);
      }

      modalsByLocale[locale].modals[kind] = extracted;
    }
  }

  const config = {
    hotspotElementIds,
    cardElementIds: {
      bonus: '1aacb59',
      events: '44201aa',
      jackpot: '938716b',
    },
    popupTemplateStyleIds: ['886', '834', '893', '840'],
    modalsByLocale,
  };

  await fs.writeFile(outPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${outPath}`);
}

main();
