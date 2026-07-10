/**
 * Strips WordPress / Optimization Detective leftovers from legacy HTML export.
 * These tags and scripts do not work on the static site and only add dead weight.
 *
 * Usage:
 *   node scripts/patches/strip-wp-leftovers.mjs           # dry run
 *   node scripts/patches/strip-wp-leftovers.mjs --write   # applies
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import { load } from 'cheerio';

import { LEGACY_IGNORE } from './known-legacy-issues.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WRITE = process.argv.includes('--write');

const REMOVABLE_STYLE_IDS = new Set([
  'wp-img-auto-sizes-contain-inline-css',
  // NOTE: 'wp-emoji-styles-inline-css' must NOT be removed. Legacy pages
  // contain server-baked <img class="wp-smiley"> emoji (s.w.org SVGs) with
  // no width/height attributes — this CSS is the only thing sizing them
  // to 1em. Removing it blows emojis up to full container width.
  'wp-block-library-inline-css',
]);

/** Sizing rules for server-baked WP emoji images (see NOTE above). */
const EMOJI_SIZING_STYLE = [
  '<style id="wp-emoji-styles-inline-css">',
  'img.wp-smiley, img.emoji {',
  '\tdisplay: inline !important;',
  '\tborder: none !important;',
  '\tbox-shadow: none !important;',
  '\theight: 1em !important;',
  '\twidth: 1em !important;',
  '\tmargin: 0 0.07em !important;',
  '\tvertical-align: -0.1em !important;',
  '\tbackground: none !important;',
  '\tpadding: 0 !important;',
  '}',
  '</style>',
].join('\n');

function pageHasBakedEmoji($) {
  return $('img.wp-smiley, img.emoji').length > 0;
}

function ensureEmojiSizingStyle($) {
  if (!pageHasBakedEmoji($)) return 0;
  if ($('style#wp-emoji-styles-inline-css').length > 0) return 0;
  $('head').append(`\n${EMOJI_SIZING_STYLE}\n`);
  return 1;
}

function hrefIsWpLeftover(href = '') {
  const lower = href.toLowerCase();
  return (
    lower.includes('/wp-json/')
    || lower.includes('xmlrpc.php')
    || lower.includes('/comments/feed/')
  );
}

function linkIsWpLeftover(link) {
  const href = link.attr('href') ?? '';
  const rel = link.attr('rel') ?? '';
  if (hrefIsWpLeftover(href)) return true;
  if (rel === 'https://api.w.org/') return true;
  if (rel === 'shortlink' || rel === 'pingback') return true;
  if ((link.attr('type') ?? '').includes('oembed')) return true;
  return false;
}

function scriptIsWpLeftover(script) {
  const id = script.attr('id') ?? '';
  const src = script.attr('src') ?? '';
  const type = script.attr('type') ?? '';
  const body = script.html() ?? '';

  if (id === 'wp-emoji-settings') return true;
  if (src.includes('wp-emoji-release')) return true;
  if (body.includes('wp-emoji-loader') || body.includes('_wpemojiSettings')) return true;
  if (type === 'module' && body.includes('optimization-detective')) return true;
  if (body.trim() === "console.log('PixelYourSite PRO version 8.6.6');") return true;

  return false;
}

function stripOptimizerAttrs($) {
  let removed = 0;
  $('*').each((_, el) => {
    const node = $(el);
    const attribs = node.attr();
    if (!attribs) return;
    for (const name of Object.keys(attribs)) {
      if (name.startsWith('data-od-')) {
        node.removeAttr(name);
        removed += 1;
      }
    }
  });
  return removed;
}

function stripWpLeftovers($) {
  const counts = {
    links: 0,
    styles: 0,
    scripts: 0,
    optimizerAttrs: 0,
    emojiStylesRestored: 0,
  };

  $('link').each((_, el) => {
    const link = $(el);
    if (!linkIsWpLeftover(link)) return;
    link.remove();
    counts.links += 1;
  });

  $('style').each((_, el) => {
    const style = $(el);
    const id = style.attr('id') ?? '';
    if (!REMOVABLE_STYLE_IDS.has(id)) return;
    style.remove();
    counts.styles += 1;
  });

  $('script').each((_, el) => {
    const script = $(el);
    if (!scriptIsWpLeftover(script)) return;
    script.remove();
    counts.scripts += 1;
  });

  counts.optimizerAttrs = stripOptimizerAttrs($);
  counts.emojiStylesRestored = ensureEmojiSizingStyle($);
  return counts;
}

async function findLegacyHtmlFiles() {
  return glob('**/index.html', {
    cwd: rootDir,
    nodir: true,
    ignore: [...LEGACY_IGNORE, 'apps/web/**', 'assets/**', 'content/**'],
  });
}

async function main() {
  const files = await findLegacyHtmlFiles();
  const report = [];

  for (const relativePath of files) {
    const fullPath = path.join(rootDir, relativePath);
    const original = await fs.readFile(fullPath, 'utf8');
    if (
      !original.includes('wp-json')
      && !original.includes('wp-emoji')
      && !original.includes('wp-smiley')
      && !original.includes('data-od-')
      && !original.includes('optimization-detective')
      && !original.includes('xmlrpc.php')
      && !original.includes('comments/feed/')
    ) {
      continue;
    }

    const $ = load(original, { decodeEntities: false });
    const counts = stripWpLeftovers($);
    const changed = Object.values(counts).some((value) => value > 0);

    if (changed) {
      report.push({ file: relativePath, ...counts });
      if (WRITE) {
        await fs.writeFile(fullPath, $.html(), 'utf8');
      }
    }
  }

  if (!report.length) {
    console.log('No WordPress leftovers found in legacy HTML.');
    return;
  }

  console.log(`${WRITE ? 'Stripped' : 'Would strip'} WordPress leftovers in ${report.length} file(s):\n`);
  for (const row of report) {
    console.log(
      `  ${row.file} — ${row.links} link(s), ${row.styles} style(s), ${row.scripts} script(s), ${row.optimizerAttrs} optimizer attr(s), ${row.emojiStylesRestored} emoji style(s) restored`,
    );
  }

  if (!WRITE) {
    console.log('\nDry run only — re-run with --write to apply.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
