import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(rootDir, 'apps/web/src/config/home-deposit-one-click.json');
const chipCalculatorConfigPath = path.join(rootDir, 'apps/web/src/config/chip-calculator.json');

function loadConfig() {
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

function loadChipRate(locale) {
  const chipConfig = JSON.parse(readFileSync(chipCalculatorConfigPath, 'utf8'));
  const labels = chipConfig.labelsByLocale[locale] ?? chipConfig.labelsByLocale.ru;
  return labels?.rate ?? '1 chip = $1';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function interpolate(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

export function loadHomeDepositOneClick(locale) {
  const config = loadConfig();
  const labels = config.labelsByLocale[locale] ?? config.labelsByLocale.ru;
  const rate = loadChipRate(locale);
  return {
    botUsername: config.botUsername,
    botUrl: config.botUrl,
    clubId: config.clubId,
    labels,
    rate,
  };
}

export function renderHomeDepositOneClickSection({ locale }) {
  const { botUrl, clubId, labels, rate } = loadHomeDepositOneClick(locale);
  if (!labels?.title) return '';

  const vars = { rate, clubId };
  const steps = (labels.steps ?? [])
    .map((step, index) => {
      const text = interpolate(step, vars);
      return `<li class="home-deposit__step">
  <span class="home-deposit__step-num" aria-hidden="true">${index + 1}</span>
  <span class="home-deposit__step-text">${escapeHtml(text)}</span>
</li>`;
    })
    .join('\n');

  const badges = (labels.badges ?? [])
    .map(
      (badge) => `<li class="home-deposit__badge">
  <span class="home-deposit__badge-dot" aria-hidden="true"></span>
  <span>${escapeHtml(badge.text)}</span>
</li>`,
    )
    .join('\n');

  const welcome = interpolate(labels.botPreviewWelcome ?? '', vars);
  const previewRate = interpolate(labels.botPreviewRate ?? '{rate}', vars);

  return `<section class="home-deposit" id="native-home-deposit-one-click" aria-labelledby="native-home-deposit-one-click-title">
  <div class="home-deposit__inner">
    <div class="home-deposit__content">
      <header class="home-deposit__header">
        <h2 class="home-deposit__title" id="native-home-deposit-one-click-title">${escapeHtml(labels.title)}</h2>
        <p class="home-deposit__subtitle">${escapeHtml(labels.subtitle)}</p>
      </header>
      <ol class="home-deposit__steps">${steps}</ol>
      <ul class="home-deposit__badges" aria-label="${escapeHtml(labels.title)}">${badges}</ul>
      <a class="home-deposit__cta" href="${escapeHtml(botUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(labels.ctaLabel)}</a>
    </div>
    <aside class="home-deposit__preview" aria-label="${escapeHtml(labels.botPreviewTitle)}">
      <div class="home-deposit__phone">
        <div class="home-deposit__phone-header">
          <span class="home-deposit__phone-avatar" aria-hidden="true">N</span>
          <div class="home-deposit__phone-meta">
            <span class="home-deposit__phone-name">${escapeHtml(labels.botPreviewTitle)}</span>
            <span class="home-deposit__phone-handle">${escapeHtml(labels.botPreviewHandle)}</span>
          </div>
        </div>
        <div class="home-deposit__phone-body">
          <p class="home-deposit__bot-message">${escapeHtml(welcome)}</p>
          <p class="home-deposit__bot-rate">${escapeHtml(previewRate)}</p>
        </div>
      </div>
    </aside>
  </div>
</section>`;
}
