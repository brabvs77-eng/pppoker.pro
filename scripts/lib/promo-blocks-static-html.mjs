import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(rootDir, 'apps/web/src/config/home-promo-blocks.json');

const CRASH_AUTOPLAY_ATTR = 'data-promo-crash-autoplay';
const AUTOPLAY_SCRIPT_ID = 'promo-crash-autoplay';

const AUTOPLAY_SCRIPT = `<script id="${AUTOPLAY_SCRIPT_ID}">
(function () {
  function kick(video) {
    if (!video || video.tagName !== 'VIDEO') return;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    if (!video.getAttribute('src')) {
      var source = video.querySelector('source[src]');
      if (source) video.setAttribute('src', source.getAttribute('src'));
    }
    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {});
    }
  }
  function watch(video) {
    if (!video || video.tagName !== 'VIDEO') return;
    if (!('IntersectionObserver' in window)) { kick(video); return; }
    if (video.__crashWatched) return;
    video.__crashWatched = true;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          kick(entry.target);
        } else if (!entry.target.paused) {
          entry.target.pause();
        }
      });
    }, { rootMargin: '200px 0px' });
    io.observe(video);
  }
  function boot() {
    document.querySelectorAll('video[${CRASH_AUTOPLAY_ATTR}]').forEach(watch);
  }
  boot();
  document.addEventListener('DOMContentLoaded', boot);
  window.addEventListener('load', boot);
  if (window.jQuery) {
    window.jQuery(window).on('elementor/frontend/init', boot);
  }
  [500, 1500, 3500, 6000].forEach(function (delay) {
    window.setTimeout(boot, delay);
  });
})();
</script>`;

function loadConfig() {
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

export function loadHomePromoBlocks(locale) {
  const config = loadConfig();
  const blocks = config.blocksByLocale[locale] ?? config.blocksByLocale.ru;
  return { blocks, media: config.media };
}

function renderCrashVideo(media) {
  return `<video class="home-promo-blocks__video home-promo-blocks__video--crash promo-crash-video"
  src="${media.crashVideo}"
  poster="${media.crashPoster}"
  ${CRASH_AUTOPLAY_ATTR}
  autoplay
  muted
  playsinline
  loop
  preload="none"></video>`;
}

function renderRusPokerPoster(media) {
  return `<img class="home-promo-blocks__poster"
  src="${media.rusPokerPoster}"
  alt=""
  loading="lazy"
  decoding="async"
  width="918"
  height="1024">`;
}

function renderRusPokerVideos(videos, poster) {
  return videos
    .map(
      (src) => `<video class="home-promo-blocks__video home-promo-blocks__video--rus"
  src="${src}"
  poster="${poster}"
  controls
  playsinline
  preload="none"></video>`,
    )
    .join('\n');
}

function renderCrashBlock(blocks, media) {
  const mediaFirst = blocks.crashMediaFirst ? ' home-promo-blocks__block--media-first' : '';
  const heading = `<div class="home-promo-blocks__copy"><h5 class="home-promo-blocks__heading">${blocks.crash.headingHtml}</h5></div>`;
  const video = `<div class="home-promo-blocks__media">${renderCrashVideo(media)}</div>`;

  return `<article class="home-promo-blocks__block home-promo-blocks__block--crash${mediaFirst}">
  ${blocks.crashMediaFirst ? video + heading : heading + video}
</article>`;
}

function renderRusPokerBlock(blocks, media) {
  const videos = blocks.rusPoker.videos ?? [];
  const mediaHtml = [
    renderRusPokerPoster(media),
    renderRusPokerVideos(videos, media.rusPokerPoster),
  ]
    .filter(Boolean)
    .join('\n');

  return `<article class="home-promo-blocks__block home-promo-blocks__block--rus-poker">
  <div class="home-promo-blocks__copy"><h5 class="home-promo-blocks__heading">${blocks.rusPoker.headingHtml}</h5></div>
  <div class="home-promo-blocks__media home-promo-blocks__media--stack">${mediaHtml}</div>
</article>`;
}

export function renderHomePromoBlocksSection({ locale }) {
  const { blocks, media } = loadHomePromoBlocks(locale);
  if (!blocks?.crash?.headingHtml) return '';

  return `<section class="home-promo-blocks" id="native-home-promo-blocks">
  <div class="home-promo-blocks__inner">
    ${renderCrashBlock(blocks, media)}
    ${renderRusPokerBlock(blocks, media)}
  </div>
</section>
${AUTOPLAY_SCRIPT}`;
}
