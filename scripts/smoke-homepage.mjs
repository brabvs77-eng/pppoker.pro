import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');
const port = 9876;

const HOME_SMOKE_PAGES = [
  { label: 'RU', urlPath: '/', minSwipers: 3, minHomeBlogCards: 6 },
  { label: 'HY', urlPath: '/hy/', minSwipers: 3, minHomeBlogCards: 6 },
  { label: 'EN', urlPath: '/en/', minSwipers: 3, minHomeBlogCards: 2 },
  { label: 'UZ', urlPath: '/uz/', minSwipers: 3, minHomeBlogCards: 2 },
  { label: 'KZ', urlPath: '/kz/', minSwipers: 3, minHomeBlogCards: 1 },
  { label: 'TJ', urlPath: '/tj/', minSwipers: 0, minHomeBlogCards: 0 },
];

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript';
  if (filePath.endsWith('.css')) return 'text/css';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.json')) return 'application/json';
  return 'application/octet-stream';
}

function startStaticServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        let urlPath = req.url?.split('?')[0] ?? '/';
        if (urlPath.endsWith('/')) urlPath += 'index.html';
        const filePath = path.join(outDir, decodeURIComponent(urlPath));
        if (!filePath.startsWith(outDir)) {
          res.statusCode = 403;
          res.end('forbidden');
          return;
        }
        const data = await fs.readFile(filePath);
        res.setHeader('Content-Type', contentType(filePath));
        res.end(data);
      } catch {
        res.statusCode = 404;
        res.end('not found');
      }
    });
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

async function smokeHomepage(page, { label, urlPath, minSwipers, minHomeBlogCards = 0 }) {
  const violations = [];
  await page.goto(`http://127.0.0.1:${port}${urlPath}`, {
    waitUntil: 'networkidle',
    timeout: 90_000,
  });
  await page.waitForTimeout(5000);

  const state = await page.evaluate(() => ({
    swiperInitialized: document.querySelectorAll('.elementor-main-swiper.swiper-initialized').length,
    swiperTotal: document.querySelectorAll('.elementor-main-swiper').length,
    faqBadHash: !!document.querySelector('a[href^="#collapse-"]'),
    channelLink: !!document.querySelector('a[href="https://t.me/+Sj5sG5o0aqJkMTBi"]'),
    whatsappLink: !!document.querySelector('a[href="https://wa.clck.bar/995592934850"]'),
    homePromo: !!document.querySelector('.home-promo'),
    hiddenPlayCta: (() => {
      const el = document.querySelector('.elementor-element-d014ade');
      if (!el) return null;
      return getComputedStyle(el).display === 'none';
    })(),
    homeBlogCards: document.querySelectorAll('.home-blog__card').length,
  }));

  if (state.swiperInitialized < minSwipers) {
    violations.push(
      `[${label}] Expected ${minSwipers} initialized swipers, got ${state.swiperInitialized}/${state.swiperTotal}`,
    );
  }
  if (state.faqBadHash) violations.push(`[${label}] FAQ still has lowercase #collapse- anchors`);
  if (!state.channelLink) violations.push(`[${label}] Missing Telegram channel link in header`);
  if (!state.whatsappLink) violations.push(`[${label}] Missing WhatsApp link in header`);
  if (!state.homePromo) violations.push(`[${label}] Missing HomePromo strip`);
  if (state.hiddenPlayCta === false) {
    violations.push(`[${label}] Legacy play CTA (d014ade) is still visible — HomePromo dedupe failed`);
  }
  if (minHomeBlogCards > 0 && state.homeBlogCards < minHomeBlogCards) {
    violations.push(
      `[${label}] Expected at least ${minHomeBlogCards} home-blog cards, found ${state.homeBlogCards}`,
    );
  }

  return violations;
}

async function main() {
  const server = await startStaticServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  const violations = [];

  page.on('pageerror', (error) => errors.push(error.message));

  try {
    for (const config of HOME_SMOKE_PAGES) {
      violations.push(...(await smokeHomepage(page, config)));
    }

    if (violations.length) {
      console.error('Homepage smoke test failed:');
      violations.forEach((line) => console.error(`  - ${line}`));
      if (errors.length) {
        console.error('Page errors:');
        errors.slice(0, 5).forEach((line) => console.error(`  - ${line.slice(0, 120)}`));
      }
      process.exitCode = 1;
      return;
    }

    console.log(
      `Homepage smoke passed for ${HOME_SMOKE_PAGES.map((p) => p.label).join(', ')} (swiper, FAQ, contacts, HomePromo dedupe, home blog).`,
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
