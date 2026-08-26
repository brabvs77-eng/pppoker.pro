import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(rootDir, 'apps/web/src/config/home-app-download.json');

function loadConfig() {
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

export function loadHomeAppDownload(locale) {
  const config = loadConfig();
  const copy = config.copyByLocale[locale] ?? config.copyByLocale.ru;
  return {
    logo: config.logo,
    stores: config.stores,
    titleHtml: copy.titleHtml,
    ctaHtml: copy.ctaHtml,
  };
}

export function renderHomeAppDownloadSection({ locale }) {
  const { logo, stores, titleHtml, ctaHtml } = loadHomeAppDownload(locale);
  if (!stores?.length) return '';

  const badges = stores
    .map(
      (store) => `<a class="home-download__badge" href="${store.href}" target="_blank" rel="noopener noreferrer">
  <img class="home-download__badge-img" src="${store.src}" alt="${store.alt}" width="${store.width}" height="${store.height}" loading="lazy" decoding="async">
</a>`,
    )
    .join('\n');

  return `<section class="home-download" id="reg" aria-labelledby="native-home-app-download-title">
  <div class="home-download__inner" id="native-home-app-download">
    <img class="home-download__logo" src="${logo.src}" alt="${logo.alt}" width="${logo.width}" height="${logo.height}" loading="lazy" decoding="async">
    <h2 class="home-download__title" id="native-home-app-download-title">${titleHtml}</h2>
    <div class="home-download__badges">${badges}</div>
    <p class="home-download__cta">${ctaHtml}</p>
  </div>
</section>`;
}
