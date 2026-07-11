/**
 * Fixes CRASH / Russian-Poker promo blocks: autoplay, poster, scoped layout CSS.
 * See patches/pppoker-patches.md section 5.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import { load } from 'cheerio';

import { LEGACY_IGNORE } from './known-legacy-issues.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WRITE = process.argv.includes('--write');

/** EN/UZ home templates (page 2 / 3118). */
const PROMO_BLOCK_SETS = [
  {
    crashContainerId: '1d32d75',
    crashVideoWidgetId: '4b1e144',
    rusPokerContainerId: 'bdac5ec',
    rusPokerVideoWidgetIds: ['12fb3b3', 'cf08ea1'],
    /** DOM order: heading then video (EN/UZ). */
    crashMediaFirst: false,
  },
  /** RU/HY home template — video before CRASH text; rus-poker text before image. */
  {
    crashContainerId: '3e378e0',
    crashVideoWidgetId: '3947f6a',
    rusPokerContainerId: '5fb647f',
    rusPokerVideoWidgetIds: ['99a8a38', 'd742303'],
    crashMediaFirst: true,
  },
  /** KZ home template (page 3116). */
  {
    crashContainerId: 'db11841',
    crashVideoWidgetId: '2dc7ec4',
    rusPokerContainerId: '8982bde',
    rusPokerVideoWidgetIds: [],
    crashMediaFirst: false,
  },
];

