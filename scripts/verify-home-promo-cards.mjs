#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadHomePromoCards } from './lib/promo-cards-static-html.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'apps/web/out');
const BODIES = path.join(ROOT, 'content/bodies');
const CHROME = path.join(ROOT, 'apps/web/src/config/elementor-chrome.json');

const CARD_KEYS = ['bonus', 'events', 'jackpot'];

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function outPathForRoute(route) {
  if (route === '/') return path.join(OUT, 'index.html');
  return path.join(OUT, route.slice(1), 'index.html');
}

function verifyBodyHtml(html, label, legacySectionId) {
  assert(html.includes('id="native-home-promo-cards"'), `${label}: missing native-home-promo-cards`);
  assert(html.includes('class="home-promo-cards__grid"'), `${label}: missing promo cards grid`);

  for (const key of CARD_KEYS) {
    assert(html.includes(`data-home-promo-card="${key}"`), `${label}: missing ${key} card trigger`);
    assert(html.includes(`data-home-promo-modal="${key}"`), `${label}: missing ${key} modal hotspot`);
  }

  assert(html.includes('home-promo-cards__amount'), `${label}: missing jackpot amount`);
  assert(html.includes('home-promo-modal__trigger-wrap--jackpot'), `${label}: missing jackpot trigger`);

  const amountIndex = html.indexOf('home-promo-cards__amount');
  const jackpotTrigger = html.indexOf('home-promo-modal__trigger-wrap--jackpot');
  if (amountIndex !== -1 && jackpotTrigger !== -1) {
    assert(
      jackpotTrigger > amountIndex,
      `${label}: jackpot trigger must appear after the amount headline`,
    );
  }

  const { cards } = loadHomePromoCards('ru');
  assert(html.includes(cards.bonus.background), `${label}: missing bonus card background`);
  assert(html.includes(cards.events.background), `${label}: missing events card background`);

  if (legacySectionId) {
    assert(
      !html.includes(`class="elementor-element elementor-element-${legacySectionId}`),
      `${label}: legacy promo-cards section ${legacySectionId} still present`,
    );
  }

  for (const widgetId of ['1aacb59', '44201aa', '938716b', '4b0f657', '0f49f23', '4dc426c', 'c85d132']) {
    assert(
      !html.includes(`class="elementor-element elementor-element-${widgetId}`),
      `${label}: legacy promo widget ${widgetId} still present`,
    );
  }
}

function main() {
  const chrome = JSON.parse(read(CHROME));
  const routes = chrome.homePromoCardsSlotRoutes ?? [];
  const legacySectionId = chrome.legacyPromoCardsSectionElementId;
  assert(routes.length === 5, 'config: expected 5 homePromoCardsSlotRoutes');

  for (const { fileId, route } of routes) {
    const bodyPath = path.join(BODIES, `${fileId}-with-blog-slot.html`);
    assert(fs.existsSync(bodyPath), `missing body: ${fileId}-with-blog-slot.html`);
    verifyBodyHtml(read(bodyPath), fileId, legacySectionId);
  }

  if (!fs.existsSync(OUT)) {
    console.warn('verify-home-promo-cards: apps/web/out missing — skipping export checks');
    console.log('verify-home-promo-cards: OK (bodies only)');
    return;
  }

  for (const { route } of routes) {
    const p = outPathForRoute(route);
    assert(fs.existsSync(p), `missing export: ${route}`);
    verifyBodyHtml(read(p), route, legacySectionId);
  }

  console.log('verify-home-promo-cards: OK');
}

main();
