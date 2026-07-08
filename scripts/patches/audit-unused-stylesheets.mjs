/**
 * Removes unused stylesheet <link> tags from legacy HTML exports.
 * See patches/pppoker-patches.md section 7.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import { load } from 'cheerio';

import { LEGACY_IGNORE } from './known-legacy-issues.mjs';

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
    label:
      'Bootstrap grid/utilities — verify by hand (col-/row/container classes too generic to regex safely)',
  },
];

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

  console.log(
    `${WRITE ? 'Removed' : 'Would remove'} unused stylesheet links in ${report.length} file(s):\n`,
  );
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
