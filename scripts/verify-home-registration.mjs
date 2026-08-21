#!/usr/bin/env node
/**
 * Verifies native registration steps carousel on homepage bodies and static export.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadHomeRegistration } from './lib/registration-static-html.mjs';

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

function verifyBodyHtml(html, label, expectedSteps) {
  assert(html.includes('id="native-home-registration"'), `${label}: missing native-home-registration`);
  assert(
    !html.includes('class="elementor-element elementor-element-da376ea'),
    `${label}: legacy desktop registration section still present`,
  );
  assert(
    !html.includes('class="elementor-element elementor-element-f6f6130'),
    `${label}: legacy mobile registration section still present`,
  );
  assert(
    !html.includes('data-id="3766c55"') && !html.includes('data-id="a06d292"'),
    `${label}: legacy Elementor slides widgets still present`,
  );
  assert(
    !html.includes('class="elementor-main-swiper'),
    `${label}: legacy elementor-main-swiper still present`,
  );
  assert(html.includes('class="home-reg__slide"'), `${label}: missing native registration slides`);
  const slideCount = (html.match(/class="home-reg__slide"/g) || []).length;
  assert(slideCount === expectedSteps, `${label}: expected ${expectedSteps} registration slides, got ${slideCount}`);
}

function main() {
  const chrome = JSON.parse(read(CHROME));
  const registrationRoutes = chrome.homeRegistrationSlotRoutes ?? [];
  const ruSteps = loadHomeRegistration('ru');
  assert(ruSteps.steps.length === 5, 'config: expected 5 RU registration steps');

  for (const { fileId, route } of registrationRoutes) {
    const bodyPath = path.join(BODIES, `${fileId}-with-blog-slot.html`);
    assert(fs.existsSync(bodyPath), `missing body: ${fileId}-with-blog-slot.html`);
    verifyBodyHtml(read(bodyPath), fileId, ruSteps.steps.length);
  }

  if (!fs.existsSync(OUT)) {
    console.warn('verify-home-registration: apps/web/out missing — skipping export checks');
    console.log('verify-home-registration: OK (bodies only)');
    return;
  }

  for (const { route } of registrationRoutes) {
    const p = outPathForRoute(route);
    assert(fs.existsSync(p), `missing export: ${route}`);
    verifyBodyHtml(read(p), route, ruSteps.steps.length);
  }

  console.log('verify-home-registration: OK');
}

main();
