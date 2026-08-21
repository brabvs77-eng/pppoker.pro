#!/usr/bin/env node
/**
 * Verifies native cash games grid on homepage bodies and static export.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadHomeCashGames } from './lib/cash-games-static-html.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'apps/web/out');
const BODIES = path.join(ROOT, 'content/bodies');
const CHROME = path.join(ROOT, 'apps/web/src/config/elementor-chrome.json');

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

function verifyBodyHtml(html, label, expectedCards) {
  assert(html.includes('id="native-home-cash-games"'), `${label}: missing native-home-cash-games`);
  assert(
    !html.includes('class="elementor-element elementor-element-79d6e08'),
    `${label}: legacy cash games section still present`,
  );
  assert(html.includes('<article class="home-cash__card'), `${label}: missing native cash game cards`);
  const cardCount = (html.match(/<article class="home-cash__card home-cash__card--/g) || []).length;
  assert(cardCount === expectedCards, `${label}: expected ${expectedCards} cash game cards, got ${cardCount}`);
}

function main() {
  const chrome = JSON.parse(read(CHROME));
  const cashGamesRoutes = chrome.homeCashGamesSlotRoutes ?? [];
  const ruCards = loadHomeCashGames('ru');
  assert(ruCards.cards.length === 3, 'config: expected 3 RU cash game cards');

  for (const { fileId, route } of cashGamesRoutes) {
    const bodyPath = path.join(BODIES, `${fileId}-with-blog-slot.html`);
    assert(fs.existsSync(bodyPath), `missing body: ${fileId}-with-blog-slot.html`);
    verifyBodyHtml(read(bodyPath), fileId, ruCards.cards.length);
  }

  if (!fs.existsSync(OUT)) {
    console.warn('verify-home-cash-games: apps/web/out missing — skipping export checks');
    console.log('verify-home-cash-games: OK (bodies only)');
    return;
  }

  for (const { route } of cashGamesRoutes) {
    const p = outPathForRoute(route);
    assert(fs.existsSync(p), `missing export: ${route}`);
    verifyBodyHtml(read(p), route, ruCards.cards.length);
  }

  console.log('verify-home-cash-games: OK');
}

main();
