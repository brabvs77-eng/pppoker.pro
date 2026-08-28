#!/usr/bin/env node
/**
 * Verifies chip calculator on homepage bodies and export (above reviews).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadChipCalculator } from './lib/chip-calculator-static-html.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'apps/web/out');
const BODIES = path.join(ROOT, 'content/bodies');
const CHROME = path.join(ROOT, 'apps/web/src/config/elementor-chrome.json');

const localeByRoute = {
  '/': 'ru',
  '/hy/': 'hy',
  '/en/': 'en',
  '/uz/': 'uz',
  '/kz/': 'kz',
  '/tj/': 'tj',
};

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

function verifyBodyHtml(html, label, locale) {
  const { labels } = loadChipCalculator(locale);
  assert(html.includes('id="native-chip-calculator"'), `${label}: missing native-chip-calculator`);
  assert(html.includes('data-chip-calculator-money'), `${label}: missing money input`);
  assert(html.includes('data-chip-calculator-rate'), `${label}: missing FX rate attribute`);
  assert(html.includes(`data-chip-calculator-currency="${labels.currency}"`), `${label}: missing currency "${labels.currency}"`);
  assert(html.includes('data-chip-calculator-chips'), `${label}: missing chips input`);
  assert(html.includes('data-chip-calculator-preset'), `${label}: missing preset buttons`);
  assert(html.includes(labels.title), `${label}: missing localized title "${labels.title}"`);
  assert(html.includes(labels.rate), `${label}: missing rate label "${labels.rate}"`);

  const calcIndex = html.indexOf('id="native-chip-calculator"');
  const reviewIndex = html.indexOf('id="native-review-snippets"');
  if (reviewIndex !== -1) {
    assert(calcIndex !== -1 && calcIndex < reviewIndex, `${label}: chip calculator must appear above reviews`);
  }
}

function main() {
  const chrome = JSON.parse(read(CHROME));
  const calculatorRoutes = chrome.homeChipCalculatorSlotRoutes ?? [];

  for (const { fileId, route } of calculatorRoutes) {
    const bodyPath = path.join(BODIES, `${fileId}-with-blog-slot.html`);
    assert(fs.existsSync(bodyPath), `missing body: ${fileId}-with-blog-slot.html`);
    verifyBodyHtml(read(bodyPath), fileId, localeByRoute[route] ?? 'ru');
  }

  if (!fs.existsSync(OUT)) {
    console.warn('verify-chip-calculator: apps/web/out missing — skipping export checks');
    console.log('verify-chip-calculator: OK (bodies only)');
    return;
  }

  for (const { route } of calculatorRoutes) {
    const p = outPathForRoute(route);
    assert(fs.existsSync(p), `missing export: ${route}`);
    verifyBodyHtml(read(p), route, localeByRoute[route] ?? 'ru');
  }

  console.log('verify-chip-calculator: OK');
}

main();
