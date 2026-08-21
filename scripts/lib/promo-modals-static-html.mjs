import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(rootDir, 'apps/web/src/config/home-promo-modals.json');

const MODAL_KEYS = ['bonus', 'events', 'jackpot'];
const BOOT_SCRIPT_ID = 'home-promo-modals-boot';

const BOOT_SCRIPT = `<script id="${BOOT_SCRIPT_ID}">
(function () {
  function openModal(key) {
    var dialog = document.getElementById('home-promo-modal-' + key);
    if (dialog && typeof dialog.showModal === 'function') {
      dialog.showModal();
    }
  }
  function wire() {
    document.querySelectorAll('[data-home-promo-modal]').forEach(function (btn) {
      if (btn.__promoModalWired) return;
      btn.__promoModalWired = true;
      btn.addEventListener('click', function () {
        openModal(btn.getAttribute('data-home-promo-modal'));
      });
    });
    document.querySelectorAll('[data-home-promo-modal-close]').forEach(function (btn) {
      if (btn.__promoModalCloseWired) return;
      btn.__promoModalCloseWired = true;
      btn.addEventListener('click', function () {
        var dialog = btn.closest('dialog');
        if (dialog) dialog.close();
      });
    });
    document.querySelectorAll('dialog.home-promo-modal').forEach(function (dialog) {
      if (dialog.__promoModalBackdropWired) return;
      dialog.__promoModalBackdropWired = true;
      dialog.addEventListener('click', function (event) {
        if (event.target === dialog) dialog.close();
      });
    });
  }
  wire();
  document.addEventListener('DOMContentLoaded', wire);
})();
</script>`;

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
  <button type="button" class="home-promo-modal__trigger" data-home-promo-modal="${modalKey}">${escapeHtml(label)}</button>
</div>`;
}

export function renderHomePromoModalsSection({ locale }) {
  const { modals } = loadHomePromoModals(locale);
  if (!modals?.bonus?.titleHtml) return '';

  const dialogs = MODAL_KEYS.map((key) => renderModal(key, modals[key])).join('\n');

  return `<div class="home-promo-modals" id="native-home-promo-modals">
${dialogs}
</div>
${BOOT_SCRIPT}`;
}
