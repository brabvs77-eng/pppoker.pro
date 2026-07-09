# pppoker.pro — патчи (P0), единый файл

Ниже — всё содержимое патч-набора в одном файле. Скопируйте каждый блок кода
в файл по указанному пути в репозитории `pppoker.pro` (два новых файла + два
точечных диффа в существующие файлы).

---

## 1. Инструкция и диффы (`patches/README.md`)

# Патчи для pppoker.pro — техническая гигиена (P0)

Как применить: скопируйте два новых файла в репозиторий по указанным путям,
внесите два точечных изменения в существующие файлы (см. диффы ниже), закоммитьте.

Патчи написаны как **кодмоды** (скрипты, а не ручные правки внутри 40+ HTML-файлов
легаси-экспорта) — потому что `index.html`, `__qs/index.html`, `agenty-v-pokere/index.html`
и остальные экспортированные страницы регенерируются при следующей выгрузке из
WordPress/Elementor. Патч в `scripts/` переживёт переэкспорт; ручная правка одного
файла — нет.

### Новый файл: `scripts/patches/known-legacy-issues.mjs`
Общий список сигнатур для кодмода и для аудита — единый источник правды. Содержимое — в разделе 2 ниже.

### Новый файл: `scripts/patches/fix-legacy-html.mjs`
Кодмод, который проходит по легаси-экспорту (`*.html` кроме `node_modules`,
`apps/web`, `assets`, `content`) и:

- удаляет узлы с текстом-рыбой ("Идейные соображения высшего порядка…");
- приводит путь к флагу KZ к тому же виду, что у остальных 4 языков
  (`/assets/vendor/sitepress-multilingual-cms/res/flags/kz.png` — этот файл
  реально существует в репозитории, в отличие от того, что написано в
  `OPTIMIZATION_REPORT.md` про удаление `assets/vendor`);
- заменяет оставшиеся ссылки на `but-back.png` **и** на `maxresdefault.jpg`
  (фото Романа Шапошникова в отзывах) на уже существующие `.webp` — оба webp-файла
  реально лежат в репозитории рядом с оригиналами, просто не все вхождения
  разметки на них переключили (у второго отзыва, Занозина, точно такой же
  фото-виджет уже использует `.webp` — несогласованность видна невооружённым глазом);
- **только детектирует и логирует** (не трогает автоматически) блоки с
  англоязычным текстом всплывающих окон бонуса/джекпота на русских страницах —
  автоматическое удаление рискованно без ручной проверки DOM-структуры каждого
  попапа, это ручной финальный шаг, см. раздел 4 ниже.

Запуск (dry-run по умолчанию, ничего не пишет на диск):
```bash
node scripts/patches/fix-legacy-html.mjs
```
Применить изменения:
```bash
node scripts/patches/fix-legacy-html.mjs --write
```

### Правка существующего файла: `package.json`

Добавить скрипт (рядом с `audit:rudiments`):

```diff
     "audit:rudiments": "node scripts/audit-rudiments.mjs",
+    "audit:legacy-html": "node scripts/patches/fix-legacy-html.mjs",
+    "fix:legacy-html": "node scripts/patches/fix-legacy-html.mjs --write",
```

И в цепочку `build:next`, сразу после `audit:rudiments`, чтобы билд падал при
регрессии (рыба/флаг/png вернутся — сборка остановится):

```diff
- ... && npm run audit:rudiments && npm run verify:build-pipeline && ...
+ ... && npm run audit:rudiments && npm run audit:legacy-html && npm run verify:build-pipeline && ...
```

### Правка существующего файла: `scripts/audit-rudiments.mjs`

Добавить импорт и проверку текстовых сигнатур, используя тот же список, что и
в кодмоде, чтобы регрессия ловилась в CI даже если кто-то забудет прогнать
кодмод вручную.

```diff
 import { promises as fs } from 'node:fs';
 import path from 'node:path';
 import { fileURLToPath } from 'node:url';

 import { glob } from 'glob';
+
+import { RUDIMENT_TEXT_PATTERNS } from './patches/known-legacy-issues.mjs';

 const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
```

```diff
   const rootPkg = JSON.parse(await fs.readFile(path.join(rootDir, 'package.json'), 'utf8'));
   for (const dep of ['react', 'react-dom', 'sharp']) {
     if (rootPkg.dependencies?.[dep]) {
       violations.push(`Root package.json should not depend on ${dep}`);
     }
   }

+  // Placeholder / "рыба" text left over from the WordPress export must never reach content/.
+  const legacyHtmlFiles = await glob('**/index.html', {
+    cwd: rootDir,
+    nodir: true,
+    ignore: ['node_modules/**', 'apps/web/**', 'assets/**', 'content/**'],
+  });
+  for (const relativePath of legacyHtmlFiles) {
+    const html = await fs.readFile(path.join(rootDir, relativePath), 'utf8');
+    for (const pattern of RUDIMENT_TEXT_PATTERNS) {
+      if (html.includes(pattern)) {
+        violations.push(`Placeholder/rudiment text "${pattern.slice(0, 40)}…" found in ${relativePath}`);
+      }
+    }
+  }
+
   for (const script of ['build:legacy-react', 'migrate:react']) {
```

---

## 2. Новый файл: `scripts/patches/known-legacy-issues.mjs`

```js
/**
 * Single source of truth for known legacy-export defects.
 * Used by scripts/patches/fix-legacy-html.mjs (codemod) and
 * scripts/audit-rudiments.mjs (CI guard) so both stay in sync.
 */

/** Placeholder / lorem-style text accidentally left in production pages. */
export const RUDIMENT_TEXT_PATTERNS = [
  'Идейные соображения высшего порядка',
];

/** The two flag-path conventions found in the legacy export; KZ should match the rest. */
export const FLAG_PATH_FIX = {
  wrong: '/assets/media/flags/kz.png',
  correct: '/assets/vendor/sitepress-multilingual-cms/res/flags/kz.png',
};

/** Raster button image that should have been fully migrated to WebP. */
export const BUTTON_ASSET_FIX = {
  wrong: '/assets/media/2024/07/but-back.png',
  correct: '/assets/media/2024/07/but-back.webp',
};

/**
 * Other raster images referenced directly in the legacy export even though a
 * WebP sibling already exists in the repo (verified file-by-file, not
 * guessed) — the WebP migration just never reached this specific markup.
 * Example: the Роман Шапошников testimonial photo still points at
 * maxresdefault.jpg (85KB) while maxresdefault.webp (41KB) sits right next
 * to it, already generated for the OTHER testimonial photo on the same page.
 */
export const RASTER_TO_WEBP_FIXES = [
  BUTTON_ASSET_FIX,
  {
    wrong: '/assets/media/2024/07/maxresdefault.jpg',
    correct: '/assets/media/2024/07/maxresdefault.webp',
  },
];

/**
 * English strings observed inside RU-locale popups (bonus / jackpot).
 * NOT auto-removed by the codemod — flagged for manual review because the
 * surrounding DOM structure (which ancestor to delete) hasn't been verified
 * file-by-file. See section 4 below.
 */
export const EN_DUPLICATE_ON_RU_PATTERNS = [
  'First deposit bonus of 150% up to 500 dollars',
  'Make a deposit in the club for the first time',
  'If players reveal four-in-one versus four-in-one',
  'The bonus is credited only on the FIRST deposit',
];
```

---

## 3. Новый файл: `scripts/patches/fix-legacy-html.mjs`

