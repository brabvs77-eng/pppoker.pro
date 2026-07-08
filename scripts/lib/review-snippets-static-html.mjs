import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(rootDir, 'apps/web/src/config/review-snippets.json');

const LABELS = {
  ru: {
    title: 'Нас рекомендуют покеристы',
    subtitle: 'Отзывы игроков о клубе NUTS и PPPoker',
    reviewsLabel: 'отзывов',
    verified: 'Проверенный игрок',
  },
  en: {
    title: 'Recommended by poker players',
    subtitle: 'Player reviews of NUTS club and PPPoker',
    reviewsLabel: 'reviews',
    verified: 'Verified player',
  },
  uz: {
    title: 'Pokeristlar tavsiya qiladi',
    subtitle: 'NUTS klubi va PPPoker haqida fikrlar',
    reviewsLabel: 'sharh',
    verified: 'Tasdiqlangan o\'yinchi',
  },
  kz: {
    title: 'Покеристер ұсынады',
    subtitle: 'NUTS клубы мен PPPoker туралы пікірлер',
    reviewsLabel: 'пікір',
    verified: 'Расталған ойыншы',
  },
  hy: {
    title: 'Խորհուրդ են տալիս պոկերիստները',
    subtitle: 'Կարծիքներ NUTS ակումբի և PPPoker-ի մասին',
    reviewsLabel: 'կարծիք',
    verified: 'Հաստատված խաղացող',
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderStars(rating, bestRating = 5) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4 ? 1 : 0;
  const empty = Math.max(0, bestRating - full - half);
  const stars = [
    ...Array.from({ length: full }, () => '<span class="review-stars__star review-stars__star--full" aria-hidden="true">★</span>'),
    ...(half ? ['<span class="review-stars__star review-stars__star--half" aria-hidden="true">★</span>'] : []),
    ...Array.from({ length: empty }, () => '<span class="review-stars__star review-stars__star--empty" aria-hidden="true">★</span>'),
  ];
  return `<div class="review-stars" aria-label="${rating} / ${bestRating}">${stars.join('')}</div>`;
}

function formatReviewCount(count, locale) {
  if (locale === 'ru' || locale === 'hy' || locale === 'kz') {
    return count.toLocaleString('ru-RU');
  }
  return count.toLocaleString('en-US');
}

function loadConfig() {
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

export function loadReviewSnippets(locale) {
  const config = loadConfig();
  const reviews = config.reviewsByLocale[locale] ?? config.reviewsByLocale.ru;
  const labels = LABELS[locale] ?? LABELS.ru;
  return { aggregate: config.aggregate, reviews, labels };
}

export function renderReviewSnippetsSection({ locale }) {
  const { aggregate, reviews, labels } = loadReviewSnippets(locale);
  if (!reviews.length) return '';

  const cards = reviews
    .map((review) => {
      const avatar = review.avatar
        ? `<img class="review-snippets__avatar" src="${escapeHtml(review.avatar)}" alt="" width="56" height="56" loading="lazy" decoding="async" />`
        : `<div class="review-snippets__avatar review-snippets__avatar--placeholder" aria-hidden="true">${escapeHtml(review.name.slice(0, 1))}</div>`;

      return `<li class="review-snippets__card">
  <article>
    <header class="review-snippets__card-header">
      ${avatar}
      <div class="review-snippets__card-meta">
        <h3 class="review-snippets__name">${escapeHtml(review.name)}</h3>
        <p class="review-snippets__role">${escapeHtml(review.role)}</p>
        ${renderStars(review.rating, aggregate.bestRating)}
      </div>
    </header>
    <blockquote class="review-snippets__quote"><p>${escapeHtml(review.text)}</p></blockquote>
    <p class="review-snippets__badge">${escapeHtml(labels.verified)}</p>
  </article>
</li>`;
    })
    .join('\n');

  return `<section class="review-snippets" id="native-review-snippets" aria-labelledby="review-snippets-title">
  <div class="review-snippets__inner">
    <header class="review-snippets__header">
      <div>
        <h2 class="review-snippets__title" id="review-snippets-title">${escapeHtml(labels.title)}</h2>
        <p class="review-snippets__subtitle">${escapeHtml(labels.subtitle)}</p>
      </div>
      <div class="review-snippets__aggregate" aria-label="${aggregate.ratingValue} / ${aggregate.bestRating}">
        <span class="review-snippets__score">${aggregate.ratingValue}</span>
        ${renderStars(aggregate.ratingValue, aggregate.bestRating)}
        <span class="review-snippets__count">${formatReviewCount(aggregate.reviewCount, locale)} ${escapeHtml(labels.reviewsLabel)}</span>
      </div>
    </header>
    <ul class="review-snippets__grid" role="list">${cards}</ul>
  </div>
</section>`;
}
