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
- заменяет оставшиеся ссылки на `but-back.png` на `but-back.webp` (webp-файл
  уже лежит рядом, просто не все вхождения были переключены);
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
 *   3. Swap remaining but-back.png references to the already-generated .webp.
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
  BUTTON_ASSET_FIX,
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

function fixButtonAsset(html) {
  const count = html.split(BUTTON_ASSET_FIX.wrong).length - 1;
  return { html: html.split(BUTTON_ASSET_FIX.wrong).join(BUTTON_ASSET_FIX.correct), count };
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

    const buttonFix = fixButtonAsset(html);
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
    if (row.buttonAssetFixes) console.log(`    - swapped ${row.buttonAssetFixes} but-back.png reference(s) to .webp`);
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

## 7. Дополнения в репозитории (после P0-бандла)

Скрипты уже лежат в `scripts/patches/` и вызываются из `npm run build`:

| Скрипт | Назначение |
|--------|------------|
| `fix:legacy-html` | + robots meta dedupe, KZ locale (`kz-home-locale-content.mjs`) |
| `fix:orphaned-popup-duplicates` | раздел 6 |
| `fix:promo-video-blocks` | раздел 5 (+ KZ template `db11841`/`8982bde`, poster `turbo.webp`) |
| `verify:kz-home-locale` | CI: казахский текст на `/kz/` |
