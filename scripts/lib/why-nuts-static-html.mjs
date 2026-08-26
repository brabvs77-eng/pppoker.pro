import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(rootDir, 'apps/web/src/config/home-why-nuts.json');

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

export function loadHomeWhyNuts(locale) {
  const config = loadConfig();
  const title = config.titleByLocale[locale] ?? config.titleByLocale.ru;
  const tiles = config.tiles.map((tile) => {
    if (tile.kind === 'brand') return tile;
    const textHtml = tile.textHtmlByLocale?.[locale] ?? tile.textHtmlByLocale?.ru ?? '';
    return { ...tile, textHtml };
  });
  return { title, tiles };
}

function renderTile(tile) {
  if (tile.kind === 'brand') {
    const style = tile.background ? ` style="--home-why-tile-bg: ${tile.background}"` : '';
    return `<article class="home-why__tile home-why__tile--brand"${style} aria-label="NUTS">
  <p class="home-why__brand-word">NU<br>TS</p>
  <img class="home-why__brand-mascot" src="${tile.mascotSrc}" alt="" width="106" height="90" loading="lazy" decoding="async">
</article>`;
  }

  const { icon, textHtml, background } = tile;
  const style = background ? ` style="--home-why-tile-bg: ${background}"` : '';
  return `<article class="home-why__tile"${style}>
  <img class="home-why__icon" src="${icon.src}" alt="" width="${icon.width}" height="${icon.height}" loading="lazy" decoding="async">
  <h3 class="home-why__text">${textHtml}</h3>
</article>`;
}

export function renderHomeWhyNutsSection({ locale }) {
  const { title, tiles } = loadHomeWhyNuts(locale);
  if (!tiles?.length) return '';

  const tileHtml = tiles.map(renderTile).join('\n');

  return `<section class="home-why" id="native-home-why-nuts" aria-labelledby="native-home-why-nuts-title">
  <div class="home-why__inner">
    <h2 class="home-why__title" id="native-home-why-nuts-title">${escapeHtml(title)}</h2>
    <div class="home-why__grid">${tileHtml}</div>
  </div>
</section>`;
}
