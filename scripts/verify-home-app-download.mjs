#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadHomeAppDownload } from './lib/app-download-static-html.mjs';

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

function verifyBodyHtml(html, label, legacySectionId) {
  assert(html.includes('id="reg"'), `${label}: missing #reg anchor`);
  assert(html.includes('id="native-home-app-download"'), `${label}: missing native-home-app-download`);
  assert(html.includes('class="home-download__badges"'), `${label}: missing download badges`);
  assert((html.match(/class="home-download__badge"/g) || []).length === 4, `${label}: expected 4 store badges`);

  const { stores } = loadHomeAppDownload('ru');
  for (const store of stores) {
    assert(html.includes(store.href), `${label}: missing store link ${store.id}`);
    assert(html.includes(store.src), `${label}: missing store image ${store.id}`);
  }

  if (legacySectionId) {
    assert(
      !html.includes(`class="elementor-element elementor-element-${legacySectionId}`),
      `${label}: legacy app-download section ${legacySectionId} still present`,
    );
  }
}

function main() {
  const chrome = JSON.parse(read(CHROME));
  const routes = chrome.homeAppDownloadSlotRoutes ?? [];
  const legacySectionId = chrome.legacyAppDownloadSectionElementId;
  assert(routes.length === 6, 'config: expected 6 homeAppDownloadSlotRoutes');

  for (const { fileId, route } of routes) {
    const bodyPath = path.join(BODIES, `${fileId}-with-blog-slot.html`);
    assert(fs.existsSync(bodyPath), `missing body: ${fileId}-with-blog-slot.html`);
    verifyBodyHtml(read(bodyPath), fileId, legacySectionId);
  }

  if (!fs.existsSync(OUT)) {
    console.warn('verify-home-app-download: apps/web/out missing — skipping export checks');
    console.log('verify-home-app-download: OK (bodies only)');
    return;
  }

  for (const { route } of routes) {
    const p = outPathForRoute(route);
    assert(fs.existsSync(p), `missing export: ${route}`);
    verifyBodyHtml(read(p), route, legacySectionId);
  }

  console.log('verify-home-app-download: OK');
}

main();
