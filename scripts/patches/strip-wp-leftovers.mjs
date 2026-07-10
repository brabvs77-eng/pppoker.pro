/**
 * Strips dead WordPress leftovers from legacy HTML before extraction:
 * - oEmbed / EditURI / wlwmanifest / shortlink <link> tags (point to a WP
 *   backend that no longer exists on the static export);
 * - wp-emoji settings JSON + loader script + emoji styles;
 * - optimization-detective / image-prioritizer detect module (POSTs metrics
 *   to a dead wp-json REST endpoint, throwing console errors for visitors);
 * - Google Optimize preload/script (the service was shut down by Google);
 * - data-od-* attributes left by Optimization Detective / Image Prioritizer.
 *
 * Run with --write to apply, without it for a dry-run report.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import { load } from 'cheerio';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WRITE = process.argv.includes('--write');

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

const REMOVABLE_STYLE_IDS = new Set([
  'wp-img-auto-sizes-contain-inline-css',
  'wp-emoji-styles-inline-css',
  'wp-block-library-inline-css',
]);

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

async function main() {
  const files = await glob('**/index.html', {
    cwd: rootDir,
    nodir: true,
    ignore: PAGE_IGNORES,
  });

  let touched = 0;
  let removedTotal = 0;

  for (const relative of files.sort()) {
    const filePath = path.join(rootDir, relative);
    const source = await fs.readFile(filePath, 'utf8');
    const $ = load(source, { decodeEntities: false });
    let removed = 0;

    const linkSelectors = [
      'link[rel="alternate"][type="application/json+oembed"]',
      'link[rel="alternate"][type="text/xml+oembed"]',
      'link[rel="EditURI"]',
      'link[rel="wlwmanifest"]',
      'link[rel="shortlink"]',
      'link[rel="preload"][href*="googleoptimize"]',
      'link[rel="https://api.w.org/"]',
    ];
    for (const selector of linkSelectors) {
      const nodes = $(selector);
      removed += nodes.length;
      nodes.remove();
    }

    $('link[href*="/wp-json/"], link[href*="xmlrpc.php"], link[href*="/comments/feed/"]').each((_, el) => {
      $(el).remove();
      removed += 1;
    });

    for (const styleId of REMOVABLE_STYLE_IDS) {
      $(`style#${styleId}`).each((_, el) => {
        $(el).remove();
        removed += 1;
      });
    }

    $('script#wp-emoji-settings').each((_, el) => {
      $(el).remove();
      removed += 1;
    });
    $('style[id^="wp-emoji"]').each((_, el) => {
      $(el).remove();
      removed += 1;
    });

    $('script').each((_, el) => {
      const node = $(el);
      const text = node.html() ?? '';
      const src = node.attr('src') ?? '';
      if (
        text.includes('wp-emoji-loader') ||
        text.includes('_wpemojiSettings') ||
        src.includes('wp-emoji') ||
        src.includes('googleoptimize')
      ) {
        node.remove();
        removed += 1;
        return;
      }
      if (text.includes('optimization-detective') && node.attr('type') === 'module') {
        node.remove();
        removed += 1;
        return;
      }
      if (text.trim() === "console.log('PixelYourSite PRO version 8.6.6');") {
        node.remove();
        removed += 1;
      }
    });

    removed += stripOptimizerAttrs($);

    if (removed === 0) continue;

    touched += 1;
    removedTotal += removed;

    if (WRITE) {
      await fs.writeFile(filePath, $.html(), 'utf8');
    }
  }

  const mode = WRITE ? 'Stripped' : '[dry-run] Would strip';
  console.log(`${mode} ${removedTotal} WP leftover nodes across ${touched} pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
