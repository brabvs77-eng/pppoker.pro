import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(rootDir, 'apps/web/src/config/home-registration.json');

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

export function loadHomeRegistration(locale) {
  const config = loadConfig();
  const steps = config.stepsByLocale[locale] ?? config.stepsByLocale.ru;
  return { images: config.images, steps };
}

export function renderHomeRegistrationSection({ locale }) {
  const { images, steps } = loadHomeRegistration(locale);
  if (!steps?.length) return '';

  const groupName = `home-reg-${locale}`;
  const count = steps.length;

  const radios = steps
    .map((_, index) => {
      const slideNum = index + 1;
      const checked = index === 0 ? ' checked' : '';
      return `<input class="home-reg__radio" type="radio" name="${groupName}" id="${groupName}-${slideNum}"${checked} hidden>`;
    })
    .join('\n');

  const slides = steps
    .map((step, index) => {
      const image = images[index] ?? images[images.length - 1];
      return `<article class="home-reg__slide" aria-roledescription="slide" aria-label="${escapeHtml(step.heading)}">
  <div class="home-reg__media">
    <img class="home-reg__image" src="${image}" alt="" loading="lazy" decoding="async" width="640" height="480">
  </div>
  <div class="home-reg__content">
    <h3 class="home-reg__heading">${escapeHtml(step.heading)}</h3>
    <div class="home-reg__description">${step.descriptionHtml}</div>
  </div>
</article>`;
    })
    .join('\n');

  const prevNav = steps
    .map((_, index) => {
      const slideNum = index + 1;
      const prevNum = slideNum === 1 ? count : slideNum - 1;
      return `<label class="home-reg__nav home-reg__nav--prev home-reg__nav--for-${slideNum}" for="${groupName}-${prevNum}" aria-label="Previous slide">
  <span class="home-reg__nav-icon" aria-hidden="true"></span>
</label>`;
    })
    .join('\n');

  const nextNav = steps
    .map((_, index) => {
      const slideNum = index + 1;
      const nextNum = slideNum === count ? 1 : slideNum + 1;
      return `<label class="home-reg__nav home-reg__nav--next home-reg__nav--for-${slideNum}" for="${groupName}-${nextNum}" aria-label="Next slide">
  <span class="home-reg__nav-icon" aria-hidden="true"></span>
</label>`;
    })
    .join('\n');

  const dots = steps
    .map((step, index) => {
      const slideNum = index + 1;
      return `<label class="home-reg__dot" for="${groupName}-${slideNum}" aria-label="${escapeHtml(step.heading)}"></label>`;
    })
    .join('\n');

  const slideSelectors = steps
    .map((_, index) => {
      const slideNum = index + 1;
      const offset = index * 100;
      return `#${groupName}-${slideNum}:checked ~ .home-reg__viewport .home-reg__track { transform: translateX(-${offset}%); }`;
    })
    .join('\n');

  const navSelectors = steps
    .map((_, index) => {
      const slideNum = index + 1;
      return `#${groupName}-${slideNum}:checked ~ .home-reg__controls .home-reg__nav--for-${slideNum} { display: flex; }`;
    })
    .join('\n');

  const dotSelectors = steps
    .map((_, index) => {
      const slideNum = index + 1;
      return `#${groupName}-${slideNum}:checked ~ .home-reg__dots .home-reg__dot:nth-child(${slideNum}) { background: var(--nuts-gold, #fde661); transform: scale(1.15); }`;
    })
    .join('\n');

  return `<section class="home-reg" id="native-home-registration" aria-roledescription="carousel" aria-label="Registration steps">
  <div class="home-reg__carousel" data-locale="${locale}">
    ${radios}
    <div class="home-reg__viewport">
      <div class="home-reg__track">
        ${slides}
      </div>
    </div>
    <div class="home-reg__controls">
      ${prevNav}
      ${nextNav}
    </div>
    <div class="home-reg__dots" role="tablist">${dots}</div>
    <style>
      ${slideSelectors}
      ${navSelectors}
      ${dotSelectors}
    </style>
  </div>
</section>`;
}
