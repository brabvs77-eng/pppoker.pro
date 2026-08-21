import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(rootDir, 'apps/web/src/config/home-withdraw-methods.json');

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

export function loadHomeWithdrawMethods(locale) {
  const config = loadConfig();
  const title = config.titleByLocale[locale] ?? config.titleByLocale.ru;
  return { title, methods: config.methods };
}

export function renderHomeWithdrawMethodsSection({ locale }) {
  const { title, methods } = loadHomeWithdrawMethods(locale);
  if (!methods?.length) return '';

  const items = methods
    .map(
      (method) => `<li class="home-withdraw__item">
  <span class="home-withdraw__chip${method.chip === 'inline' ? ' home-withdraw__chip--inline' : ''}">
    <img class="home-withdraw__logo"
      src="${method.src}"
      alt="${escapeHtml(method.label)}"
      width="${method.width}"
      height="${method.height}"
      loading="lazy"
      decoding="async">
  </span>
</li>`,
    )
    .join('\n');

  return `<section class="home-withdraw" id="native-home-withdraw-methods" aria-labelledby="native-home-withdraw-methods-title">
  <div class="home-withdraw__inner">
    <h2 class="home-withdraw__title" id="native-home-withdraw-methods-title">${escapeHtml(title)}</h2>
    <ul class="home-withdraw__grid" aria-label="${escapeHtml(title)}">${items}</ul>
  </div>
</section>`;
}
