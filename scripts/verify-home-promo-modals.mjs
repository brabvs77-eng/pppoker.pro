#!/usr/bin/env node
/**
 * Verifies native bonus/events/jackpot modals on homepage bodies and export.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

function verifyBodyHtml(html, label) {
  assert(html.includes('id="native-home-promo-modals"'), `${label}: missing native-home-promo-modals`);
  assert(!html.includes('elementor-location-popup'), `${label}: legacy Elementor popups still present`);
  assert(!html.includes('data-elementor-type="popup"'), `${label}: legacy popup containers still present`);
  assert(html.includes('data-home-promo-modal="bonus"'), `${label}: missing bonus modal trigger`);
  assert(html.includes('data-home-promo-modal="events"'), `${label}: missing events modal trigger`);
  assert(html.includes('data-home-promo-modal="jackpot"'), `${label}: missing jackpot modal trigger`);
  assert(html.includes('data-home-promo-card="bonus"'), `${label}: missing bonus card trigger`);
  assert(html.includes('data-home-promo-card="events"'), `${label}: missing events card trigger`);
  assert(html.includes('data-home-promo-card="jackpot"'), `${label}: missing jackpot card trigger`);
  assert(html.includes('home-promo-modal__trigger-img'), `${label}: missing but-back trigger image`);
  assert(html.includes('id="home-promo-modal-bonus"'), `${label}: missing bonus dialog`);
  assert(html.includes('id="home-promo-modal-events"'), `${label}: missing events dialog`);
  assert(html.includes('id="home-promo-modal-jackpot"'), `${label}: missing jackpot dialog`);
  assert(!html.includes('popup:open'), `${label}: legacy popup hotspot links still present`);
  assert(
    !html.includes('class="elementor-element elementor-element-4b0f657'),
    `${label}: legacy bonus hotspot widget still present`,
  );
  assert(
    !html.includes('class="elementor-element elementor-element-0f49f23'),
    `${label}: legacy events hotspot widget still present`,
  );
  assert(
    !html.includes('class="elementor-element elementor-element-4dc426c'),
    `${label}: legacy jackpot hotspot widget still present`,
  );
}

function main() {
  const chrome = JSON.parse(read(CHROME));
  const modalRoutes = chrome.homePromoModalsSlotRoutes ?? [];

  for (const { fileId, route } of modalRoutes) {
    const bodyPath = path.join(BODIES, `${fileId}-with-blog-slot.html`);
    assert(fs.existsSync(bodyPath), `missing body: ${fileId}-with-blog-slot.html`);
    verifyBodyHtml(read(bodyPath), fileId);
  }

  if (!fs.existsSync(OUT)) {
    console.warn('verify-home-promo-modals: apps/web/out missing — skipping export checks');
    console.log('verify-home-promo-modals: OK (bodies only)');
    return;
  }

  for (const { route } of modalRoutes) {
    const p = outPathForRoute(route);
    assert(fs.existsSync(p), `missing export: ${route}`);
    verifyBodyHtml(read(p), route);
  }

  console.log('verify-home-promo-modals: OK');
}

main();
