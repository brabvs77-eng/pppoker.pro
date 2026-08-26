import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { siteContacts } from './site-contacts.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(rootDir, 'apps/web/src/config/home-hero.json');

const TELEGRAM_ICON =
  '<svg class="hero-cta-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21.5 3.5L2.7 10.7c-1.2.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.5.8 1 .8s.7-.2 1-.5l2.4-2.3 4.8 3.6c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.4-1.9-1.6-1.5z" fill="#0a0d14"></path></svg>';

function loadConfig() {
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

export function loadHomeHero(locale) {
  const config = loadConfig();
  const localeCopy = config.copyByLocale[locale] ?? config.copyByLocale.ru;
  return {
    ...localeCopy,
    logo: localeCopy.logo ?? config.logo,
    background: localeCopy.background ?? config.background,
  };
}

function renderCta(label) {
  return `<div class="hero-cta-group">
  <a href="${siteContacts.telegramManager}" target="_blank" rel="noopener" class="hero-cta-btn hero-cta-btn--telegram">
    ${TELEGRAM_ICON}
    ${label}
  </a>
</div>`;
}

function optionalBlock(tag, className, html) {
  if (!html) return '';
  return `<${tag} class="${className}">${html}</${tag}>`;
}

export function renderHomeHeroSection({ locale }) {
  const copy = loadHomeHero(locale);
  if (!copy?.title) return '';

  const panelBg = copy.panelBackground
    ? ` style="--home-hero-panel-bg: url('${copy.panelBackground}')"`
    : '';
  const bonusCta = copy.bonusCta
    ? `<p class="home-hero__bonus-cta"><a class="home-hero__bonus-link" href="${siteContacts.telegramManager}" target="_blank" rel="noopener noreferrer">${copy.bonusCta}</a></p>`
    : '';

  return `<section class="home-hero" id="native-home-hero">
  <div class="home-hero__stage" style="--home-hero-bg: url('${copy.background}')">
    <div class="home-hero__layout">
      <div class="home-hero__copy">
        <p class="home-hero__badge">${copy.onlineBadge}</p>
        <h1 class="home-hero__title">${copy.title}</h1>
        <img class="home-hero__logo" src="${copy.logo.src}" alt="${copy.logo.alt}" width="${copy.logo.width}" height="${copy.logo.height}" fetchpriority="high" decoding="async">
        <p class="home-hero__tagline">${copy.taglineHtml}</p>
        <p class="home-hero__players">${copy.playersHtml}</p>
        <p class="home-hero__invite">${copy.inviteHtml}</p>
        ${renderCta(copy.ctaLabel)}
      </div>
      <aside class="home-hero__aside">
        <div class="home-hero__panel"${panelBg}>
          <h2 class="home-hero__panel-title">${copy.playTitleHtml}</h2>
          <p class="home-hero__panel-subtitle">${copy.playSubtitleHtml}</p>
          <p class="home-hero__panel-body">${copy.playBodyHtml}</p>
          <div class="home-hero__bonus">
            <p class="home-hero__bonus-label">${copy.bonusLabel}</p>
            <p class="home-hero__bonus-percent">${copy.bonusPercent}</p>
            <p class="home-hero__bonus-cap">${copy.bonusCapHtml}</p>
          </div>
          ${bonusCta}
          <a class="home-hero__telegram-pill" href="${siteContacts.telegramManager}" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
            <svg aria-hidden="true" viewBox="0 0 448 512" width="20" height="20"><path fill="currentColor" d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z"></path></svg>
            <span>Telegram</span>
          </a>
        </div>
        <div class="home-hero__figure">
          <img class="home-hero__character" src="${copy.character.src}" alt="${copy.character.alt}" width="360" height="420" loading="lazy" decoding="async">
          <p class="home-hero__register">${copy.registerHtml}</p>
        </div>
      </aside>
    </div>
  </div>
</section>`;
}
