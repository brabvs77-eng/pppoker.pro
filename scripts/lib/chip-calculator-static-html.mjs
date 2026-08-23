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

export function loadChipCalculator(locale) {
  const config = loadConfig();
  const labels = config.labelsByLocale[locale] ?? config.labelsByLocale.ru;
  return { labels, presets: config.presets ?? [] };
}

export function renderChipCalculatorSection({ locale }) {
  const { labels, presets } = loadChipCalculator(locale);
  if (!labels?.title) return '';

  const presetButtons = presets
    .map(
      (amount) =>
        `<button type="button" class="chip-calculator__preset" data-chip-calculator-preset="${amount}">$${amount}</button>`,
    )
    .join('\n');

  return `<section class="chip-calculator" id="native-chip-calculator" aria-labelledby="chip-calculator-title">
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
          <span class="chip-calculator__label">${escapeHtml(labels.usdLabel)}</span>
          <input class="chip-calculator__input" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" data-chip-calculator-usd aria-label="${escapeHtml(labels.usdAria)}" value="100">
        </label>
        <div class="chip-calculator__equals" aria-hidden="true">=</div>
        <label class="chip-calculator__field">
          <span class="chip-calculator__label">${escapeHtml(labels.chipsLabel)}</span>
          <input class="chip-calculator__input" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" data-chip-calculator-chips aria-label="${escapeHtml(labels.chipsAria)}" value="100">
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
