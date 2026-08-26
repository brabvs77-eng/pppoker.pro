#!/usr/bin/env node
/**
 * Verifies native Why NUTS grid on homepage bodies and static export.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadHomeWhyNuts } from './lib/why-nuts-static-html.mjs';

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

function verifyBodyHtml(html, label, locale, legacyWhyNutsId) {
  assert(html.includes('id="native-home-why-nuts"'), `${label}: missing native-home-why-nuts`);
  assert(html.includes('class="home-why__title"'), `${label}: missing why-nuts title`);
  assert(html.includes('class="home-why__grid"'), `${label}: missing why-nuts grid`);

  const { tiles } = loadHomeWhyNuts(locale);
  const iconTiles = tiles.filter((tile) => tile.kind !== 'brand');
  const iconCount = (html.match(/class="home-why__icon"/g) || []).length;
  assert(iconCount === iconTiles.length, `${label}: expected ${iconTiles.length} icons, got ${iconCount}`);
  assert(html.includes('home-why__tile--brand'), `${label}: missing brand tile`);

  if (legacyWhyNutsId) {
    assert(
      !html.includes(`class="elementor-element elementor-element-${legacyWhyNutsId}`),
      `${label}: legacy Why NUTS section ${legacyWhyNutsId} still present`,
    );
  }
}

function main() {
  const chrome = JSON.parse(read(CHROME));
  const whyNutsRoutes = chrome.homeWhyNutsSlotRoutes ?? [];
  const legacyWhyNutsId = chrome.legacyWhyNutsSectionElementId;
  const localeByRoute = {
    '/': 'ru',
    '/hy/': 'hy',
    '/en/': 'en',
    '/uz/': 'uz',
    '/kz/': 'kz',
  };

  assert(whyNutsRoutes.length === 5, 'config: expected 5 homeWhyNutsSlotRoutes');

  for (const { fileId, route } of whyNutsRoutes) {
    const bodyPath = path.join(BODIES, `${fileId}-with-blog-slot.html`);
    assert(fs.existsSync(bodyPath), `missing body: ${fileId}-with-blog-slot.html`);
    verifyBodyHtml(read(bodyPath), fileId, localeByRoute[route] ?? 'ru', legacyWhyNutsId);
  }

  if (!fs.existsSync(OUT)) {
    console.warn('verify-home-why-nuts: apps/web/out missing — skipping export checks');
    console.log('verify-home-why-nuts: OK (bodies only)');
    return;
  }

  for (const { route } of whyNutsRoutes) {
    const p = outPathForRoute(route);
    assert(fs.existsSync(p), `missing export: ${route}`);
    verifyBodyHtml(read(p), route, localeByRoute[route] ?? 'ru', legacyWhyNutsId);
  }

  console.log('verify-home-why-nuts: OK');
}

main();