```js
/**
 * Codemod: cleans up known legacy-export defects across the WordPress/Elementor
 * static HTML that scripts/extract-content.mjs reads from.
 *
 * Safe, deterministic fixes (applied automatically with --write):
 *   1. Remove placeholder/"рыба" text nodes (RUDIMENT_TEXT_PATTERNS).
 *   2. Unify the KZ flag path with the other 4 locale flags.
 *   3. Swap remaining raster references (but-back.png, maxresdefault.jpg) to their already-generated .webp.
 *
 * Detection-only (never auto-modified — see section 4 in patches/README):
 *   4. English-language popup copy present on RU-locale pages.
 *
 * Usage:
 *   node scripts/patches/fix-legacy-html.mjs            # dry run, prints a report
 *   node scripts/patches/fix-legacy-html.mjs --write     # applies 1–3 and rewrites files
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import { load } from 'cheerio';

import {
  RUDIMENT_TEXT_PATTERNS,
  FLAG_PATH_FIX,
  RASTER_TO_WEBP_FIXES,
  EN_DUPLICATE_ON_RU_PATTERNS,
} from './known-legacy-issues.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WRITE = process.argv.includes('--write');

async function findLegacyHtmlFiles() {
  return glob('**/index.html', {
    cwd: rootDir,
    nodir: true,
    ignore: ['node_modules/**', 'apps/web/**', 'assets/**', 'content/**'],
  });
}

function stripRudimentNodes($) {
  let removed = 0;
  for (const phrase of RUDIMENT_TEXT_PATTERNS) {
    $('h1,h2,h3,h4,h5,h6,p').each((_, el) => {
      const text = $(el).text().trim();
      if (text.startsWith(phrase)) {
        $(el).remove();
        removed += 1;
      }
    });
  }
  return removed;
}

function fixFlagPath(html) {
  const count = html.split(FLAG_PATH_FIX.wrong).length - 1;
  return { html: html.split(FLAG_PATH_FIX.wrong).join(FLAG_PATH_FIX.correct), count };
}

function fixRasterToWebp(html) {
  let count = 0;
  for (const fix of RASTER_TO_WEBP_FIXES) {
    count += html.split(fix.wrong).length - 1;
    html = html.split(fix.wrong).join(fix.correct);
  }
  return { html, count };
}

function detectEnDuplicates(html, isRu) {
  if (!isRu) return [];
  return EN_DUPLICATE_ON_RU_PATTERNS.filter((phrase) => html.includes(phrase));
}

function looksLikeRuLocale(relativePath) {
  const firstSegment = relativePath.split('/')[0];
  return !['en', 'uz', 'kz', 'hy', 'tj'].includes(firstSegment);
}

async function main() {
  const files = await findLegacyHtmlFiles();
  const report = [];

  for (const relativePath of files) {
    const fullPath = path.join(rootDir, relativePath);
    const original = await fs.readFile(fullPath, 'utf8');

    const $ = load(original, { decodeEntities: false });
    const rudimentsRemoved = stripRudimentNodes($);
    let html = $.html();

    const flagFix = fixFlagPath(html);
    html = flagFix.html;

    const buttonFix = fixRasterToWebp(html);
    html = buttonFix.html;

    const enDuplicates = detectEnDuplicates(original, looksLikeRuLocale(relativePath));

    const changed = rudimentsRemoved > 0 || flagFix.count > 0 || buttonFix.count > 0;

    if (changed || enDuplicates.length) {
      report.push({
        file: relativePath,
        rudimentsRemoved,
        flagPathFixes: flagFix.count,
        buttonAssetFixes: buttonFix.count,
        enDuplicatesFound: enDuplicates.length,
      });
    }

    if (changed && WRITE) {
      await fs.writeFile(fullPath, html, 'utf8');
    }
  }

  if (!report.length) {
    console.log('No known legacy-export defects found.');
    return;
  }

  console.log(`${WRITE ? 'Applied' : 'Would apply'} fixes in ${report.length} file(s):\n`);
  for (const row of report) {
    console.log(`  ${row.file}`);
    if (row.rudimentsRemoved) console.log(`    - removed ${row.rudimentsRemoved} placeholder text node(s)`);
    if (row.flagPathFixes) console.log(`    - fixed ${row.flagPathFixes} KZ flag path reference(s)`);
    if (row.buttonAssetFixes) console.log(`    - swapped ${row.buttonAssetFixes} raster reference(s) to their existing .webp`);
    if (row.enDuplicatesFound) {
      console.log(
        `    - ⚠ MANUAL REVIEW: ${row.enDuplicatesFound} English popup string(s) found on what looks like an RU page — not auto-removed, see patches/README section 4`,
      );
    }
  }

  if (!WRITE) {
    console.log('\nDry run only — re-run with --write to apply fixes 1–3.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## 4. Ручной шаг: англоязычные попапы на RU-страницах

Кодмод (`fix-legacy-html.mjs`) **находит, но не удаляет** английские блоки
бонуса/джекпота на русских страницах — их DOM-структуру нужно проверить глазами
перед удалением, чтобы не задеть соседний нужный контент.

Что делать:

1. Прогнать `node scripts/patches/fix-legacy-html.mjs` (без `--write`) — он
   выведет список файлов с `⚠ MANUAL REVIEW`.
2. Открыть каждый файл, найти по одной из строк из `EN_DUPLICATE_ON_RU_PATTERNS`
   (например `"First deposit bonus of 150% up to 500 dollars"`).
3. Определить ближайший общий родительский элемент этого англоязычного блока
   (обычно `elementor-element` с собственным `data-id`) и удалить именно его —
   не более широкий контейнер, где рядом лежит нужный RU-блок того же попапа.
4. После правки прогнать `npm run build` и визуально сверить попап бонуса и
   джекпота на `/` — должен остаться только русский текст.

Если этот паттерн повторяется на многих страницах и структура одинаковая
(один и тот же `data-id` виджета) — стоит завести отдельный кодмод с точным
CSS-селектором после первой ручной проверки, а не гадать сейчас.

---

## 5. Блок CRASH / Русский покер на `/en/` — новый файл `scripts/patches/fix-promo-video-blocks.mjs`

Разобрал реальную разметку блока (`en/index.html`, контейнеры `data-id="1d32d75"`
и `data-id="bdac5ec"`, ниже FAQ). Нашёл три конкретные причины того, что видите:

- **Текст и видео/картинка не подогнаны по размеру** — у обоих grid-контейнеров
  нет ни явной ширины колонок, ни переопределения размера шрифта для этого
  длинного emoji-текста в Elementor (в отличие от почти всех остальных
  элементов страницы, у которых есть собственный CSS-блок с `font-size` —
  у `745ef5c` и `3206b23` такого блока просто нет). Из-за этого блок вёрстается
  на голых дефолтах и текст с видео получаются несопоставимых пропорций.
- **Видео CRASH не автозапускается**, хотя виджет настроен как
  `"autoplay":"yes","mute":"yes"` — в самом `<video>` атрибут `autoplay`
  отсутствует, а в разметке рядом стоит `data-od-removed-autoplay=""`: судя по
  всему, его вырезал сторонний оптимизатор/прокси при обработке экспорта.
  Настройка виджета и фактический тег разошлись.
- **Ни у одного из трёх `<video>` нет `poster`** — до нажатия play показывается
  чёрный кадр вместо превью.

Кодмод (dry-run по умолчанию, ничего не пишет на диск):
```bash
node scripts/patches/fix-promo-video-blocks.mjs
```
Применить:
```bash
node scripts/patches/fix-promo-video-blocks.mjs --write
```

Что делает автоматически:
1. Возвращает `autoplay`/`muted`/`playsinline` видео CRASH и ставит `preload="auto"` (нужно браузеру для автозапуска).
2. Для обоих видео "Русский покер" ставит `preload="metadata"` и `poster="/assets/media/2025/12/photo_2025-12-06_22-22-37-918x1024.webp"` — эта фотография уже лежит в том же блоке, поэтому её же переиспользуем как превью для видео.
3. Добавляет один scoped `<style>` перед блоком: текстовая колонка — `max-width:520px` и `font-size:16px` вместо дефолтного крупного заголовка; колонка видео/картинки — `max-width:360px`, `width:100%` — теперь текст и медиа сопоставимы по размеру на любой ширине экрана.

Что делает **только вручную** (см. предупреждение `⚠` в выводе скрипта):
у видео CRASH до сих пор нет своего кадра-превью — такого файла нет в
`assets/media/2025/12/`. Нужно вручную выгрузить один кадр из
`video_2025-12-06_19-00-19.mp4` (например через `ffmpeg -ss 00:00:01 -i video_2025-12-06_19-00-19.mp4 -frames:v 1 video_2025-12-06_19-00-19-poster.jpg`), положить рядом и добавить `poster="/assets/media/2025/12/video_2025-12-06_19-00-19-poster.jpg"` — заменить готовым кадром лучше, чем ничем не подкреплённым автозапуском.

```js
/**
 * Codemod: fixes the CRASH / Russian-Poker promo block (below the FAQ, above
 * the blog list) across every locale's legacy export:
 *   - text (long emoji-heavy announcement) and video/image were never given
 *     matching widths — the heading grid item has no explicit column width or
 *     font-size override, so it renders far larger/smaller than the video
 *     next to it depending on viewport.
 *   - the CRASH video's <video> tag lost its `autoplay`/`muted`/`playsinline`
 *     attributes (an optimizer pass added `data-od-removed-autoplay=""`),
 *     so despite the Elementor widget being configured with
 *     `"autoplay":"yes","mute":"yes"`, the rendered tag never autoplays.
 *   - none of the three videos have a `poster`; first frame is blank until
 *     the visitor presses play.
 *
 * Safe with --write: attribute fixes + a small scoped <style> block.
 * Fully automatic — these are known, stable element IDs shared by the
 * duplicated Elementor container across locales (`1d32d75` / `bdac5ec`),
 * not free-text matching.
 *
 * Usage:
 *   node scripts/patches/fix-promo-video-blocks.mjs            # dry run
 *   node scripts/patches/fix-promo-video-blocks.mjs --write    # applies fixes
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import { load } from 'cheerio';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WRITE = process.argv.includes('--write');

// data-id of the two grid containers, and of the 3 <video> widgets inside them.
const CRASH_CONTAINER_ID = '1d32d75';
const CRASH_VIDEO_WIDGET_ID = '4b1e144';
const RUS_POKER_CONTAINER_ID = 'bdac5ec';
const RUS_POKER_VIDEO_WIDGET_IDS = ['12fb3b3', 'cf08ea1'];

// Existing still image already shipped for the Russian Poker announcement —
// reused as a <video poster> so both clips show a real frame instead of black.
const RUS_POKER_POSTER = '/assets/media/2025/12/photo_2025-12-06_22-22-37-918x1024.webp';

const SCOPED_STYLE_ID = 'promo-video-block-fix';
const SCOPED_STYLE = `
<style id="${SCOPED_STYLE_ID}">
  .elementor-element-${CRASH_CONTAINER_ID} .e-con-inner,
  .elementor-element-${RUS_POKER_CONTAINER_ID} .e-con-inner {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 32px;
  }
  .elementor-element-${CRASH_CONTAINER_ID} .elementor-widget-heading,
  .elementor-element-${RUS_POKER_CONTAINER_ID} .elementor-widget-heading {
    flex: 1 1 420px;
    max-width: 520px;
  }
  .elementor-element-${CRASH_CONTAINER_ID} .elementor-widget-heading .elementor-heading-title,
  .elementor-element-${RUS_POKER_CONTAINER_ID} .elementor-widget-heading .elementor-heading-title {
    font-size: 16px;
    line-height: 1.55;
  }
  .elementor-element-${CRASH_CONTAINER_ID} .elementor-widget-video,
  .elementor-element-${RUS_POKER_CONTAINER_ID} .elementor-widget-video,
  .elementor-element-${RUS_POKER_CONTAINER_ID} .elementor-widget-image {
    flex: 1 1 320px;
    max-width: 360px;
  }
  .elementor-element-${CRASH_CONTAINER_ID} video,
  .elementor-element-${RUS_POKER_CONTAINER_ID} video,
  .elementor-element-${RUS_POKER_CONTAINER_ID} img {
    width: 100%;
    height: auto;
    border-radius: 12px;
    display: block;
  }
</style>`;

async function findLegacyHtmlFiles() {
  return glob('**/index.html', {
    cwd: rootDir,
    nodir: true,
    ignore: ['node_modules/**', 'apps/web/**', 'assets/**', 'content/**'],
  });
}

