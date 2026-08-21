import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(rootDir, 'apps/web/src/config/home-promo-modals.json');

const MODAL_KEYS = ['bonus', 'events', 'jackpot'];
const TRIGGER_IMG_SRC = '/assets/media/2024/07/but-back.webp';

function loadConfig() {
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

export function loadHomePromoModals(locale) {
  const config = loadConfig();
  const localeConfig = config.modalsByLocale[locale] ?? config.modalsByLocale.ru;
  return {
    modals: localeConfig.modals,
    triggers: localeConfig.triggers,
    hotspotElementIds: config.hotspotElementIds,
    cardElementIds: config.cardElementIds ?? {},
    popupTemplateStyleIds: config.popupTemplateStyleIds,
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderModal(key, modal) {
  const iconHtml = modal.iconSrc
    ? `<img class="home-promo-modal__icon" src="${modal.iconSrc}" alt="" loading="lazy" decoding="async" width="34" height="34">`
    : '';

  return `<dialog class="home-promo-modal" id="home-promo-modal-${key}" aria-labelledby="home-promo-modal-${key}-title">
  <div class="home-promo-modal__panel">
    <button type="button" class="home-promo-modal__close" data-home-promo-modal-close aria-label="Close">&times;</button>
    <div class="home-promo-modal__head">
      ${iconHtml}
      <h2 class="home-promo-modal__title" id="home-promo-modal-${key}-title">${modal.titleHtml}</h2>
    </div>
    <div class="home-promo-modal__body">${modal.bodyHtml}</div>
  </div>
</dialog>`;
}

export function renderHotspotTrigger(modalKey, label) {
  return `<div class="home-promo-modal__trigger-wrap home-promo-modal__trigger-wrap--${modalKey}">
  <button type="button" class="home-promo-modal__trigger" data-home-promo-modal="${modalKey}">
    <img class="home-promo-modal__trigger-img" src="${TRIGGER_IMG_SRC}" alt="" width="367" height="118" loading="lazy" decoding="async">
    <span class="home-promo-modal__trigger-label">${escapeHtml(label)}</span>
  </button>
</div>`;
}

export function renderHomePromoModalsSection({ locale }) {
  const { modals } = loadHomePromoModals(locale);
  if (!modals?.bonus?.titleHtml) return '';

  const dialogs = MODAL_KEYS.map((key) => renderModal(key, modals[key])).join('\n');

  return `<div class="home-promo-modals" id="native-home-promo-modals">
${dialogs}
</div>`;
}
