import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

import { CONVERSION_LANDING_ROUTES } from './lib/landing-pages.mjs';
import { siteContacts } from './lib/site-contacts.mjs';
import { startStaticServer } from './lib/smoke-static-server.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');
const port = 9877;

async function smokeLandingPage(page, { label, route }) {
  const violations = [];
  await page.goto(`http://127.0.0.1:${port}${route}`, {
    waitUntil: 'networkidle',
    timeout: 90_000,
  });
  await page.waitForTimeout(2000);

  const state = await page.evaluate(({ channel, whatsappMarkers }) => ({
    siteHeader: !!document.querySelector('.site-header'),
    siteFooter: !!document.querySelector('.site-footer'),
    channelLink: !!document.querySelector(`a[href="${channel}"]`),
    whatsappLinks: whatsappMarkers.filter((marker) => document.body.innerHTML.includes(marker)).length,
    elementorRuntime: !!document.querySelector('script[src*="elementor-frontend"]'),
  }), {
    channel: siteContacts.telegramChannel,
    whatsappMarkers: ['wa.clck.bar', 'hero-cta-btn--whatsapp'],
  });

  if (!state.siteHeader) violations.push(`[${label}] Missing .site-header`);
  if (!state.siteFooter) violations.push(`[${label}] Missing .site-footer`);
  if (!state.channelLink) violations.push(`[${label}] Missing Telegram channel link`);
  if (state.whatsappLinks > 0) violations.push(`[${label}] WhatsApp links still present`);
  if (state.elementorRuntime) violations.push(`[${label}] Elementor frontend script loaded`);

  return violations;
}

async function main() {
  const server = await startStaticServer(outDir, port);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  const violations = [];

  page.on('pageerror', (error) => errors.push(error.message));

  try {
    for (const config of CONVERSION_LANDING_ROUTES) {
      violations.push(...(await smokeLandingPage(page, config)));
    }

    if (violations.length) {
      console.error('Landing page smoke test failed:');
      violations.forEach((line) => console.error(`  - ${line}`));
      if (errors.length) {
        console.error('Page errors:');
        errors.slice(0, 5).forEach((line) => console.error(`  - ${line.slice(0, 120)}`));
      }
      process.exitCode = 1;
      return;
    }

    console.log(
      `Landing page smoke passed for ${CONVERSION_LANDING_ROUTES.map((p) => p.label).join(', ')} (native chrome, contacts, no Elementor runtime).`,
    );
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
