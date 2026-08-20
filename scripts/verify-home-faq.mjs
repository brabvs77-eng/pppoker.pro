#!/usr/bin/env node
/**
 * Verifies native FAQ accordion on homepage bodies and static export.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadHomeFaq } from './lib/faq-static-html.mjs';

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

function verifyBodyHtml(html, label, expectedItems) {
  assert(html.includes('id="native-home-faq"'), `${label}: missing native-home-faq`);
  assert(
    !html.includes('class="elementor-element elementor-element-aa7fa52'),
    `${label}: legacy FAQ section still present`,
  );
  assert(
    !html.includes('class="elementskit-accordion"') &&
      !html.includes('elementor-widget-elementskit-accordion'),
    `${label}: legacy elementskit accordion still present`,
  );
  assert(!html.includes('href="#collapse-'), `${label}: legacy lowercase #collapse- hrefs still present`);
  assert(html.includes('class="home-faq__item"'), `${label}: missing native FAQ items`);
  assert(html.includes('<details class="home-faq__item"'), `${label}: missing details/summary FAQ markup`);
  const itemCount = (html.match(/class="home-faq__item"/g) || []).length;
  assert(itemCount === expectedItems, `${label}: expected ${expectedItems} FAQ items, got ${itemCount}`);
}

function verifyExportHtml(html, route, expectedItems) {
  verifyBodyHtml(html, route, expectedItems);
}

function main() {
  const chrome = JSON.parse(read(CHROME));
  const faqRoutes = chrome.homeFaqSlotRoutes ?? [];
  const expectedByRoute = {
    '/': 5,
    '/hy/': 5,
    '/en/': 5,
    '/uz/': 8,
    '/kz/': 8,
  };

  const ruFaq = loadHomeFaq('ru');
  assert(ruFaq.items.length === 5, 'config: expected 5 RU FAQ items');

  for (const { fileId, route } of faqRoutes) {
    const bodyPath = path.join(BODIES, `${fileId}-with-blog-slot.html`);
    assert(fs.existsSync(bodyPath), `missing body: ${fileId}-with-blog-slot.html`);
    verifyBodyHtml(read(bodyPath), fileId, expectedByRoute[route] ?? ruFaq.items.length);
  }

  if (!fs.existsSync(OUT)) {
    console.warn('verify-home-faq: apps/web/out missing — skipping export checks');
    console.log('verify-home-faq: OK (bodies only)');
    return;
  }

  for (const { route } of faqRoutes) {
    const p = outPathForRoute(route);
    assert(fs.existsSync(p), `missing export: ${route}`);
    verifyExportHtml(read(p), route, expectedByRoute[route] ?? ruFaq.items.length);
  }

  console.log('verify-home-faq: OK');
}

main();
