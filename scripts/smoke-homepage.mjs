import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

import { siteContacts } from './lib/site-contacts.mjs';
import { startStaticServer } from './lib/smoke-static-server.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');
const port = 9876;

const HOME_SMOKE_PAGES = [
  { label: 'RU', urlPath: '/', minSwipers: 2, minHomeBlogCards: 6, minReviewCards: 6, feedHref: '/feed.xml' },
  { label: 'HY', urlPath: '/hy/', minSwipers: 2, minHomeBlogCards: 6, minReviewCards: 6 },
  { label: 'EN', urlPath: '/en/', minSwipers: 2, minHomeBlogCards: 2, minReviewCards: 6, feedHref: '/en/feed.xml' },
  { label: 'UZ', urlPath: '/uz/', minSwipers: 2, minHomeBlogCards: 2, minReviewCards: 6, feedHref: '/uz/feed.xml' },
  { label: 'KZ', urlPath: '/kz/', minSwipers: 2, minHomeBlogCards: 1, minReviewCards: 6, feedHref: '/kz/feed.xml' },
  { label: 'TJ', urlPath: '/tj/', minSwipers: 0, minHomeBlogCards: 0, minReviewCards: 0 },
];

async function smokeHomepage(page, { label, urlPath, minSwipers, minHomeBlogCards = 0, minReviewCards = 0, feedHref }) {
  const violations = [];
  await page.goto(`http://127.0.0.1:${port}${urlPath}`, {
    waitUntil: 'networkidle',
    timeout: 90_000,
  });
  await page.waitForTimeout(5000);

  const state = await page.evaluate(({ channel, whatsapp, feedHref }) => ({
    swiperInitialized: document.querySelectorAll('.elementor-main-swiper.swiper-initialized').length,
    swiperTotal: document.querySelectorAll('.elementor-main-swiper').length,
    faqBadHash: !!document.querySelector('a[href^="#collapse-"]'),
    channelLink: !!document.querySelector(`a[href="${channel}"]`),
    whatsappLink: !!document.querySelector(`a[href="${whatsapp}"]`),
    homePromo: !!document.querySelector('.home-promo'),
    hiddenPlayCta: (() => {
      const el = document.querySelector('.elementor-element-d014ade');
      if (!el) return null;
      return getComputedStyle(el).display === 'none';
    })(),
    homeBlogCards: document.querySelectorAll('.home-blog__card').length,
    reviewCards: document.querySelectorAll('.review-snippets__card').length,
    reviewStars: document.querySelectorAll('.review-stars').length,
    rssLink: feedHref
      ? !!document.querySelector(
          `link[rel="alternate"][type="application/rss+xml"][href="${feedHref}"]`,
        )
      : true,
  }), {
    channel: siteContacts.telegramChannel,
    whatsapp: siteContacts.whatsapp,
    feedHref,
  });

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
  if (minReviewCards > 0 && state.reviewCards < minReviewCards) {
    violations.push(
      `[${label}] Expected at least ${minReviewCards} review cards, found ${state.reviewCards}`,
    );
  }
  if (minReviewCards > 0 && state.reviewStars < 1) {
    violations.push(`[${label}] Missing review star markup`);
  }
  if (feedHref && !state.rssLink) {
    violations.push(`[${label}] Missing RSS alternate link ${feedHref}`);
  }

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
      `Homepage smoke passed for ${HOME_SMOKE_PAGES.map((p) => p.label).join(', ')} (swiper, FAQ, contacts, HomePromo dedupe, home blog, RSS).`,
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
