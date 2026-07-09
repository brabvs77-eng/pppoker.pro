/**
 * Removes orphaned duplicate popup content sitting loose in the page body.
 * See patches/pppoker-patches.md section 6.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import { load } from 'cheerio';

import { LEGACY_IGNORE } from './known-legacy-issues.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WRITE = process.argv.includes('--write');

async function findLegacyHtmlFiles() {
  return glob('**/index.html', {
    cwd: rootDir,
    nodir: true,
    ignore: [...LEGACY_IGNORE, 'apps/web/**', 'assets/**', 'content/**'],
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
    if (prev.attr('data-elementor-type')) return;
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

  console.log(
    `${WRITE ? 'Removed' : 'Would remove'} orphaned popup duplicates in ${report.length} file(s):\n`,
  );
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
