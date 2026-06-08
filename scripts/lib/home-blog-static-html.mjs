import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso, locale = 'ru') {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function sliceRotatedPosts(posts, offset, count) {
  if (posts.length <= count) return posts;
  const normalizedOffset = ((offset % posts.length) + posts.length) % posts.length;
  const result = [];
  for (let i = 0; i < count; i += 1) {
    result.push(posts[(normalizedOffset + i) % posts.length]);
  }
  return result;
}

function getDailyRotationOffset(postCount) {
  if (postCount <= 0) return 0;
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return dayIndex % postCount;
}

export function loadHomeBlogLabels(locale = 'ru') {
  const messages = JSON.parse(
    readFileSync(path.join(rootDir, `apps/web/messages/${locale}.json`), 'utf8'),
  );
  return messages.homeBlog ?? messages.blog;
}

export function loadHomeBlogPosts() {
  return JSON.parse(
    readFileSync(path.join(rootDir, 'apps/web/src/generated/ruHomeBlogPosts.json'), 'utf8'),
  );
}

export function renderHomeBlogSection({
  posts,
  labels,
  offset = getDailyRotationOffset(posts.length),
  visibleCount = 6,
  blogArchiveHref = '/blog/',
} = {}) {
  const visible = sliceRotatedPosts(posts, offset, visibleCount);
  if (visible.length === 0) return '';

  const cards = visible
    .map((post) => {
      const image = post.image
        ? `<img class="home-blog__image" src="${escapeHtml(post.image)}" alt="" width="400" height="250" loading="lazy" decoding="async" />`
        : '<div class="home-blog__image home-blog__image--placeholder" aria-hidden="true"></div>';
      const excerpt = post.description
        ? `<p class="home-blog__excerpt">${escapeHtml(post.description)}</p>`
        : '';

      return `<li><article class="home-blog__card"><a class="home-blog__card-link" href="${escapeHtml(post.route)}">${image}<div class="home-blog__body"><time class="home-blog__date" datetime="${escapeHtml(post.publishedAt)}">${escapeHtml(formatDate(post.publishedAt))}</time><h3 class="home-blog__card-title">${escapeHtml(post.title)}</h3>${excerpt}<span class="home-blog__meta">${escapeHtml(labels.category)}</span><span class="home-blog__more">${escapeHtml(labels.readMore)}</span></div></a></article></li>`;
    })
    .join('');

  return `<section class="home-blog" aria-labelledby="home-blog-title"><div class="home-blog__inner"><header class="home-blog__header"><div><h2 id="home-blog-title" class="home-blog__title">${escapeHtml(labels.title)}</h2><p class="home-blog__subtitle">${escapeHtml(labels.subtitle)}</p></div><a class="home-blog__all" href="${escapeHtml(blogArchiveHref)}">${escapeHtml(labels.allPosts)}</a></header><ul class="home-blog__grid" role="list">${cards}</ul></div></section>`;
}
