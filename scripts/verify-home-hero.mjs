#!/usr/bin/env node
/**
 * Verifies native home hero replaces legacy Elementor container 23c91dc.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { siteContacts } from './lib/site-contacts.mjs';

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

function containerNeedle(id) {
  return `class="elementor-element elementor-element-${id}`;
}

function outPathForRoute(route) {
  if (route === '/') return path.join(OUT, 'index.html');
  return path.join(OUT, route.slice(1), 'index.html');
}

function verifyHeroHtml(html, label, chrome) {
  const heroId = chrome.homepageHeroRootElementId;
  assert(!html.includes(containerNeedle(heroId)), `${label}: legacy hero ${heroId} still present`);
  assert(html.includes('id="native-home-hero"'), `${label}: missing #native-home-hero`);
  assert(html.includes('class="home-hero__title"'), `${label}: missing hero title`);
  assert(html.includes('hero-cta-group'), `${label}: missing hero CTA group`);
  assert(
    html.includes('hero-cta-btn--telegram') && html.includes(siteContacts.telegramManager),
    `${label}: missing Telegram hero CTA`,
  );
  assert(html.includes('href="#reg"'), `${label}: missing self-registration link`);
  assert(!html.includes('id="hero-cta-buttons-fix"'), `${label}: legacy inline hero CTA styles still present`);
}

function main() {
  const chrome = JSON.parse(read(CHROME));
  const heroRoutes = chrome.homeHeroSlotRoutes ?? [];

  for (const { fileId, route } of heroRoutes) {
    const bodyPath = path.join(BODIES, `${fileId}-with-blog-slot.html`);
    assert(fs.existsSync(bodyPath), `missing body: ${fileId}-with-blog-slot.html`);
    verifyHeroHtml(read(bodyPath), fileId, chrome);
  }

  if (!fs.existsSync(OUT)) {
    console.warn('verify-home-hero: apps/web/out missing — skipping export checks');
    console.log('verify-home-hero: OK (bodies only)');
    return;
  }

  for (const { route } of heroRoutes) {
    const exportPath = outPathForRoute(route);
    assert(fs.existsSync(exportPath), `missing export: ${route}`);
    verifyHeroHtml(read(exportPath), route, chrome);
  }

  console.log('verify-home-hero: OK');
}

main();