function fixCrashVideo($, notes) {
  const container = $(`.elementor-element-${CRASH_CONTAINER_ID}`);
  if (!container.length) return false;
  const video = container.find(`.elementor-element-${CRASH_VIDEO_WIDGET_ID} video`).first();
  if (!video.length) return false;

  video.attr('autoplay', '');
  video.attr('muted', 'muted');
  video.attr('playsinline', '');
  video.attr('preload', 'auto');
  if (!video.attr('poster')) {
    notes.push(
      'CRASH video has no poster — no frame still exists yet for it; export one from the clip (e.g. video_2025-12-06_19-00-19-poster.jpg) and add poster="/assets/media/2025/12/video_2025-12-06_19-00-19-poster.jpg".',
    );
  }
  return true;
}

function fixRusPokerVideos($, notes) {
  const container = $(`.elementor-element-${RUS_POKER_CONTAINER_ID}`);
  if (!container.length) return false;
  let changed = false;
  for (const widgetId of RUS_POKER_VIDEO_WIDGET_IDS) {
    const video = container.find(`.elementor-element-${widgetId} video`).first();
    if (!video.length) continue;
    video.attr('preload', 'metadata');
    if (!video.attr('poster')) {
      video.attr('poster', RUS_POKER_POSTER);
    }
    video.attr('playsinline', '');
    changed = true;
  }
  return changed;
}

function injectScopedStyle($) {
  if ($(`#${SCOPED_STYLE_ID}`).length) return false;
  const container = $(`.elementor-element-${CRASH_CONTAINER_ID}, .elementor-element-${RUS_POKER_CONTAINER_ID}`).first();
  if (!container.length) return false;
  container.before(SCOPED_STYLE);
  return true;
}

