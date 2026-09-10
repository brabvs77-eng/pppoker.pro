#!/usr/bin/env node
/**
 * Verifies deposit one-click block on homepage bodies and export (between chip calculator and reviews).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadHomeDepositOneClick } from './lib/deposit-one-click-static-html.mjs';

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
  const { botUrl, labels, rate } = loadHomeDepositOneClick(locale);
  assert(html.includes('id="native-home-deposit-one-click"'), `${label}: missing native-home-deposit-one-click`);
  assert(html.includes('class="home-deposit__title"'), `${label}: missing deposit title`);
  assert(html.includes('class="home-deposit__steps"'), `${label}: missing deposit steps`);
  assert(html.includes('class="home-deposit__cta"'), `${label}: missing deposit CTA`);
  assert(html.includes('class="home-deposit__tg"'), `${label}: missing Telegram chat preview`);
  assert(html.includes('class="home-deposit__tg-keyboard"'), `${label}: missing Telegram keyboard preview`);
  assert(html.includes(botUrl), `${label}: missing bot URL "${botUrl}"`);
  assert(html.includes(labels.title), `${label}: missing localized title "${labels.title}"`);
  assert(html.includes(rate), `${label}: missing rate label "${rate}"`);

  const calcIndex = html.indexOf('id="native-chip-calculator"');
  const depositIndex = html.indexOf('id="native-home-deposit-one-click"');
  const reviewIndex = html.indexOf('id="native-review-snippets"');

  if (calcIndex !== -1 && depositIndex !== -1) {
    assert(calcIndex < depositIndex, `${label}: deposit block must appear after chip calculator`);
  }
  if (depositIndex !== -1 && reviewIndex !== -1) {
    assert(depositIndex < reviewIndex, `${label}: deposit block must appear before reviews`);
  }
}

function main() {
  const chrome = JSON.parse(read(CHROME));
  const depositRoutes = chrome.homeDepositOneClickSlotRoutes ?? [];

  for (const { fileId, route } of depositRoutes) {
    const bodyPath = path.join(BODIES, `${fileId}-with-blog-slot.html`);
    assert(fs.existsSync(bodyPath), `missing body: ${fileId}-with-blog-slot.html`);
    verifyBodyHtml(read(bodyPath), fileId, localeByRoute[route] ?? 'ru');
  }

  if (!fs.existsSync(OUT)) {
    console.warn('verify-home-deposit-one-click: apps/web/out missing — skipping export checks');
    console.log('verify-home-deposit-one-click: OK (bodies only)');
    return;
  }

  for (const { route } of depositRoutes) {
    const p = outPathForRoute(route);
    assert(fs.existsSync(p), `missing export: ${route}`);
    verifyBodyHtml(read(p), route, localeByRoute[route] ?? 'ru');
  }

  console.log('verify-home-deposit-one-click: OK');
}

main();
