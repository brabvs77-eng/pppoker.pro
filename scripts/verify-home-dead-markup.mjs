#!/usr/bin/env node
/**
 * Verifies dead homepage markup (legacy masthead, Widster, duplicate hero CTAs)
 * is stripped from native shell bodies and static export.
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

function containerNeedle(id) {
  return `class="elementor-element elementor-element-${id}`;
}

function outPathForRoute(route) {
  if (route === '/') return path.join(OUT, 'index.html');
  return path.join(OUT, route.slice(1), 'index.html');
}

function verifyDeadMarkup(html, label, chrome, { fileId, stripMasthead, stripShellDeadMarkup }) {
  if (stripMasthead) {
    assert(!html.includes('id="masthead"'), `${label}: legacy #masthead still present`);
  }

  if (stripShellDeadMarkup) {
    const widsterId = chrome.legacyWidsterSectionElementIdsByFileId?.[fileId];
    if (widsterId) {
      assert(
        !html.includes(containerNeedle(widsterId)),
        `${label}: legacy Widster section ${widsterId} still present`,
      );
    }

    for (const id of chrome.homepageDuplicateCtaElementIds ?? []) {
      assert(
        !html.includes(containerNeedle(id)),
        `${label}: duplicate hero CTA ${id} still present`,
      );
    }

    assert(!html.includes('id="widster-'), `${label}: Widster embed still present`);
  }
}

function main() {
  const chrome = JSON.parse(read(CHROME));
  const stripMastheadByFileId = new Set(
    (chrome.stripLegacyMastheadRoutes ?? []).map((entry) => entry.fileId),
  );
  const shellRoutes = chrome.homeRegistrationSlotRoutes ?? [];
  const shellFileIds = new Set(shellRoutes.map((entry) => entry.fileId));
  const homeRoutes = chrome.homeBlogSlotRoutes ?? [];

  for (const { fileId, route } of homeRoutes) {
    const bodyPath = path.join(BODIES, `${fileId}-with-blog-slot.html`);
    assert(fs.existsSync(bodyPath), `missing body: ${fileId}-with-blog-slot.html`);
    verifyDeadMarkup(read(bodyPath), fileId, chrome, {
      fileId,
      stripMasthead: stripMastheadByFileId.has(fileId),
      stripShellDeadMarkup: shellFileIds.has(fileId),
    });
  }

  if (!fs.existsSync(OUT)) {
    console.warn('verify-home-dead-markup: apps/web/out missing — skipping export checks');
    console.log('verify-home-dead-markup: OK (bodies only)');
    return;
  }

  for (const { fileId, route } of homeRoutes) {
    const exportPath = outPathForRoute(route);
    assert(fs.existsSync(exportPath), `missing export: ${route}`);
    verifyDeadMarkup(read(exportPath), route, chrome, {
      fileId,
      stripMasthead: stripMastheadByFileId.has(fileId),
      stripShellDeadMarkup: shellFileIds.has(fileId),
    });
  }

  console.log('verify-home-dead-markup: OK');
}

main();
