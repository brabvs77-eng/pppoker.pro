#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadHomeHero } from './lib/hero-static-html.mjs';
import { siteContacts } from './lib/site-contacts.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'apps/web/out');
const BODIES = path.join(ROOT, 'content/bodies');
const CHROME = path.join(ROOT, 'apps/web/src/config/elementor-chrome.json');

const LEGACY_HERO_WIDGETS = [
  '8eaac94',
  'de24648',
  'd014ade',
  '404896e',
  'b5a91f5',
  '4b9baa5',
];

const localeByRoute = {
  '/': 'ru',
  '/hy/': 'hy',
  '/en/': 'en',
  '/uz/': 'uz',
  '/kz/': 'kz',
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

function verifyBodyHtml(html, label, legacySectionId, locale = 'ru') {
  assert(html.includes('id="native-home-hero"'), `${label}: missing native-home-hero`);
  assert(html.includes('class="home-hero__logo"'), `${label}: missing hero logo`);
  assert(html.includes('fetchpriority="high"'), `${label}: missing LCP fetchpriority on hero logo`);
  assert(html.includes('hero-cta-group'), `${label}: missing hero CTA group`);
  assert(html.includes('hero-cta-btn--telegram'), `${label}: missing Telegram hero CTA`);
  assert(html.includes(siteContacts.telegramManager), `${label}: missing Telegram manager link`);
  assert(html.includes('href="#reg"'), `${label}: missing #reg link in hero`);
  assert(html.includes('home-hero__panel'), `${label}: missing hero panel`);
  assert(html.includes('home-hero__play'), `${label}: missing restored play hotspot`);
  assert(html.includes('/assets/media/2024/07/but-back.webp'), `${label}: missing play hotspot art`);
  assert(!html.includes('home-hero__character'), `${label}: legacy tiny turbo character thumb still present`);

  const { logo, title } = loadHomeHero(locale);
  assert(html.includes(logo.src), `${label}: missing hero logo asset`);
  assert(html.includes(title), `${label}: missing hero title copy "${title}"`);

  if (legacySectionId) {
    assert(
      !html.includes(`class="elementor-element elementor-element-${legacySectionId}`),
      `${label}: legacy hero section ${legacySectionId} still present`,
    );
  }

  for (const widgetId of LEGACY_HERO_WIDGETS) {
    assert(
      !html.includes(`class="elementor-element elementor-element-${widgetId}`),
      `${label}: legacy hero widget ${widgetId} still present`,
    );
  }
}

function main() {
  const chrome = JSON.parse(read(CHROME));
  const routes = chrome.homeHeroSlotRoutes ?? [];
  const legacySectionId = chrome.homepageHeroRootElementId;
  assert(routes.length === 5, 'config: expected 5 homeHeroSlotRoutes');

  for (const { fileId, route } of routes) {
    const bodyPath = path.join(BODIES, `${fileId}-with-blog-slot.html`);
    assert(fs.existsSync(bodyPath), `missing body: ${fileId}-with-blog-slot.html`);
    verifyBodyHtml(read(bodyPath), fileId, legacySectionId, localeByRoute[route] ?? 'ru');
  }

  if (!fs.existsSync(OUT)) {
    console.warn('verify-home-hero: apps/web/out missing — skipping export checks');
    console.log('verify-home-hero: OK (bodies only)');
    return;
  }

  for (const { route } of routes) {
    const p = outPathForRoute(route);
    assert(fs.existsSync(p), `missing export: ${route}`);
    verifyBodyHtml(read(p), route, legacySectionId, localeByRoute[route] ?? 'ru');
  }

  console.log('verify-home-hero: OK');
}

main();
