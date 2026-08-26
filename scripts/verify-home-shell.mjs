#!/usr/bin/env node
/**
 * Verifies native home shell bodies/export have no replaced legacy section IDs
 * or empty Elementor spacer containers.
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

function verifyShellHtml(html, label, chrome) {
  const legacyIds = [
    chrome.legacyRegistrationDesktopSectionElementId,
    chrome.legacyRegistrationMobileSectionElementId,
    chrome.legacyCashGamesSectionElementId,
    chrome.legacyReviewsSectionElementId,
    chrome.legacyFaqSectionElementId,
    ...(chrome.legacyEmptySpacerElementIds ?? []),
  ].filter(Boolean);

  for (const id of legacyIds) {
    assert(
      !html.includes(`class="elementor-element elementor-element-${id}`),
      `${label}: legacy section ${id} still present`,
    );
  }

  for (const id of chrome.homepageDuplicateCtaElementIds ?? []) {
    assert(
      !html.includes(`class="elementor-element elementor-element-${id}`),
      `${label}: duplicate hero CTA ${id} still present`,
    );
  }

  assert(!html.includes('id="masthead"'), `${label}: legacy #masthead still present`);
  assert(!html.includes('id="widster-'), `${label}: Widster embed still present`);

  assert(html.includes('id="native-home-registration"'), `${label}: missing native registration`);
  assert(html.includes('id="native-home-app-download"'), `${label}: missing native app-download`);
  assert(html.includes('id="reg"'), `${label}: missing #reg anchor`);
  assert(html.includes('id="native-home-cash-games"'), `${label}: missing native cash games`);
  assert(html.includes('id="native-home-withdraw-methods"'), `${label}: missing native withdraw methods`);
  assert(html.includes('id="native-home-why-nuts"'), `${label}: missing native why-nuts`);
  assert(html.includes('id="native-home-promo-cards"'), `${label}: missing native promo-cards`);
  assert(html.includes('id="native-chip-calculator"'), `${label}: missing native chip calculator`);
  assert(html.includes('id="native-review-snippets"'), `${label}: missing native reviews`);
  assert(html.includes('id="native-home-faq"'), `${label}: missing native FAQ`);
}

function main() {
  const chrome = JSON.parse(read(CHROME));
  const shellRoutes = chrome.homeRegistrationSlotRoutes ?? [];

  for (const { fileId, route } of shellRoutes) {
    const bodyPath = path.join(BODIES, `${fileId}-with-blog-slot.html`);
    assert(fs.existsSync(bodyPath), `missing body: ${fileId}-with-blog-slot.html`);
    verifyShellHtml(read(bodyPath), fileId, chrome);
  }

  if (!fs.existsSync(OUT)) {
    console.warn('verify-home-shell: apps/web/out missing — skipping export checks');
    console.log('verify-home-shell: OK (bodies only)');
    return;
  }

  for (const { route } of shellRoutes) {
    const p = outPathForRoute(route);
    assert(fs.existsSync(p), `missing export: ${route}`);
    verifyShellHtml(read(p), route, chrome);
  }

  console.log('verify-home-shell: OK');
}

main();
