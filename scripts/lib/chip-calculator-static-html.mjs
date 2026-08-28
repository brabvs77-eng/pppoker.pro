import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(rootDir, 'apps/web/src/config/chip-calculator.json');

function loadConfig() {
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function fractionDigitsFor(currency) {
  if (currency === 'USD' || currency === 'RUB') return 2;
  return 0;
}

function formatMoney(value, intlLocale, currency) {
  if (!Number.isFinite(value) || value <= 0) return '';
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency,
    maximumFractionDigits: fractionDigitsFor(currency),
    minimumFractionDigits: 0,
  }).format(value);
}

function formatChips(value) {
  if (!Number.isFinite(value) || value <= 0) return '';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);
}

export function loadChipCalculator(locale) {
  const config = loadConfig();
  const labels = config.labelsByLocale[locale] ?? config.labelsByLocale.ru;
  return {
    labels,
    chipPresets: config.chipPresets ?? [],
    ratesUpdatedAt: config.ratesUpdatedAt ?? '',
  };
}

export function renderChipCalculatorSection({ locale }) {
  const { labels, chipPresets } = loadChipCalculator(locale);
  if (!labels?.title) return '';

  const rate = labels.localPerUsd ?? 1;
  const defaultChips = 100;
  const defaultMoney = defaultChips * rate;

  const presetButtons = chipPresets
    .map((chips) => {
      const money = chips * rate;
      const label =
        labels.currency === 'USD'
          ? `$${chips}`
          : formatMoney(money, labels.intlLocale, labels.currency);
      return `<button type="button" class="chip-calculator__preset" data-chip-calculator-preset="${chips}">${escapeHtml(label)}</button>`;
    })
    .join('\n');

  return `<section class="chip-calculator" id="native-chip-calculator" aria-labelledby="chip-calculator-title" data-chip-calculator-rate="${rate}" data-chip-calculator-locale="${escapeHtml(labels.intlLocale)}" data-chip-calculator-currency="${escapeHtml(labels.currency)}">
  <div class="chip-calculator__inner">
    <header class="chip-calculator__header">
      <div>
        <h2 class="chip-calculator__title" id="chip-calculator-title">${escapeHtml(labels.title)}</h2>
        <p class="chip-calculator__subtitle">${escapeHtml(labels.subtitle)}</p>
      </div>
      <p class="chip-calculator__rate">${escapeHtml(labels.rate)}</p>
    </header>
    <div class="chip-calculator__panel">
      <div class="chip-calculator__fields">
        <label class="chip-calculator__field">
          <span class="chip-calculator__label">${escapeHtml(labels.moneyLabel)}</span>
          <input class="chip-calculator__input" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" data-chip-calculator-money aria-label="${escapeHtml(labels.moneyAria)}" value="${escapeHtml(formatMoney(defaultMoney, labels.intlLocale, labels.currency))}">
        </label>
        <div class="chip-calculator__equals" aria-hidden="true">=</div>
        <label class="chip-calculator__field">
          <span class="chip-calculator__label">${escapeHtml(labels.chipsLabel)}</span>
          <input class="chip-calculator__input" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" data-chip-calculator-chips aria-label="${escapeHtml(labels.chipsAria)}" value="${escapeHtml(formatChips(defaultChips))}">
        </label>
      </div>
      <div class="chip-calculator__presets">
        <span class="chip-calculator__presets-label">${escapeHtml(labels.presetsLabel)}</span>
        <div class="chip-calculator__presets-row">${presetButtons}</div>
      </div>
    </div>
  </div>
</section>`;
}
