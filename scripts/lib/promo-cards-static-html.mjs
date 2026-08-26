import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadHomePromoModals, renderHotspotTrigger } from './promo-modals-static-html.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(rootDir, 'apps/web/src/config/home-promo-cards.json');

function loadConfig() {
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

export function loadHomePromoCards(locale) {
  const config = loadConfig();
  const cards = config.cardsByLocale[locale] ?? config.cardsByLocale.ru;
  const { triggers } = loadHomePromoModals(locale);
  return {
    cards,
    triggers,
    decorations: config.decorations,
    panelOverlay: config.panelOverlay,
  };
}

function renderBonusSteps(steps) {
  return steps
    .map(
      (step) => `<div class="home-promo-cards__step">
  <p class="home-promo-cards__step-label">${step.label}</p>
  <p class="home-promo-cards__step-value">${step.value}</p>
</div>`,
    )
    .join('\n');
}

function renderBonusCard(cards, triggers, decorations, panelOverlay) {
  const { bonus } = cards;
  const stepsHtml = renderBonusSteps(bonus.steps ?? []);

  return `<article class="home-promo-cards__card home-promo-cards__card--bonus" data-home-promo-card="bonus" style="--home-promo-card-bg: url('${bonus.background}')">
  <h2 class="home-promo-cards__headline home-promo-cards__headline--gradient">${bonus.headline}</h2>
  <h3 class="home-promo-cards__subtitle">${bonus.subtitleHtml}</h3>
  <div class="home-promo-cards__panel" style="--home-promo-panel-overlay: url('${panelOverlay}')">
    <div class="home-promo-cards__steps">${stepsHtml}</div>
    ${renderHotspotTrigger('bonus', triggers.bonus)}
  </div>
  <img class="home-promo-cards__decor home-promo-cards__decor--money" src="${decorations.bonusMoney.src}" alt="${decorations.bonusMoney.alt}" width="${decorations.bonusMoney.width}" height="${decorations.bonusMoney.height}" loading="lazy" decoding="async">
</article>`;
}

function renderEventsCard(cards, triggers) {
  const { events } = cards;

  return `<article class="home-promo-cards__card home-promo-cards__card--events" data-home-promo-card="events" style="--home-promo-card-bg: url('${events.background}')">
  <div class="home-promo-cards__events-copy">
    <h3 class="home-promo-cards__events-title">${events.title}</h3>
    <p class="home-promo-cards__events-subtitle">${events.subtitle}</p>
  </div>
  ${renderHotspotTrigger('events', triggers.events)}
</article>`;
}

function renderJackpotCard(cards, triggers, decorations) {
  const { jackpot } = cards;

  return `<article class="home-promo-cards__card home-promo-cards__card--jackpot" data-home-promo-card="jackpot">
  <div class="home-promo-cards__jackpot-inner">
    <h2 class="home-promo-cards__jackpot-title">${jackpot.title}</h2>
    <p class="home-promo-cards__amount home-promo-cards__headline--gradient">${jackpot.amount}</p>
    ${renderHotspotTrigger('jackpot', triggers.jackpot)}
  </div>
  <img class="home-promo-cards__decor home-promo-cards__decor--dollar" src="${decorations.jackpotDollar.src}" alt="${decorations.jackpotDollar.alt}" width="${decorations.jackpotDollar.width}" height="${decorations.jackpotDollar.height}" loading="lazy" decoding="async">
</article>`;
}

export function renderHomePromoCardsSection({ locale }) {
  const { cards, triggers, decorations, panelOverlay } = loadHomePromoCards(locale);
  if (!cards?.bonus?.headline) return '';

  return `<section class="home-promo-cards" id="native-home-promo-cards">
  <div class="home-promo-cards__grid">
    ${renderBonusCard(cards, triggers, decorations, panelOverlay)}
    <div class="home-promo-cards__side">
      ${renderEventsCard(cards, triggers)}
      ${renderJackpotCard(cards, triggers, decorations)}
    </div>
  </div>
</section>`;
}