const RUS_POKER_POSTER = '/assets/media/2025/12/photo_2025-12-06_22-22-37-918x1024.webp';
const CRASH_POSTER = '/assets/media/2025/12/turbo.webp';
const CRASH_VIDEO_SRC = '/assets/media/2025/12/video_2025-12-06_19-00-19-v2.mp4';
const SCOPED_STYLE_ID = 'promo-video-block-fix';
const AUTOPLAY_SCRIPT_ID = 'promo-crash-autoplay';
const CRASH_AUTOPLAY_ATTR = 'data-promo-crash-autoplay';
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
    if (playPromise && playPromise.then) {
      playPromise.then(function () {
        video.removeAttribute('poster');
      }).catch(function () {});
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

function scopedStyleFor(set) {
  const { crashContainerId, rusPokerContainerId, crashMediaFirst } = set;
  const crashHeadingOrder = crashMediaFirst ? 2 : 1;
  const crashVideoOrder = crashMediaFirst ? 1 : 2;

  return `
  .elementor-element-${crashContainerId} .e-con-inner,
  .elementor-element-${rusPokerContainerId} .e-con-inner {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 32px;
  }
  .elementor-element-${crashContainerId} .elementor-widget-heading,
  .elementor-element-${rusPokerContainerId} .elementor-widget-heading {
    flex: 1 1 420px;
    max-width: 520px;
  }
  .elementor-element-${crashContainerId} .elementor-widget-heading .elementor-heading-title,
  .elementor-element-${rusPokerContainerId} .elementor-widget-heading .elementor-heading-title {
    font-size: 16px;
    line-height: 1.55;
  }
  .elementor-element-${crashContainerId} .elementor-widget-video,
  .elementor-element-${rusPokerContainerId} .elementor-widget-video,
  .elementor-element-${rusPokerContainerId} .elementor-widget-image {
    flex: 1 1 320px;
    max-width: 360px;
  }
  .elementor-element-${crashContainerId} video,
  .elementor-element-${rusPokerContainerId} video,
  .elementor-element-${rusPokerContainerId} img {
    width: 100%;
    height: auto;
    border-radius: 12px;
    display: block;
  }
  video.promo-crash-video {
    object-fit: cover;
    background: #0a0d14;
  }

  @media (max-width: 767px) {
    .elementor-element-${crashContainerId} .e-con-inner,
    .elementor-element-${rusPokerContainerId} .e-con-inner {
      flex-direction: column;
      flex-wrap: nowrap;
      gap: 1.5rem;
    }
    .elementor-element-${crashContainerId} .elementor-widget-heading,
    .elementor-element-${rusPokerContainerId} .elementor-widget-heading,
    .elementor-element-${crashContainerId} .elementor-widget-video,
    .elementor-element-${rusPokerContainerId} .elementor-widget-video,
    .elementor-element-${rusPokerContainerId} .elementor-widget-image {
      flex: 0 0 auto;
      max-width: 100%;
      width: 100%;
    }
    .elementor-element-${crashContainerId} .elementor-widget-heading { order: ${crashHeadingOrder}; }
    .elementor-element-${crashContainerId} .elementor-widget-video { order: ${crashVideoOrder}; }
    .elementor-element-${rusPokerContainerId} {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(253, 230, 97, 0.12);
    }
    .elementor-element-${rusPokerContainerId} .elementor-widget-image { order: 1; }
    .elementor-element-${rusPokerContainerId} .elementor-widget-heading { order: 2; }
    .elementor-element-${rusPokerContainerId} .elementor-widget-video { order: 3; }
  }`;
}

function combinedScopedStyle(matchingSets) {
  return `<style id="${SCOPED_STYLE_ID}">${matchingSets.map(scopedStyleFor).join('\n')}\n</style>`;
}

function injectScopedStyle($, matchingSets) {
  $(`#${SCOPED_STYLE_ID}`).remove();
  const firstContainer = matchingSets
    .map((set) => $(`.elementor-element-${set.crashContainerId}`).first())
    .find((el) => el.length);
  if (!firstContainer?.length) return false;
  firstContainer.before(combinedScopedStyle(matchingSets));
  return true;
}

function injectAutoplayScript($) {
  $(`#${AUTOPLAY_SCRIPT_ID}`).remove();
  $('body').append(AUTOPLAY_SCRIPT);
  return true;
}

async function findLegacyHtmlFiles() {
  return glob('**/index.html', {
    cwd: rootDir,
    nodir: true,
    ignore: [...LEGACY_IGNORE, 'apps/web/**', 'assets/**', 'content/**'],
  });
}

function cleanOptimizerAttrs(video) {
  for (const attr of Object.keys(video.attr() ?? {})) {
    if (attr.startsWith('data-od-') || attr === 'data-original-autoplay' || attr === 'data-original-preload') {
      video.removeAttr(attr);
    }
  }
  video.removeClass('od-lazy-video');
}

function normalizeHostedVideo(video, src) {
  video.attr('src', src);
  video.find('source').remove();
}

function fixCrashVideo($, set, notes) {
  const container = $(`.elementor-element-${set.crashContainerId}`);
  if (!container.length) return false;
  const video = container.find(`.elementor-element-${set.crashVideoWidgetId} video`).first();
  if (!video.length) return false;

  cleanOptimizerAttrs(video);
  normalizeHostedVideo(video, CRASH_VIDEO_SRC);
  video.removeAttr('controls');
  video.removeClass('elementor-video');
  video.addClass('promo-crash-video');
  video.attr(CRASH_AUTOPLAY_ATTR, '');
  video.attr('autoplay', '');
  video.attr('muted', 'muted');
  video.attr('playsinline', '');
  video.attr('loop', '');
  // preload=none: the 3.4MB clip is fetched only when the block nears
  // the viewport (see AUTOPLAY_SCRIPT's IntersectionObserver).
  video.attr('preload', 'none');
  if (!video.attr('poster')) {
    video.attr('poster', CRASH_POSTER);
    notes.push(`CRASH video poster set to ${CRASH_POSTER}`);
  }
  return true;
}

function fixRusPokerVideos($, set) {
  const container = $(`.elementor-element-${set.rusPokerContainerId}`);
  if (!container.length) return false;
  let changed = false;
  container.find('video').each((_, el) => {
    const video = $(el);
    cleanOptimizerAttrs(video);
    video.attr('preload', 'metadata');
    if (!video.attr('poster')) {
      video.attr('poster', RUS_POKER_POSTER);
    }
    video.attr('playsinline', '');
    changed = true;
  });
  return changed;
}

function stripDeadLazyVideoScript($) {
  let removed = false;
  $('script').each((_, el) => {
    const text = $(el).html() ?? '';
    if (text.includes('lazyVideoObserver') && text.includes('video.od-lazy-video')) {
      $(el).remove();
      removed = true;
    }
  });
  return removed;
}

function fileHasPromoBlocks(html) {
  return PROMO_BLOCK_SETS.some(
    (set) =>
      html.includes(set.crashContainerId) || html.includes(set.rusPokerContainerId),
  );
}

async function main() {
  const files = await findLegacyHtmlFiles();
  const report = [];

  for (const relativePath of files) {
    const fullPath = path.join(rootDir, relativePath);
    const original = await fs.readFile(fullPath, 'utf8');

    const $ = load(original, { decodeEntities: false });
    const notes = [];
    let crashFixed = false;
    let rusFixed = false;
    let styleInjected = false;
    let scriptInjected = false;
    let lazyScriptRemoved = stripDeadLazyVideoScript($);

    if (fileHasPromoBlocks(original)) {
      const matchingSets = PROMO_BLOCK_SETS.filter(
        (set) =>
          original.includes(set.crashContainerId) || original.includes(set.rusPokerContainerId),
      );

      for (const set of matchingSets) {
        if (fixCrashVideo($, set, notes)) crashFixed = true;
        if (fixRusPokerVideos($, set)) rusFixed = true;
      }

      if (matchingSets.length && injectScopedStyle($, matchingSets)) {
        styleInjected = true;
      }

      if (crashFixed && injectAutoplayScript($)) {
        scriptInjected = true;
      }
    }

    if (crashFixed || rusFixed || styleInjected || scriptInjected || lazyScriptRemoved) {
      report.push({ file: relativePath, crashFixed, rusFixed, styleInjected, scriptInjected, lazyScriptRemoved, notes });
      if (WRITE) {
        await fs.writeFile(fullPath, $.html(), 'utf8');
      }
    }
  }

  if (!report.length) {
    console.log('No promo-video-block instances found.');
    return;
  }

  console.log(`${WRITE ? 'Applied' : 'Would apply'} fixes in ${report.length} file(s):\n`);
  for (const row of report) {
    console.log(`  ${row.file}`);
    if (row.crashFixed) console.log('    - restored autoplay/muted/playsinline on the CRASH video');
    if (row.rusFixed) console.log('    - added poster + preload=metadata to the Russian Poker videos');
    if (row.styleInjected) console.log('    - injected scoped style to match text/media column widths');
    if (row.scriptInjected) console.log('    - appended Elementor-safe CRASH autoplay script to body');
    if (row.lazyScriptRemoved) console.log('    - removed dead od-lazy-video observer script');
    for (const note of row.notes) console.log(`    - ${note}`);
  }

  if (!WRITE) {
    console.log('\nDry run only — re-run with --write to apply.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
