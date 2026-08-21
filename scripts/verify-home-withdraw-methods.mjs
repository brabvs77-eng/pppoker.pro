#!/usr/bin/env node
/**
 * Verifies native withdraw-methods strip on homepage bodies and static export.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadHomeWithdrawMethods } from './lib/withdraw-methods-static-html.mjs';

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

function verifyBodyHtml(html, label, expectedMethods) {
  assert(html.includes('id="native-home-withdraw-methods"'), `${label}: missing native-home-withdraw-methods`);
  assert(html.includes('class="home-withdraw__title"'), `${label}: missing withdraw title`);
  assert(html.includes('class="home-withdraw__grid"'), `${label}: missing withdraw grid`);
  assert(html.includes('class="home-withdraw__chip"'), `${label}: missing withdraw chip wrapper`);

  const logoCount = (html.match(/class="home-withdraw__logo"/g) || []).length;
  assert(
    logoCount === expectedMethods,
    `${label}: expected ${expectedMethods} withdraw method logos, got ${logoCount}`,
  );

  for (const method of loadHomeWithdrawMethods('ru').methods) {
    assert(html.includes(method.src), `${label}: missing logo src ${method.src}`);
  }
}

function verifySvgAssets(methods) {
  for (const method of methods) {
    const svgPath = path.join(ROOT, method.src.replace(/^\//, ''));
    const bytes = fs.readFileSync(svgPath);
    const bad = [...bytes].filter((b) => b < 32 && b !== 9 && b !== 10 && b !== 13);
    assert(bad.length === 0, `${method.id}.svg: invalid control bytes in SVG`);
  }
}

function main() {
  const chrome = JSON.parse(read(CHROME));
  const withdrawRoutes = chrome.homeWithdrawMethodsSlotRoutes ?? [];
  const ruMethods = loadHomeWithdrawMethods('ru');
  assert(ruMethods.methods.length === 7, 'config: expected 7 withdraw methods');
  verifySvgAssets(ruMethods.methods);

  for (const { fileId, route } of withdrawRoutes) {
    const bodyPath = path.join(BODIES, `${fileId}-with-blog-slot.html`);
    assert(fs.existsSync(bodyPath), `missing body: ${fileId}-with-blog-slot.html`);
    verifyBodyHtml(read(bodyPath), fileId, ruMethods.methods.length);
  }

  if (!fs.existsSync(OUT)) {
    console.warn('verify-home-withdraw-methods: apps/web/out missing — skipping export checks');
    console.log('verify-home-withdraw-methods: OK (bodies only)');
    return;
  }

  for (const { route } of withdrawRoutes) {
    const p = outPathForRoute(route);
    assert(fs.existsSync(p), `missing export: ${route}`);
    verifyBodyHtml(read(p), route, ruMethods.methods.length);
  }

  console.log('verify-home-withdraw-methods: OK');
}

main();
