#!/usr/bin/env node
/**
 * Verifies native CRASH / Russian Poker promo blocks on homepage bodies and export.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadHomePromoBlocks } from './lib/promo-blocks-static-html.mjs';

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

function verifyBodyHtml(html, label, { legacyCrashId, legacyRusId, expectRusVideos }) {
  assert(html.includes('id="native-home-promo-blocks"'), `${label}: missing native-home-promo-blocks`);
  assert(
    !html.includes(`class="elementor-element elementor-element-${legacyCrashId}`),
    `${label}: legacy CRASH promo section still present (${legacyCrashId})`,
  );
  assert(
    !html.includes(`class="elementor-element elementor-element-${legacyRusId}`),
    `${label}: legacy Russian Poker promo section still present (${legacyRusId})`,
  );
  assert(html.includes('data-promo-crash-autoplay'), `${label}: missing CRASH autoplay marker`);
  assert(html.includes('promo-crash-video'), `${label}: missing promo-crash-video class`);
  assert(html.includes('promo-crash-autoplay'), `${label}: missing CRASH autoplay script`);
  assert(html.includes('video_2025-12-06_19-00-19-v2.mp4'), `${label}: missing CRASH video src`);
  assert(html.includes('home-promo-blocks__block--crash'), `${label}: missing native CRASH block`);
  assert(html.includes('home-promo-blocks__block--rus-poker'), `${label}: missing native Russian Poker block`);

  const rusVideoCount = (html.match(/<video class="home-promo-blocks__video home-promo-blocks__video--rus"/g) || []).length;
  assert(
    rusVideoCount === expectRusVideos,
    `${label}: expected ${expectRusVideos} Russian Poker videos, got ${rusVideoCount}`,
  );
}

const localeByRoute = {
  '/': 'ru',
  '/hy/': 'hy',
  '/en/': 'en',
  '/uz/': 'uz',
  '/kz/': 'kz',
};

function main() {
  const chrome = JSON.parse(read(CHROME));
  const promoRoutes = chrome.homePromoBlocksSlotRoutes ?? [];

  for (const { fileId, route, legacyCrashPromoSectionElementId, legacyRusPokerPromoSectionElementId } of promoRoutes) {
    const locale = localeByRoute[route] ?? 'ru';
    const { blocks } = loadHomePromoBlocks(locale);
    const expectRusVideos = blocks.rusPoker.videos?.length ?? 0;

    const bodyPath = path.join(BODIES, `${fileId}-with-blog-slot.html`);
    assert(fs.existsSync(bodyPath), `missing body: ${fileId}-with-blog-slot.html`);
    verifyBodyHtml(read(bodyPath), fileId, {
      legacyCrashId: legacyCrashPromoSectionElementId,
      legacyRusId: legacyRusPokerPromoSectionElementId,
      expectRusVideos,
    });
  }

  if (!fs.existsSync(OUT)) {
    console.warn('verify-home-promo-blocks: apps/web/out missing — skipping export checks');
    console.log('verify-home-promo-blocks: OK (bodies only)');
    return;
  }

  for (const entry of promoRoutes) {
    const { route, legacyCrashPromoSectionElementId, legacyRusPokerPromoSectionElementId } = entry;
    const locale = localeByRoute[route] ?? 'ru';
    const { blocks } = loadHomePromoBlocks(locale);
    const p = outPathForRoute(route);
    assert(fs.existsSync(p), `missing export: ${route}`);
    verifyBodyHtml(read(p), route, {
      legacyCrashId: legacyCrashPromoSectionElementId,
      legacyRusId: legacyRusPokerPromoSectionElementId,
      expectRusVideos: blocks.rusPoker.videos?.length ?? 0,
    });
  }

  console.log('verify-home-promo-blocks: OK');
}

main();
