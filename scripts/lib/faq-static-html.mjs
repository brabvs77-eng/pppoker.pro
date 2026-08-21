import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(rootDir, 'apps/web/src/config/home-faq.json');

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

export function loadHomeFaq(locale) {
  const config = loadConfig();
  const faq = config.faqByLocale[locale] ?? config.faqByLocale.ru;
  return faq;
}

export function renderHomeFaqSection({ locale }) {
  const { title, items } = loadHomeFaq(locale);
  if (!items?.length) return '';

  const details = items
    .map((item, index) => {
      const openAttr = index === 0 ? ' open' : '';
      return `<details class="home-faq__item"${openAttr}>
  <summary class="home-faq__question">
    <span class="home-faq__question-text">${escapeHtml(item.question)}</span>
    <span class="home-faq__icon" aria-hidden="true"></span>
  </summary>
  <div class="home-faq__answer">${item.answerHtml}</div>
</details>`;
    })
    .join('\n');

  const titleHtml = title
    ? `<h2 class="home-faq__title" id="home-faq-title">${escapeHtml(title)}</h2>`
    : '';

  return `<section class="home-faq" id="native-home-faq"${title ? ' aria-labelledby="home-faq-title"' : ''}>
  <div class="home-faq__inner">
    <header class="home-faq__header">${titleHtml}</header>
    <div class="home-faq__list">${details}</div>
  </div>
</section>`;
}
