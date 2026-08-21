import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(rootDir, 'apps/web/src/config/home-cash-games.json');

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

function iconsForLocale(config, locale) {
  return config.icons[locale] ?? config.icons.default;
}

export function loadHomeCashGames(locale) {
  const config = loadConfig();
  const cards = config.cardsByLocale[locale] ?? config.cardsByLocale.ru;
  const icons = iconsForLocale(config, locale);
  return { cards, icons };
}

function renderCardHeader(icon, title, subtitle) {
  return `<header class="home-cash__card-head">
  <img class="home-cash__icon" src="${icon}" alt="" loading="lazy" decoding="async" width="32" height="32">
  <div class="home-cash__card-titles">
    <h3 class="home-cash__card-title">${escapeHtml(title)}</h3>
    <p class="home-cash__card-subtitle">${escapeHtml(subtitle)}</p>
  </div>
</header>`;
}

function renderVariantsCard(card, icon) {
  const items = card.items
    .map((item) => `<li class="home-cash__variant">${item}</li>`)
    .join('\n');
  return `<article class="home-cash__card home-cash__card--variants">
  ${renderCardHeader(icon, card.title, card.subtitle)}
  <ul class="home-cash__variants">${items}</ul>
</article>`;
}

function renderBuyinsCard(card, icon) {
  return `<article class="home-cash__card home-cash__card--buyins">
  ${renderCardHeader(icon, card.title, card.subtitle)}
  <div class="home-cash__buyins">
    <p class="home-cash__buyins-lead">${card.leadHtml}</p>
    <div class="home-cash__buyins-range">
      <span class="home-cash__amount home-cash__amount--min">${escapeHtml(card.min)}</span>
      <span class="home-cash__connector">${escapeHtml(card.connector)}</span>
      <span class="home-cash__amount home-cash__amount--max">${escapeHtml(card.max)}</span>
    </div>
  </div>
</article>`;
}

function renderTournamentsCard(card, icon) {
  const lines = card.lines
    .map((line) => `<p class="home-cash__stat">${escapeHtml(line)}</p>`)
    .join('\n');
  return `<article class="home-cash__card home-cash__card--tournaments">
  ${renderCardHeader(icon, card.title, card.subtitle)}
  <div class="home-cash__tournament-stats">
    ${lines}
    <p class="home-cash__guarantee-label">${escapeHtml(card.guaranteeLabel)}</p>
    <p class="home-cash__amount home-cash__amount--guarantee">${escapeHtml(card.guaranteeAmount)}</p>
  </div>
</article>`;
}

function renderCard(card, icons) {
  if (card.kind === 'variants') return renderVariantsCard(card, icons.cash);
  if (card.kind === 'buyins') return renderBuyinsCard(card, icons.buyins);
  if (card.kind === 'tournaments') return renderTournamentsCard(card, icons.tournaments);
  return '';
}

export function renderHomeCashGamesSection({ locale }) {
  const { cards, icons } = loadHomeCashGames(locale);
  if (!cards?.length) return '';

  const cardHtml = cards.map((card) => renderCard(card, icons)).join('\n');

  return `<section class="home-cash" id="native-home-cash-games">
  <div class="home-cash__inner">
    <div class="home-cash__grid">${cardHtml}</div>
  </div>
</section>`;
}
