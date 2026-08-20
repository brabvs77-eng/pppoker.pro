/**
 * Removes leaked EN Elementor popup templates from RU locale HTML exports.
 *
 * RU pages ship both localized popup IDs (3989, 3946, 3981, 3997) and stray EN
 * library templates (886, 834, 893, 840). The EN popups render English copy on
 * unprefixed routes. Localized popups reuse the same CSS classes (elementor-886,
 * elementor-834, …) so inline <style id="elementor-post-886"> blocks are kept.
 *
 * Usage:
 *   node scripts/patches/fix-english-popups-on-ru.mjs           # dry run
 *   node scripts/patches/fix-english-popups-on-ru.mjs --write   # apply
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import { load } from 'cheerio';

import {
  EN_POPUP_TEMPLATE_IDS,
  isRuLegacyPage,
  LEGACY_IGNORE,
} from './known-legacy-issues.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WRITE = process.argv.includes('--write');

async function findLegacyHtmlFiles() {
  return glob('**/index.html', {
    cwd: rootDir,
    nodir: true,
    ignore: [...LEGACY_IGNORE, 'apps/web/**', 'assets/**', 'content/**'],
  });
}

/**
 * @param {import('cheerio').CheerioAPI} $
 * @returns {{ removed: number; removedIds: string[] }}
 */
function removeEnglishPopups($) {
  let removed = 0;
  const removedIds = [];

  for (const id of EN_POPUP_TEMPLATE_IDS) {
    $(`[data-elementor-type="popup"][data-elementor-id="${id}"]`).each((_, el) => {
      $(el).remove();
      removed += 1;
      removedIds.push(id);
    });
  }

  return { removed, removedIds };
}

async function main() {
  const files = await findLegacyHtmlFiles();
  const report = [];

  for (const relativePath of files) {
    if (!isRuLegacyPage(relativePath)) continue;

    const fullPath = path.join(rootDir, relativePath);
    const original = await fs.readFile(fullPath, 'utf8');
    if (!EN_POPUP_TEMPLATE_IDS.some((id) => original.includes(`data-elementor-id="${id}"`))) {
      continue;
    }

    const $ = load(original, { decodeEntities: false });
    const { removed, removedIds } = removeEnglishPopups($);

    if (removed > 0) {
      report.push({ file: relativePath, removed, removedIds: [...new Set(removedIds)] });
      if (WRITE) {
        await fs.writeFile(fullPath, $.html(), 'utf8');
      }
    }
  }

  if (!report.length) {
    console.log('No EN popup templates found on RU pages.');
    return;
  }

  console.log(
    `${WRITE ? 'Removed' : 'Would remove'} EN popup templates in ${report.length} file(s):\n`,
  );
  for (const row of report) {
    console.log(`  ${row.file} — popup id(s): ${row.removedIds.join(', ')}`);
  }

  if (!WRITE) {
    console.log('\nDry run only — re-run with --write to apply.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