async function main() {
  const files = await findLegacyHtmlFiles();
  const report = [];

  for (const relativePath of files) {
    const fullPath = path.join(rootDir, relativePath);
    const original = await fs.readFile(fullPath, 'utf8');
    if (!original.includes(CRASH_CONTAINER_ID) && !original.includes(RUS_POKER_CONTAINER_ID)) continue;

    const $ = load(original, { decodeEntities: false });
    const notes = [];
    const crashFixed = fixCrashVideo($, notes);
    const rusFixed = fixRusPokerVideos($, notes);
    const styleInjected = injectScopedStyle($);

    if (crashFixed || rusFixed || styleInjected) {
      report.push({ file: relativePath, crashFixed, rusFixed, styleInjected, notes });
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
    for (const note of row.notes) console.log(`    - ⚠ ${note}`);
  }

  if (!WRITE) {
    console.log('\nDry run only — re-run with --write to apply.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Добавить в `package.json` (рядом с остальными `fix:*`):
```diff
     "fix:legacy-html": "node scripts/patches/fix-legacy-html.mjs --write",
+    "fix:promo-video-blocks": "node scripts/patches/fix-promo-video-blocks.mjs --write",
+    "fix:orphaned-popup-duplicates": "node scripts/patches/fix-orphaned-popup-duplicates.mjs --write",
```

---

## 6. Настоящая причина «английского текста поверх RU» — новый файл `scripts/patches/fix-orphaned-popup-duplicates.mjs`

Раскопал разметку `index.html` до конца (попапы бонуса/джекпота, id 3981/3989/3946/3997)
и нашёл техническую причину — она **не** в переводе и **не** в WPML-локали, а в
дублировании DOM:

```
<style id="elementor-post-886">…</style>
<div class="elementor-element … e-parent" data-id="d04e997">…(тот же контент)…</div>   ← "осиротевшая" копия, ничем не скрыта
<div data-elementor-type="popup" data-elementor-id="3989" class="… elementor-886 elementor-location-popup">
  <div class="elementor-element … e-parent" data-id="d04e997">…(тот же контент)…</div>  ← настоящий попап, скрыт до клика
</div>
```

Перед КАЖДЫМ из 4 попапов (`3989`, `3946`, `3981`, `3997`) в `index.html` лежит
побитовая копия его содержимого, но **без** обёртки `data-elementor-type="popup"` —
то есть она рендерится сразу, как обычный видимый контент страницы, а не
скрытый попап. Судя по обилию атрибутов `data-od-added-*` / `data-od-removed-*`
/ `data-od-replaced-*` по всему файлу, это, вероятнее всего, побочный эффект
стороннего прокси/оптимизатора, обрабатывавшего DOM при экспорте.

Именно эта "осиротевшая" копия и есть тот самый видимый на странице
англоязычный текст бонуса/джекпота — попапы `3989`/`3946` действительно на
английском (это отдельная тема WPML-локализации, см. ниже), но проблема
конкретно "текст виден без клика" — чисто техническая: копия ничем не скрыта.

Кодмод убирает **только** осиротевшую копию — по структурному совпадению
`data-id` с первым потомком попапа, без сопоставления текста, так что не
зависит от языка/копирайтинга и безопасен при любых будущих правках текста.
Сам `<style id="elementor-post-…">` не трогает (он всё ещё нужен настоящему
попапу — использует те же классы).

```bash
node scripts/patches/fix-orphaned-popup-duplicates.mjs           # dry run
node scripts/patches/fix-orphaned-popup-duplicates.mjs --write   # применить
```

```js
/**
 * Codemod: removes ORPHANED duplicate popup content sitting loose in the page
 * body, next to the properly-wrapped Elementor popup.
 *
 * Root cause found by inspecting the real markup (index.html, popup ids
 * 3981 / 3989 / 3997 — bonus & jackpot popups): for each
 *   <div data-elementor-type="popup" data-elementor-id="…">
 *     <div class="elementor-element … e-parent" data-id="d04e997">…</div>
 *   </div>
 * there is an IDENTICAL bare `<div class="elementor-element … e-parent"
 * data-id="d04e997">…</div>` sitting as the popup's PREVIOUS sibling,
 * completely unwrapped — no popup container, no hidden-until-triggered
 * behaviour. That orphan renders inline in the normal page flow, which is
 * exactly the "English bonus/jackpot text appears on the Russian homepage"
 * symptom: it's not a translation bug, it's a stray duplicate node (most
 * likely left behind by the `data-od-*` DOM-rewriting proxy visible all over
 * this export — see the `data-od-added-*` / `data-od-removed-*` attributes).
 *
 * This codemod removes ONLY the orphan: it never touches the `<style
 * id="elementor-post-…">` block (the real popup still needs those rules —
 * it shares the same `.elementor-886`-style class) and never touches the
 * properly-wrapped `[data-elementor-type="popup"]` element itself.
 *
 * Matching rule (structural, not text-based — safe against copy changes):
 *   for every [data-elementor-type="popup"] element P,
 *   if P's previous sibling is a bare `.elementor-element.e-parent[data-id]`
 *   with the SAME data-id as P's first child, and that sibling does NOT
 *   itself carry data-elementor-type — it's an orphan duplicate. Remove it.
 *
 * Usage:
 *   node scripts/patches/fix-orphaned-popup-duplicates.mjs           # dry run
 *   node scripts/patches/fix-orphaned-popup-duplicates.mjs --write   # applies
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import { load } from 'cheerio';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WRITE = process.argv.includes('--write');

async function findLegacyHtmlFiles() {
  return glob('**/index.html', {
    cwd: rootDir,
    nodir: true,
    ignore: ['node_modules/**', 'apps/web/**', 'assets/**', 'content/**'],
  });
}

function removeOrphanedPopupDuplicates($) {
  let removed = 0;
  const removedIds = [];

  $('[data-elementor-type="popup"]').each((_, popupEl) => {
    const popup = $(popupEl);
    const firstChild = popup.children('.elementor-element.e-parent[data-id]').first();
    if (!firstChild.length) return;

    const dataId = firstChild.attr('data-id');
    const prev = popup.prev();
    if (!prev.length) return;
    if (!prev.hasClass('elementor-element') || !prev.hasClass('e-parent')) return;
    if (prev.attr('data-elementor-type')) return; // that would be a real popup, not an orphan
    if (prev.attr('data-id') !== dataId) return;

    removedIds.push({ dataId, popupId: popup.attr('data-elementor-id') });
    prev.remove();
    removed += 1;
  });

  return { removed, removedIds };
}

async function main() {
  const files = await findLegacyHtmlFiles();
  const report = [];

  for (const relativePath of files) {
    const fullPath = path.join(rootDir, relativePath);
    const original = await fs.readFile(fullPath, 'utf8');
    if (!original.includes('data-elementor-type="popup"')) continue;

    const $ = load(original, { decodeEntities: false });
    const { removed, removedIds } = removeOrphanedPopupDuplicates($);

    if (removed > 0) {
      report.push({ file: relativePath, removed, removedIds });
      if (WRITE) {
        await fs.writeFile(fullPath, $.html(), 'utf8');
      }
    }
  }

  if (!report.length) {
    console.log('No orphaned popup duplicates found.');
    return;
  }

  console.log(`${WRITE ? 'Removed' : 'Would remove'} orphaned popup duplicates in ${report.length} file(s):\n`);
  for (const row of report) {
    console.log(`  ${row.file} — ${row.removed} orphan(s)`);
    for (const { dataId, popupId } of row.removedIds) {
      console.log(`    - data-id="${dataId}" (duplicate of popup ${popupId})`);
    }
  }

  if (!WRITE) {
    console.log('\nDry run only — re-run with --write to apply.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Отдельно, за пределами этого патча: два языка одного попапа на одной странице

`index.html` (RU-страница) реально содержит **4 полноценных попапа**, не 2:
`3989`(EN, класс `elementor-886`) и `3981`(RU, класс `elementor-893`) — это два
языковых варианта бонуса; `3946`(EN, `elementor-834`) и `3997`(RU, `elementor-840`)
— два варианта джекпота. Это уже не дубль вёрстки, а конфигурация WPML/Elementor
popup-триггеров, которая подключает оба языка сразу. Патч из раздела 6 уберёт
только "осиротевшие" копии; какой из двух попапов (EN или RU) должен вообще
присутствовать на `/` — решение на стороне Elementor-триггеров/WPML, не
разметки, и это по-прежнему ручной шаг (посмотреть в редакторе Elementor,
какой popup ID подключен к кнопкам на RU-версии, отключить второй).

---

## 7. Неиспользуемый CSS на нерусских локалях — новый файл `scripts/patches/audit-unused-stylesheets.mjs`

`OPTIMIZATION_REPORT.md` описывает чистку **82 неиспользуемых CSS-ссылок**
(carousel/mega-menu/accordion — «0 использований»), но проверил `en/index.html`
вручную: та же самая уборка на нерусские локали (`en/uz/kz/hy/tj`) не
докатилась. В `<head>` `en/index.html` подключены:

- `slick.min.css` + `slick-theme.min.css` (карусель Slick)
- `imagehover.css`
- `flipclock.css`
- `widget-mega-menu.min.css`

Проверил по всему `<body>`: ни один класс `slick-*`, `hvr-*`/`imagehover`,
`flipclock`, `mega-menu`/`megamenu` не встречается — это мёртвый груз,
скачивается впустую на каждой загрузке `/en/`. Для сравнения — `swiper` и
`elementskit-accordion` в файле реально используются (слайдер шагов
регистрации, отзывы, FAQ) и в этом кодмоде не трогаются.

`bootstrap.min.css` — тоже подозрительный кандидат, но его классы (`col-`,
`row`, `container`) слишком общие для безопасного regex-поиска "0 совпадений";
скрипт только предупреждает о нём, не удаляет автоматически.

```bash
node scripts/patches/audit-unused-stylesheets.mjs           # dry run
node scripts/patches/audit-unused-stylesheets.mjs --write   # применить
```

```js
/**
 * Codemod: removes <link rel="stylesheet"> tags for widget CSS that is not
 * actually used anywhere in the page body — the same kind of cleanup
 * OPTIMIZATION_REPORT.md already did for the RU corpus ("82 CSS ссылки
 * удалены… Carousel (0 использований), Mega-menu (0 использований)"), but
 * never re-run against the non-RU homepages (en/uz/kz/hy/tj), which pull in
 * their own copy of the same plugin CSS.
 *
 * Verified by hand against en/index.html: none of `slick`, `slick-theme`,
 * `imagehover`/`hvr-`, `flipclock`, or `mega-menu`/`megamenu` class names
 * appear anywhere in <body> — only the <head> <link> tags reference them.
 * `elementor-main-swiper` (swiper.min.css) and `elementskit-accordion`
 * (used by the FAQ) ARE genuinely used and are intentionally NOT touched.
 *
 * `bootstrap.min.css` is NOT included here — grid classes (col-, row) are
 * too generic to confirm zero usage by regex with confidence; verify that
 * one by hand before removing it (see the report printed by this script).
 *
 * Usage:
 *   node scripts/patches/audit-unused-stylesheets.mjs           # dry run
 *   node scripts/patches/audit-unused-stylesheets.mjs --write   # applies
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import { load } from 'cheerio';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WRITE = process.argv.includes('--write');

/** hrefContains -> body marker regexes. Link is removed only if NONE match body. */
const CANDIDATES = [
  {
    hrefContains: 'exclusive-addons-for-elementor/assets/vendor/css/slick.min.css',
    markers: [/\bslick-(slide|track|dots|list|initialized)\b/],
    label: 'slick carousel (base)',
  },
  {
    hrefContains: 'exclusive-addons-for-elementor/assets/vendor/css/slick-theme.min.css',
    markers: [/\bslick-(slide|track|dots|list|initialized)\b/],
    label: 'slick carousel (theme)',
  },
  {
    hrefContains: 'exclusive-addons-for-elementor/assets/vendor/css/imagehover.css',
    markers: [/\bhvr-/, /imagehover/i, /\bimage-hover\b/],
    label: 'image hover effects',
  },
  {
    hrefContains: 'unlimited-addon-for-elementor/assets/css/flipclock.css',
    markers: [/flip-?clock/i],
    label: 'flipclock countdown',
  },
  {
    hrefContains: 'elementor-pro/assets/css/widget-mega-menu.min.css',
    markers: [/mega-?menu/i],
    label: 'mega menu widget',
  },
];

/** Flagged for manual review only — too generic to auto-remove safely. */
const MANUAL_REVIEW_ONLY = [
  {
    hrefContains: 'unlimited-addon-for-elementor/assets/css/bootstrap.min.css',
    label: 'Bootstrap grid/utilities — verify by hand (col-/row/container classes too generic to regex safely)',
  },
];

async function findLegacyHtmlFiles() {
  return glob('**/index.html', {
    cwd: rootDir,
    nodir: true,
    ignore: ['node_modules/**', 'apps/web/**', 'assets/**', 'content/**'],
  });
}

async function main() {
  const files = await findLegacyHtmlFiles();
  const report = [];

  for (const relativePath of files) {
    const fullPath = path.join(rootDir, relativePath);
    const original = await fs.readFile(fullPath, 'utf8');

    const $ = load(original, { decodeEntities: false });
    const bodyHtml = $('body').html() ?? '';

    const removedHere = [];
    const manualHere = [];

    for (const candidate of CANDIDATES) {
      const link = $(`link[href*="${candidate.hrefContains}"]`);
      if (!link.length) continue;
      const isUsed = candidate.markers.some((re) => re.test(bodyHtml));
      if (!isUsed) {
        removedHere.push(candidate.label);
        if (WRITE) link.remove();
      }
    }

    for (const candidate of MANUAL_REVIEW_ONLY) {
      if ($(`link[href*="${candidate.hrefContains}"]`).length) {
        manualHere.push(candidate.label);
      }
    }

    if (removedHere.length || manualHere.length) {
      report.push({ file: relativePath, removedHere, manualHere });
      if (WRITE && removedHere.length) {
        await fs.writeFile(fullPath, $.html(), 'utf8');
      }
    }
  }

  if (!report.length) {
    console.log('No unused stylesheet links found.');
    return;
  }

  console.log(`${WRITE ? 'Removed' : 'Would remove'} unused stylesheet links in ${report.length} file(s):\n`);
  for (const row of report) {
    console.log(`  ${row.file}`);
    for (const label of row.removedHere) console.log(`    - removed: ${label}`);
    for (const label of row.manualHere) console.log(`    - ⚠ manual review: ${label}`);
  }

  if (!WRITE) {
    console.log('\nDry run only — re-run with --write to apply.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Добавить в `package.json`:
```diff
     "fix:orphaned-popup-duplicates": "node scripts/patches/fix-orphaned-popup-duplicates.mjs --write",
+    "audit:unused-stylesheets": "node scripts/patches/audit-unused-stylesheets.mjs",
+    "fix:unused-stylesheets": "node scripts/patches/audit-unused-stylesheets.mjs --write",
```

---

## 8. Закрываю дыру в CI — новый файл `scripts/patches/verify-assets-exist.mjs`

Прочитал существующий `scripts/verify-internal-links.mjs` — он **явно
пропускает** всё, что начинается с `/assets/` и `/includes/`
(`SKIP_PREFIXES`). То есть ни одна из находок этого аудита (флаг KZ, but-back.png/webp,
видео CRASH/Русский покер) в принципе не могла бы попасться существующей
проверке ссылок — она нацелена на страницы (`/blog/…`), а не на статику.

Новый скрипт закрывает именно этот пробел: собирает все `/assets/...`
из `src`/`href`/`poster`/`srcset`/CSS `url()` в извлечённых телах страниц
(`content/bodies/*.html`) и проверяет, что каждая ссылка реально существует
в `apps/web/public/` — той же папке, из которой собирается прод.

```bash
npm run extract:content && npm run prepare:public   # если ещё не запускали
node scripts/patches/verify-assets-exist.mjs
```

```js
/**
 * CI guard: verify:links (scripts/verify-internal-links.mjs) explicitly SKIPS
 * anything under /assets/ or /includes/ — see its own `SKIP_PREFIXES`. That's
 * exactly the category of reference where the real breakage in this project
 * lives (the KZ flag path, the but-back.png/webp split, and the CRASH/Russian
 * Poker videos below the FAQ, none of which exist anywhere in this
 * repository as of this audit — verify manually whether those particular
 * .mp4 files exist on the production media library outside of git, since
 * that can't be confirmed from the repo alone).
 *
 * This script closes that specific gap: it collects every `/assets/...`
 * reference (img src/srcset, video/source src, link href, CSS url()) found
 * in the extracted page bodies, and checks that each one resolves to a real
 * file under apps/web/public/ (the actual deploy artifact — same directory
 * verify:cloudflare and the Next export read from).
 *
 * Run AFTER `npm run extract:content` and `npm run prepare:public` (needs
 * content/bodies/*.html and apps/web/public/assets to both exist).
 *
 * Usage:
 *   node scripts/patches/verify-assets-exist.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const bodiesDir = path.join(rootDir, 'content/bodies');
const publicDir = path.join(rootDir, 'apps/web/public');

const ASSET_REF_PATTERN = /(?:src|href|poster)="(\/assets\/[^"?#]+)"|url\((\/assets\/[^)?#'"]+)\)/g;

const existsCache = new Map();
async function fileExists(relativePath) {
  if (existsCache.has(relativePath)) return existsCache.get(relativePath);
  try {
    await fs.access(path.join(publicDir, relativePath));
    existsCache.set(relativePath, true);
    return true;
  } catch {
    existsCache.set(relativePath, false);
    return false;
  }
}

async function main() {
  let bodyFiles;
  try {
    bodyFiles = await glob('*.html', { cwd: bodiesDir });
  } catch {
    console.error('content/bodies not found — run npm run extract:content first.');
    process.exitCode = 1;
    return;
  }

  try {
    await fs.access(path.join(publicDir, 'assets'));
  } catch {
    console.error('apps/web/public/assets not found — run npm run prepare:public first.');
    process.exitCode = 1;
    return;
  }

  const missing = [];
  let refCount = 0;

  for (const file of bodyFiles) {
    const html = await fs.readFile(path.join(bodiesDir, file), 'utf8');
    const refs = new Set();
    for (const match of html.matchAll(ASSET_REF_PATTERN)) {
      refs.add(match[1] || match[2]);
    }
    // srcset can hold multiple comma-separated candidates in one attribute.
    for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
      for (const candidate of match[1].split(',')) {
        const url = candidate.trim().split(/\s+/)[0];
        if (url?.startsWith('/assets/')) refs.add(url);
      }
    }

    for (const ref of refs) {
      refCount += 1;
      const relative = ref.replace(/^\//, '');
      if (!(await fileExists(relative))) {
        missing.push({ file, ref });
      }
    }
  }

  if (missing.length) {
    console.error(`Found ${missing.length} /assets/ references with no matching file (out of ${refCount} checked):`);
    missing.slice(0, 40).forEach(({ file, ref }) => console.error(`  ${file}: ${ref}`));
    if (missing.length > 40) console.error(`  ... and ${missing.length - 40} more`);
    process.exitCode = 1;
    return;
  }

  console.log(`Verified ${refCount} /assets/ references across ${bodyFiles.length} body files — all resolve to real files.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Добавить в `package.json` и в `build:next` (после `verify:links`):
```diff
     "verify:links": "node scripts/verify-internal-links.mjs",
+    "verify:assets-exist": "node scripts/patches/verify-assets-exist.mjs",
```
```diff
- ... && npm run verify:links && npm run audit:rudiments && ...
+ ... && npm run verify:links && npm run verify:assets-exist && npm run audit:rudiments && ...
```

---

## 9. Новая функциональность: теги постов + «Похожие статьи» + карточки-зигзаг с пагинацией в архиве блога

Это не багфикс, а фича — сборка того, что мы обсуждали в дизайн-макетах
(`Блог — варианты.dc.html`, опции 4a/4b). Раскопал, где в статическом
экспорте реально живут теги постов, и подключил их сквозь весь пайплайн:
extract → manifest → архив блога → страница статьи.

### Где на самом деле лежат теги (важно)

- Одиночная страница поста (`pravila-tehasskogo-holdema/index.html`) **не
  содержит тегов** — ни в `<body class>`, ни ссылками «Метки:» внизу текста.
- Классы `tag-poker`/`tag-shkola-pokera`, которые я цитировал в переписке
  раньше — это классы `data-elementor-type="loop-item"` **на странице
  `/blog/`**, но их резать регуляркой из минифицированной атрибутной строки
  ненадёжно, и есть только у постов, попавших в текущую выдачу архива.
- Настоящий надёжный источник — архивные страницы `/tag/<slug>/` (и их
  пагинация `/tag/<slug>/page/N/`). Они используют простой, стабильный
  шаблон:
  ```html
  <h1 class="entry-title">Метка: <span>Школа покера</span></h1>
  ...
  <article class="post"><h2 class="entry-title"><a href="/vpip/">VPIP</a></h2>…
  ```
  Проверил вручную `/tag/poker/` и `/tag/shkola-pokera/` — они реально
  перечисляют по 6-7 постов каждая, включая все 6 постов из архива блога.
  **Поправка к моим более ранним дизайн-макетам**: там я показал VPIP только
  с тегом «Покер» — при сверке с `/tag/shkola-pokera/` оказалось, что VPIP
  тоже входит в «Школа покера». В реальных данных (ниже) это уже верно.

### Новый файл: `scripts/lib/post-tags.mjs`

```js
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { load } from 'cheerio';
import { glob } from 'glob';

/**
 * Tags only exist in this static export on the /tag/<slug>/ (and paginated
 * /tag/<slug>/page/N/) archive pages — verified by hand: a single post page
 * (e.g. pravila-tehasskogo-holdema/index.html) carries no tag-* body class
 * and no inline "Метки:" links, and the /blog/ loop-grid's tag-* classes are
 * unreliable to parse from minified attribute soup. The /tag/* archive uses
 * a simple, stable template instead:
 *   <h1 class="entry-title">Метка: <span>ИМЯ ТЕГА</span></h1>
 *   <article class="post"><h2 class="entry-title"><a href="/slug/">Title</a></h2>...
 *
 * Walks every RU tag archive page and inverts it into a route -> tag-slugs
 * map, plus a slug -> display-name map.
 *
 * Caveat: scoped to RU tag pages only (tag/*). EN/UZ/KZ tag archives (if any
 * exist under en/tag/, uz/tag/, kz/tag/) would need the same treatment —
 * not verified in this pass since the 6 sample posts audited are RU.
 */
export async function buildPostTagsIndex(rootDir) {
  const tagFiles = await glob('tag/*/index.html', { cwd: rootDir });
  const pagedTagFiles = await glob('tag/*/page/*/index.html', { cwd: rootDir });

  const routeTags = new Map(); // route -> Set<slug>
  const tagNames = new Map(); // slug -> display name

  for (const relativePath of [...tagFiles, ...pagedTagFiles]) {
    const slug = relativePath.split('/')[1];
    const html = await fs.readFile(path.join(rootDir, relativePath), 'utf8');
    const $ = load(html, { decodeEntities: false });

    const displayName = $('h1.entry-title span').first().text().trim();
    if (displayName && !tagNames.has(slug)) {
      tagNames.set(slug, displayName);
    }

    $('article.post').each((_, article) => {
      const href = $(article).find('h2.entry-title a').first().attr('href');
      if (!href) return;
      if (!routeTags.has(href)) routeTags.set(href, new Set());
      routeTags.get(href).add(slug);
    });
  }

  const routeTagsPlain = {};
  for (const [route, slugs] of routeTags) {
    routeTagsPlain[route] = [...slugs].sort();
  }

  return {
    routeTags: routeTagsPlain,
    tagNames: Object.fromEntries(tagNames),
  };
}
```

### Правка `scripts/extract-content.mjs`

```diff
 import { load } from 'cheerio';

+import { buildPostTagsIndex } from './lib/post-tags.mjs';
 import { discoverWordPressPages } from '../src/lib/wordpressHtml.mjs';
 import { assertNoHekler, normalizeUrls } from '../src/lib/normalizeUrls.mjs';
 import { computeCssBudget } from './compute-css-budget.mjs';
 import { isBlogArchiveRoute, needsElementorRuntime } from './lib/elementor-runtime-budget.mjs';
```

```diff
   const nativePageRoutes = loadNativePageRoutes();
+  const { routeTags, tagNames } = await buildPostTagsIndex(rootDir);
   const pages = await discoverWordPressPages(rootDir);
   const manifestPages = [];
```

```diff
       publishedAt: type === 'post' ? extractPublishedTime($) : '',
       ogImage: normalizeUrls($('meta[property="og:image"]').first().attr('content') ?? ''),
+      tags: type === 'post' ? (routeTags[page.route] ?? []) : undefined,
       hreflang: extractHreflang($),
```

```diff
         entry.hasStructuredPost = true;
         await writePostRecord(fileId, {
           route: entry.route,
           locale: entry.locale,
           title: entry.title,
           description: entry.description,
           publishedAt: extractPublishedTime($),
           image: extractPostFeaturedImage($, entry.ogImage) || undefined,
+          tags: entry.tags ?? [],
         });
```

```diff
   const manifestJson = JSON.stringify(manifest, null, 2);
   assertNoHekler(manifestJson, 'manifest.json');

   await fs.writeFile(path.join(contentDir, 'manifest.json'), `${manifestJson}\n`, 'utf8');
+
+  const tagNamesJson = JSON.stringify(tagNames, null, 2);
+  assertNoHekler(tagNamesJson, 'tag-names.json');
+  await fs.writeFile(path.join(contentDir, 'tag-names.json'), `${tagNamesJson}\n`, 'utf8');
+
   await generateLlmsTxt(budget.pages);
```

### Правка `apps/web/src/lib/types.ts`

```diff
   publishedAt?: string;
   ogImage?: string;
+  tags?: string[];
   hreflang: HreflangEntry[];
```

```diff
 export type PostRecord = {
   route: string;
   locale: string;
   title: string;
   description: string;
   publishedAt: string;
   image?: string;
+  tags?: string[];
   html: string;
 };
```

### Правка `apps/web/src/lib/blogRotation.ts`

```diff
 export type BlogPostCard = {
   route: string;
   title: string;
   description: string;
   publishedAt: string;
   image?: string;
+  tags?: string[];
 };
```

### Правка `apps/web/src/lib/content.ts` (`getBlogArchivePosts`)

```diff
     .map((page) => ({
       route: page.route,
       title: stripTitleSuffix(page.title),
       description: page.description,
       publishedAt: page.publishedAt!,
       image: page.ogImage || undefined,
+      tags: page.tags ?? [],
     }));
```

### Правка `apps/web/src/lib/blogPosts.ts` (`getBlogPostCards`)

```diff
     .map((page) => ({
       route: page.route,
       title: page.title,
       description: page.description,
       publishedAt: page.publishedAt!,
       image: page.ogImage,
+      tags: page.tags ?? [],
     }));
```

### Новый файл: `apps/web/src/lib/tagNames.ts`

```ts
import { promises as fs } from 'fs';
import path from 'path';

const contentRoot = path.join(process.cwd(), '..', '..', 'content');

let cache: Record<string, string> | null = null;

/** slug -> display name (e.g. "shkola-pokera" -> "Школа покера"), from content/tag-names.json. */
export async function getTagNames(): Promise<Record<string, string>> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(path.join(contentRoot, 'tag-names.json'), 'utf8');
    cache = JSON.parse(raw) as Record<string, string>;
  } catch {
    cache = {};
  }
  return cache;
}

export async function getTagDisplayName(slug: string): Promise<string> {
  const names = await getTagNames();
  return names[slug] ?? slug;
}
```

### Новый файл: `apps/web/src/lib/relatedPosts.ts`

```ts
import type { BlogPostCard } from './blogRotation';

/**
 * Related-by-tag ranking: shared tag count desc, then recency desc.
 * Posts with zero shared tags are excluded — no false "related" matches
 * just to fill 3 slots (e.g. VPIP/OFC never appear under a post that only
 * shares "poker" with them once another candidate shares both tags).
 */
export function getRelatedPosts(
  current: Pick<BlogPostCard, 'route' | 'tags'>,
  allPosts: BlogPostCard[],
  count = 3,
): BlogPostCard[] {
  const currentTags = new Set(current.tags ?? []);
  if (currentTags.size === 0) return [];

  return allPosts
    .filter((post) => post.route !== current.route)
    .map((post) => ({
      post,
      shared: (post.tags ?? []).filter((tag) => currentTags.has(tag)).length,
    }))
    .filter((entry) => entry.shared > 0)
    .sort((a, b) => {
      if (b.shared !== a.shared) return b.shared - a.shared;
      return Date.parse(b.post.publishedAt) - Date.parse(a.post.publishedAt);
    })
    .slice(0, count)
    .map((entry) => entry.post);
}
```

### Переписать `apps/web/src/components/native/NativeBlogArchive.tsx`

Зигзаг-карточки (изображение слева/справа поочерёдно) + тег-пилюли + пронумерованная пагинация, вместо текстового списка:

```tsx
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { BlogBreadcrumbs } from '@/components/native/BlogBreadcrumbs';
import type { AppLocale } from '@/i18n/routing';
import { blogArchiveHref } from '@/lib/blogArchive';
import type { BlogArchiveSlice } from '@/lib/blogArchive';
import { getTagNames } from '@/lib/tagNames';

type NativeBlogArchiveProps = {
  locale: AppLocale;
  archive: BlogArchiveSlice;
};

function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export async function NativeBlogArchive({ locale, archive }: NativeBlogArchiveProps) {
  const t = await getTranslations({ locale, namespace: 'blog' });
  const tagNames = await getTagNames();
  const { posts, pageNumber, totalPages } = archive;

  return (
    <div className="blog-surface">
      <BlogBreadcrumbs locale={locale} current={t('title')} variant="archive" />
      <section className="blog-archive" aria-labelledby="blog-archive-title">
        <header className="blog-archive__header">
          <h1 id="blog-archive-title">{t('title')}</h1>
          {totalPages > 1 ? (
            <p className="blog-archive__meta">{t('pageOf', { page: pageNumber, total: totalPages })}</p>
          ) : null}
        </header>

        {posts.length === 0 ? (
          <p className="blog-archive__empty">{t('empty')}</p>
        ) : (
          <ul className="blog-archive__rows" role="list">
            {posts.map((post, index) => (
              <li key={post.route} className={index % 2 === 1 ? 'blog-archive__row--reverse' : ''}>
                <Link href={post.route} className="blog-archive__row">
                  {post.image ? (
                    <span className="blog-archive__row-image">
                      <img src={post.image} alt="" loading="lazy" />
                    </span>
                  ) : (
                    <span className="blog-archive__row-image blog-archive__row-image--placeholder" />
                  )}
                  <span className="blog-archive__row-body">
                    {post.tags && post.tags.length > 0 ? (
                      <span className="blog-archive__tags">
                        {post.tags.map((tag) => (
                          <span key={tag} className="blog-archive__tag">
                            {tagNames[tag] ?? tag}
                          </span>
                        ))}
                      </span>
                    ) : null}
                    <h2>{post.title}</h2>
                    {post.description ? <p>{post.description}</p> : null}
                    <span className="blog-archive__row-meta">
                      {post.publishedAt ? (
                        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
                      ) : null}
                      <span className="blog-archive__read-more">{t('readMore')}</span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 ? (
          <nav className="blog-archive__pagination" aria-label={t('paginationLabel')}>
            {pageNumber > 1 ? (
              <Link href={blogArchiveHref(locale, pageNumber - 1)} className="blog-archive__pagination-arrow">
                {t('previous')}
              </Link>
            ) : (
              <span className="blog-archive__pagination-arrow blog-archive__pagination-arrow--disabled">
                {t('previous')}
              </span>
            )}

            <span className="blog-archive__pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                page === pageNumber ? (
                  <span key={page} className="blog-archive__pagination-page blog-archive__pagination-page--current">
                    {page}
                  </span>
                ) : (
                  <Link key={page} href={blogArchiveHref(locale, page)} className="blog-archive__pagination-page">
                    {page}
                  </Link>
                )
              ))}
            </span>

            {pageNumber < totalPages ? (
              <Link href={blogArchiveHref(locale, pageNumber + 1)} className="blog-archive__pagination-arrow blog-archive__pagination-arrow--primary">
                {t('next')}
              </Link>
            ) : (
              <span className="blog-archive__pagination-arrow blog-archive__pagination-arrow--disabled">
                {t('next')}
              </span>
            )}
          </nav>
        ) : null}
      </section>
    </div>
  );
}
```

Пагинация нумерует все страницы — для 4 страниц это нормально; если позже
страниц станет много (>10), стоит добавить усечение (`1 … 4 5 6 … 12`), но
пока не усложняю без необходимости.

### Заменить блок `.blog-archive*` в `apps/web/src/app/globals.css`

```diff
-.blog-archive__list time {
-  display: block;
-  color: #9aa8c7;
-  font-size: 0.9rem;
-  margin-top: 0.35rem;
-}
-
-.blog-archive__list {
-  list-style: none;
-  padding: 0;
-  margin: 2rem 0;
-}
-
-.blog-archive__list li {
-  margin-bottom: 1.5rem;
-  padding-bottom: 1.5rem;
-  border-bottom: 1px solid rgba(253, 230, 97, 0.12);
-}
-
-.blog-archive__list a {
-  color: #fff;
-  font-size: 1.25rem;
-  text-decoration: none;
-}
-
-.blog-archive__list a:hover {
-  color: #fde661;
-}
-
-.blog-archive__list h2 {
-  color: inherit;
-}
-
-.blog-archive__list p {
-  color: #9aa8c7;
-  margin: 0.5rem 0 0;
-}
-
-.blog-archive__pagination {
-  display: flex;
-  gap: 1rem;
-  align-items: center;
-  color: #e8ecf4;
-}
-
-.blog-archive__pagination a {
-  color: #fde661;
-}
+.blog-archive__rows {
+  list-style: none;
+  padding: 0;
+  margin: 2rem 0;
+  display: flex;
+  flex-direction: column;
+  gap: 1.5rem;
+}
+
+.blog-archive__rows li {
+  border-bottom: 1px solid rgba(253, 230, 97, 0.08);
+  padding-bottom: 1.5rem;
+}
+
+.blog-archive__row {
+  display: flex;
+  gap: 1.5rem;
+  align-items: center;
+  text-decoration: none;
+  color: inherit;
+}
+
+.blog-archive__row--reverse .blog-archive__row {
+  flex-direction: row-reverse;
+}
+
+.blog-archive__row-image {
+  flex-shrink: 0;
+  width: 220px;
+  height: 145px;
+  border-radius: 14px;
+  overflow: hidden;
+  display: block;
+}
+
+.blog-archive__row-image img {
+  width: 100%;
+  height: 100%;
+  object-fit: cover;
+  display: block;
+}
+
+.blog-archive__row-image--placeholder {
+  background: linear-gradient(135deg, #232a3d 0%, #1a2744 100%);
+}
+
+.blog-archive__tags {
+  display: flex;
+  gap: 0.4rem;
+  margin-bottom: 0.6rem;
+}
+
+.blog-archive__tag {
+  font-size: 0.7rem;
+  font-weight: 700;
+  padding: 0.25rem 0.6rem;
+  border-radius: 999px;
+  background: rgba(97, 206, 112, 0.15);
+  color: #61ce70;
+}
+
+.blog-archive__row-body h2 {
+  margin: 0 0 0.5rem;
+  font-size: 1.35rem;
+  color: #fff;
+  line-height: 1.3;
+}
+
+.blog-archive__row:hover .blog-archive__row-body h2 {
+  color: #fde661;
+}
+
+.blog-archive__row-body p {
+  margin: 0 0 0.6rem;
+  color: #9aa8c7;
+  font-size: 0.9rem;
+  line-height: 1.5;
+}
+
+.blog-archive__row-meta {
+  display: flex;
+  gap: 1rem;
+  align-items: center;
+  font-size: 0.8rem;
+  color: #7b8db2;
+}
+
+.blog-archive__pagination {
+  display: flex;
+  justify-content: space-between;
+  align-items: center;
+  margin-top: 1rem;
+  padding-top: 1.5rem;
+  border-top: 1px solid rgba(253, 230, 97, 0.12);
+}
+
+.blog-archive__pagination-arrow {
+  padding: 0.6rem 1.1rem;
+  border-radius: 10px;
+  background: #131b2b;
+  border: 1px solid rgba(253, 230, 97, 0.15);
+  color: #e8ecf4;
+  font-size: 0.85rem;
+  font-weight: 700;
+  text-decoration: none;
+}
+
+.blog-archive__pagination-arrow--primary {
+  background: #fde661;
+  color: #131b2b;
+  border-color: transparent;
+}
+
+.blog-archive__pagination-arrow--disabled {
+  color: #4a5570;
+}
+
+.blog-archive__pagination-pages {
+  display: flex;
+  gap: 0.4rem;
+}
+
+.blog-archive__pagination-page {
+  width: 30px;
+  height: 30px;
+  border-radius: 8px;
+  display: flex;
+  align-items: center;
+  justify-content: center;
+  font-size: 0.8rem;
+  font-weight: 700;
+  background: #131b2b;
+  color: #9aa8c7;
+  text-decoration: none;
+}
+
+.blog-archive__pagination-page--current {
+  background: #fde661;
+  color: #131b2b;
+}
+
+@media (max-width: 640px) {
+  .blog-archive__row,
+  .blog-archive__row--reverse .blog-archive__row {
+    flex-direction: column;
+    align-items: stretch;
+  }
+
+  .blog-archive__row-image {
+    width: 100%;
+    height: 190px;
+  }
+}
```

### Правка `apps/web/src/components/native/StructuredPost.tsx`

Добавить теги под заголовком и блок «Похожие статьи» внизу:

```diff
 import type { PostRecord } from '@/lib/types';

 import { BlogBreadcrumbs } from '@/components/native/BlogBreadcrumbs';
 import type { AppLocale } from '@/i18n/routing';
+import type { BlogPostCard } from '@/lib/blogRotation';
+import { getTagNames } from '@/lib/tagNames';
+import { getTranslations } from 'next-intl/server';

 type StructuredPostProps = {
   post: PostRecord;
+  relatedPosts?: BlogPostCard[];
 };
```

```diff
-export async function StructuredPost({ post }: StructuredPostProps) {
+export async function StructuredPost({ post, relatedPosts = [] }: StructuredPostProps) {
   const formattedDate = post.publishedAt ? formatDate(post.publishedAt, post.locale) : '';
   const locale = post.locale as AppLocale;
+  const tagNames = await getTagNames();
+  const t = await getTranslations({ locale, namespace: 'blog' });
```

```diff
       <article className="post-article" data-route={post.route}>
         <header className="post-article__header">
+          {post.tags && post.tags.length > 0 ? (
+            <div className="post-article__tags">
+              {post.tags.map((tag) => (
+                <span key={tag} className="post-article__tag">
+                  {tagNames[tag] ?? tag}
+                </span>
+              ))}
+            </div>
+          ) : null}
           <h1>{post.title}</h1>
```

```diff
         <div
           className="post-article__content"
           dangerouslySetInnerHTML={{ __html: post.html }}
         />
+
+        {relatedPosts.length > 0 ? (
+          <aside className="post-article__related">
+            <h2>{t('relatedTitle')}</h2>
+            <div className="post-article__related-grid">
+              {relatedPosts.map((related) => (
+                <a key={related.route} href={related.route} className="post-article__related-card">
+                  {related.image ? <img src={related.image} alt="" loading="lazy" /> : null}
+                  <span>{related.title}</span>
+                </a>
+              ))}
+            </div>
+          </aside>
+        ) : null}
       </article>
```

Добавить в `apps/web/messages/ru.json` (и остальные локали) ключ
`blog.relatedTitle`, например `"Похожие статьи"`.

Соответствующий CSS в `globals.css` (добавить, не заменяет ничего):

```css
.post-article__tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.post-article__tag {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: rgba(97, 206, 112, 0.15);
  color: #61ce70;
}

.post-article__related {
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(253, 230, 97, 0.12);
}

.post-article__related h2 {
  margin: 0 0 1rem;
  color: #fde661;
  font-size: 1.15rem;
}

.post-article__related-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.post-article__related-card {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background: #131b2b;
  text-decoration: none;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.35;
}

.post-article__related-card img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  display: block;
}

.post-article__related-card span {
  padding: 0.65rem 0.75rem;
}

@media (max-width: 640px) {
  .post-article__related-grid {
    grid-template-columns: 1fr;
  }
}
```

### Правка `apps/web/src/app/[locale]/[[...slug]]/page.tsx` — передать `relatedPosts`

```diff
 import { PageShell } from '@/components/PageShell';
 import { routing, type AppLocale } from '@/i18n/routing';
 import {
   getBodyHtml,
+  getBlogArchivePosts,
   getPageBySlug,
   getPageRecord,
   getPagesByLocale,
   getPostRecord,
   slugParamsFromPage,
 } from '@/lib/content';
+import { getRelatedPosts } from '@/lib/relatedPosts';
```

```diff
   const structuredPost =
     !nativePage && page.type === 'post' && page.hasStructuredPost
       ? await getPostRecord(page)
       : null;
   const bodyHtml = structuredPost || nativePage ? '' : await getBodyHtml(page);
+
+  const relatedPosts = structuredPost
+    ? getRelatedPosts(structuredPost, await getBlogArchivePosts(appLocale))
+    : [];

   return (
     <PageShell
       page={page}
       bodyHtml={bodyHtml}
       structuredPost={structuredPost}
+      relatedPosts={relatedPosts}
       nativePage={nativePage}
     />
   );
```

И проброс через `PageShell` (`apps/web/src/components/PageShell.tsx`):

```diff
 type PageShellProps = {
   page: PageEntry;
   bodyHtml: string;
   structuredPost?: PostRecord | null;
+  relatedPosts?: BlogPostCard[];
   nativePage?: PageRecord | null;
   nativeBlog?: BlogArchiveSlice | null;
   children?: ReactNode;
 };
```

```diff
 export function PageShell({
   page,
   bodyHtml,
   structuredPost,
+  relatedPosts,
   nativePage,
   nativeBlog,
   children,
 }: PageShellProps) {
```

```diff
         ) : structuredPost ? (
-          <StructuredPost post={structuredPost} />
+          <StructuredPost post={structuredPost} relatedPosts={relatedPosts} />
         ) : (
```

(добавить `import type { BlogPostCard } from '@/lib/blogRotation';` к импортам `PageShell.tsx`)

### Чек-лист внедрения раздела 9 (по порядку)

Весь код уже приведён выше — здесь порядок, в котором его применять, и что
проверить на каждом шаге.

1. **`scripts/lib/post-tags.mjs`** — новый файл, скопировать как есть.
2. **`scripts/extract-content.mjs`** — 4 диффа (импорт, вызов `buildPostTagsIndex`,
   запись `tags` в `manifestPages`/`writePostRecord`, запись `content/tag-names.json`).
   Прогнать `npm run extract:content` и проверить, что `content/tag-names.json`
   создался и `content/manifest.json` у постов содержит непустой `tags: […]`
   хотя бы для постов из `/tag/poker/` и `/tag/shkola-pokera/`.
3. **Типы** — `apps/web/src/lib/types.ts`: добавить `tags?: string[]` в `PageEntry`
   и `PostRecord`.
4. **`apps/web/src/lib/blogRotation.ts`** — добавить `tags?: string[]` в `BlogPostCard`.
5. **Данные постов** — `apps/web/src/lib/content.ts` (`getBlogArchivePosts`) и
   `apps/web/src/lib/blogPosts.ts` (`getBlogPostCards`): прокинуть `tags: page.tags ?? []`
   в возвращаемый объект каждой карточки. Без этого шага теги долетят до
   manifest, но не попадут в компоненты.
6. **`apps/web/src/lib/tagNames.ts`** — новый файл, читает `content/tag-names.json`
   (slug → человекочитаемое имя тега для вывода на UI).
7. **`apps/web/src/lib/relatedPosts.ts`** — новый файл, функция `getRelatedPosts()`:
   ранжирует по числу общих тегов, затем по свежести; посты без общих тегов
   не показывает вообще (не «дотягивает» до 3 карточек искусственно).
8. **`apps/web/src/components/native/NativeBlogArchive.tsx`** — заменить целиком
   на версию из патча: зигзаг-карточки (изображение слева/справа поочерёдно),
   тег-пилюли, пронумерованная пагинация вместо текущего текстового списка.
   Компонент уже получает `archive: BlogArchiveSlice` — эта сигнатура не меняется,
   меняется только то, что он рендерит.
9. **`apps/web/src/components/native/StructuredPost.tsx`** — добавить проп
   `relatedPosts` и вывод: тег-пилюли под заголовком, блок «Похожие статьи»
   внизу статьи (рендерится только если `relatedPosts.length > 0`).
10. **`apps/web/src/app/[locale]/[[...slug]]/page.tsx`** — на уровне страницы
    вызвать `getRelatedPosts(structuredPost, await getBlogArchivePosts(appLocale))`
    и передать результат в `PageShell` → `StructuredPost`. Это единственное
    место, где рекомендации реально вычисляются — компоненты сами данные не тянут.
11. **`apps/web/src/components/PageShell.tsx`** — прокинуть новый проп
    `relatedPosts` дальше в `StructuredPost` (просто передаточное звено).
12. **`apps/web/src/app/globals.css`** — заменить блок `.blog-archive__list*`
    на `.blog-archive__rows/__row/__tag/__pagination*` (диффы выше) и добавить
    новый блок `.post-article__tags/__related*`. Ничего в остальном файле не трогать.
13. **Локализация** — добавить ключ `blog.relatedTitle` (например «Похожие статьи»)
    в `apps/web/messages/ru.json` и аналогичный перевод в `en.json`/`uz.json`/
    `kz.json`/`hy.json`/`tj.json` — иначе `getTranslations` упадёт на нерусских
    локалях, где ключа ещё нет.

### Что нельзя автоматизировать / решить за разработчика

- **Проверка на нерусских локалях.** Весь раздел 9 построен и проверен на
  RU-архиве тегов (`/tag/poker/`, `/tag/shkola-pokera/` и ещё 4). Если у
  `/en/`, `/uz/`, `/kz/`, `/hy/`, `/tj/` есть свои `tag/*` архивы — нужно
  вручную проверить, что `post-tags.mjs` находит и их (сейчас скрипт вообще
  не фильтрует по локали, просто читает `tag/*/index.html` из корня — если
  локализованные теговые архивы лежат по другим путям типа `en/tag/*`, скрипт
  их не увидит и для этих локалей `tags` будет пустым, `relatedPosts` — тоже).
- **Число тегов на страницах пагинации `/tag/<slug>/page/N/`.** Скрипт их
  учитывает, но я не проверял вручную, что паттерн `article.post` одинаковый
  на второй+ странице архива тега — сверить на реальном файле перед мёржем.
- **Порог "0 общих тегов — не показывать".** Сейчас `getRelatedPosts` просто
  ничего не возвращает, если пересечений нет — тогда блок «Похожие статьи»
  не рисуется вообще. Если хотите, чтобы блок был всегда (с fallback на
  «просто свежие посты»), это отдельное решение — не стал добавлять
  самовольно, это меняет поведение UI, а не чинит баг.

### ⚠ Важно проверить руками: видео CRASH/Русский покер не нашлись в репозитории вообще

Пока писал этот скрипт, поискал по всему репозиторию любые `.mp4` — **ни
одного** файла с расширением `.mp4` нет нигде в git (не только в
`assets/media/2025/09` и `/12`, где ожидались эти четыре ролика). Это может
значить одно из двух:
1. видеофайлы весят больше лимита GitHub/git и физически не попали в этот
   репозиторий, хотя на проде (например, через прямую загрузку в WordPress)
   они существуют — тогда сайт работает, а этот git-снэпшот просто неполный;
2. либо файлов действительно нет и на проде — тогда все четыре `<video>`
   в блоке CRASH/Русский покер (раздел 5) отдают 404 прямо сейчас.

Из репозитория это различить нельзя. Прогоните `verify:assets-exist` на
реальной проверке (после `prepare:public`, куда попадает содержимое
`assets/`, каким оно приезжает из деплоя) — если ролики 404-ят и там, это
самая срочная находка всего аудита.
