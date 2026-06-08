import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');
const port = 9876;

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

async function main() {
  const server = await startStaticServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];

  page.on('pageerror', (error) => errors.push(error.message));

  try {
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle', timeout: 90_000 });
    await page.waitForTimeout(5000);

    const state = await page.evaluate(() => ({
      swiperInitialized: document.querySelectorAll('.elementor-main-swiper.swiper-initialized').length,
      swiperTotal: document.querySelectorAll('.elementor-main-swiper').length,
      faqBadHash: !!document.querySelector('a[href^="#collapse-"]'),
      channelLink: !!document.querySelector('a[href="https://t.me/+Sj5sG5o0aqJkMTBi"]'),
      whatsappLink: !!document.querySelector('a[href="https://wa.clck.bar/995592934850"]'),
    }));

    const violations = [];
    if (state.swiperInitialized < 3) {
      violations.push(`Expected 3 initialized swipers, got ${state.swiperInitialized}/${state.swiperTotal}`);
    }
    if (state.faqBadHash) violations.push('FAQ still has lowercase #collapse- anchors');
    if (!state.channelLink) violations.push('Missing Telegram channel link in header');
    if (!state.whatsappLink) violations.push('Missing WhatsApp link in header');

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

    console.log('Homepage smoke test passed (swiper, FAQ anchors, header contacts).');
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
