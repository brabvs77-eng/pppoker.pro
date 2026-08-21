import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { siteContacts } from './site-contacts.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(rootDir, 'apps/web/src/config/home-hero.json');

const TELEGRAM_ICON =
  '<svg class="hero-cta-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21.5 3.5L2.7 10.7c-1.2.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.5.8 1 .8s.7-.2 1-.5l2.4-2.3 4.8 3.6c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.4-1.9-1.6-1.5z" fill="#0a0d14"/></svg>';

function loadConfig() {
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function linesToHtml(text) {
  return escapeHtml(text).replaceAll('\n', '<br>');
}

export function loadHomeHero(locale) {
  const config = loadConfig();
  return config.heroByLocale[locale] ?? config.heroByLocale.ru;
}

export function renderHomeHeroSection({ locale }) {
  const hero = loadHomeHero(locale);
  if (!hero) return '';

  const taglineHtml = hero.tagline
    .map((line) => `<p class="home-hero__tagline-line">${linesToHtml(line)}</p>`)
    .join('\n');

  const bonusHeadings = hero.bonus.startPlayingHeadings
    .map(
      (heading, index) =>
        `<p class="home-hero__bonus-lead home-hero__bonus-lead--${index + 1}">${linesToHtml(heading)}</p>`,
    )
    .join('\n');

  return `<section class="home-hero" id="native-home-hero" aria-labelledby="home-hero-title">
  <div class="home-hero__inner">
    <div class="home-hero__main">
      <p class="home-hero__eyebrow">${escapeHtml(hero.eyebrow)}</p>
      <h1 class="home-hero__title" id="home-hero-title">${escapeHtml(hero.title)}</h1>
      <img class="home-hero__logo" src="${escapeHtml(hero.logoSrc)}" alt="Nuts PPPoker" width="527" height="122" decoding="async" fetchpriority="high">
      <div class="home-hero__tagline">${taglineHtml}</div>
      <p class="home-hero__stat">
        <span class="home-hero__stat-main">${escapeHtml(hero.playerCount.main)}</span>
        <span class="home-hero__stat-accent">${escapeHtml(hero.playerCount.accent)}</span>
      </p>
      <p class="home-hero__hook">
        <span class="home-hero__hook-main">${escapeHtml(hero.hobbyistLine.main)}</span>
        <span class="home-hero__hook-accent">${escapeHtml(hero.hobbyistLine.accent)}</span>
      </p>
      <div class="hero-cta-group">
        <a href="${siteContacts.telegramManager}" target="_blank" rel="noopener" class="hero-cta-btn hero-cta-btn--telegram">
          ${TELEGRAM_ICON}
          ${escapeHtml(hero.telegramCtaLabel)}
        </a>
      </div>
    </div>
    <aside class="home-hero__bonus" aria-label="${escapeHtml(hero.bonus.label)}">
      ${bonusHeadings}
      <div class="home-hero__bonus-badge">
        <span class="home-hero__bonus-label">${escapeHtml(hero.bonus.label)}</span>
        <span class="home-hero__bonus-percent">${escapeHtml(hero.bonus.percent)}</span>
        <span class="home-hero__bonus-deposit">${linesToHtml(hero.bonus.depositLine)}</span>
      </div>
      <p class="home-hero__bonus-cta">${escapeHtml(hero.bonus.managerCta)}</p>
    </aside>
    <img class="home-hero__turbo" src="${escapeHtml(hero.turboImage)}" alt="" width="320" height="320" loading="lazy" decoding="async">
  </div>
  <p class="home-hero__self-reg">${escapeHtml(hero.selfRegister.prefix)}<a href="#reg">${escapeHtml(hero.selfRegister.linkText)}</a>${escapeHtml(hero.selfRegister.suffix)}</p>
</section>`;
}
