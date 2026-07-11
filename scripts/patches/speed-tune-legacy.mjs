/**
 * Speed tuning for legacy HTML. Applied at build time (idempotent):
 *
 * 1. Adds `defer` to render-blocking scripts. jQuery core + jquery-migrate
 *    stay blocking on purpose: several inline scripts call jQuery during
 *    parse, so deferring the core would throw ReferenceErrors. Everything
 *    else (analytics, Elementor stack, addons) is safe to defer — `defer`
 *    preserves execution order.
 * 2. Removes duplicate FontAwesome CSS: when all.min.css is present, the
 *    standalone fontawesome.css / solid.css / brands.css and the
 *    unlimited-addon copy define the same classes twice.
 * 3. Removes FontAwesome v4 CSS + v4-shims (CSS and JS) on pages that use
 *    no `fa fa-*` classes.
 * 4. Removes the unlimited-addon swiper.min.js (122KB) on pages without
 *    UA slider/carousel markup — Elementor ships its own Swiper v8.
 *
 * IMPORTANT: rus/index.html is never touched (traffic page, frozen by
 * agreement). Run with --write to apply, without for a dry run.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import { load } from 'cheerio';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WRITE = process.argv.includes('--write');

const SKIP_FILES = new Set(['rus/index.html']);

const PAGE_IGNORES = [
  '.git/**',
  '.next/**',
  'dist/**',
  'node_modules/**',
  'scripts/**',
  'src/**',
  'assets/**',
  'apps/**',
  'content/**',
];

/** Scripts that must keep blocking: inline code depends on them at parse time. */
const KEEP_BLOCKING = [/\/jquery\/jquery(\.min)?\.js/, /jquery-migrate/];

const FA_DUPLICATE_HREFS = [
  '/font-awesome/css/fontawesome.css',
  '/font-awesome/css/solid.css',
  '/font-awesome/css/brands.css',
  '/unlimited-addon-for-elementor/assets/css/fontawesome.min.css',
];

const FA4_HREFS = [
  '/font-awesome/css/font-awesome.min.css',
  '/font-awesome/css/v4-shims.min.css',
];

function tunepage($, source) {
  const counts = { deferred: 0, faDupes: 0, fa4: 0, uaSwiper: 0 };

  // 1. defer
  $('script[src]').each((_, el) => {
    const node = $(el);
    const src = node.attr('src') ?? '';
    const type = (node.attr('type') ?? '').toLowerCase();
    if (node.attr('defer') !== undefined || node.attr('async') !== undefined) return;
    if (type && type !== 'text/javascript' && type !== 'application/javascript') return;
    if (KEEP_BLOCKING.some((re) => re.test(src))) return;
    node.attr('defer', '');
    counts.deferred += 1;
  });

  // 2. duplicate FontAwesome CSS (only when the combined bundle is present)
  const hasAllMin = $('link[rel="stylesheet"][href*="/font-awesome/css/all.min.css"]').length > 0;
  if (hasAllMin) {
    for (const suffix of FA_DUPLICATE_HREFS) {
      const nodes = $(`link[rel="stylesheet"][href$="${suffix}"]`);
      counts.faDupes += nodes.length;
      nodes.remove();
    }
  }

  // 3. FontAwesome v4 + shims on pages without fa4 markup
  const usesFa4 = / class="[^"]*\bfa fa-/.test(source);
  if (!usesFa4) {
    for (const suffix of FA4_HREFS) {
      const nodes = $(`link[rel="stylesheet"][href$="${suffix}"]`);
      counts.fa4 += nodes.length;
      nodes.remove();
    }
    const shimJs = $('script[src*="font-awesome/js/v4-shims"]');
    counts.fa4 += shimJs.length;
    shimJs.remove();
  }

  // 4. unlimited-addon swiper on pages without UA sliders.
  // Only the <body> markup counts: the stylesheet's own id ("ua-swiper-css")
  // in <head> must not be mistaken for widget usage.
  const bodySource = source.split('</head>')[1] ?? source;
  const usesUaSlider = /ua[-_](slider|carousel|swiper)/.test(bodySource);
  if (!usesUaSlider) {
    const uaSwiperJs = $('script[src*="unlimited-addon-for-elementor/assets/js/swiper.min.js"]');
    const uaSwiperCss = $('link[rel="stylesheet"][href*="unlimited-addon-for-elementor/assets/css/swiper.min.css"]');
    counts.uaSwiper += uaSwiperJs.length + uaSwiperCss.length;
    uaSwiperJs.remove();
    uaSwiperCss.remove();
  }

  return counts;
}

async function main() {
  const files = await glob('**/index.html', {
    cwd: rootDir,
    nodir: true,
    ignore: PAGE_IGNORES,
  });

  const report = [];
  for (const relative of files.sort()) {
    if (SKIP_FILES.has(relative)) continue;

    const filePath = path.join(rootDir, relative);
    const source = await fs.readFile(filePath, 'utf8');
    const $ = load(source, { decodeEntities: false });
    const counts = tunepage($, source);
    const changed = Object.values(counts).some((v) => v > 0);
    if (!changed) continue;

    report.push({ file: relative, ...counts });
    if (WRITE) {
      await fs.writeFile(filePath, $.html(), 'utf8');
    }
  }

  const mode = WRITE ? 'Tuned' : '[dry-run] Would tune';
  console.log(`${mode} ${report.length} page(s):`);
  for (const row of report.slice(0, 10)) {
    console.log(
      `  ${row.file} — defer:${row.deferred} faDupes:${row.faDupes} fa4:${row.fa4} uaSwiper:${row.uaSwiper}`,
    );
  }
  if (report.length > 10) console.log(`  ... и ещё ${report.length - 10}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
