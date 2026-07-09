/**
 * Removes all WhatsApp CTA links/widgets from legacy WordPress/Elementor HTML.
 *
 * Usage:
 *   node scripts/patches/remove-whatsapp-buttons.mjs           # dry run
 *   node scripts/patches/remove-whatsapp-buttons.mjs --write   # applies
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';
import { load } from 'cheerio';

import { LEGACY_IGNORE } from './known-legacy-issues.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WRITE = process.argv.includes('--write');

const WHATSAPP_HREF_MARKERS = ['wa.clck.bar', 'whatsapp.com', 'api.whatsapp.com'];

function hrefIsWhatsapp(href = '') {
  const lower = href.toLowerCase();
  return WHATSAPP_HREF_MARKERS.some((marker) => lower.includes(marker));
}

async function findLegacyHtmlFiles() {
  return glob('**/index.html', {
    cwd: rootDir,
    nodir: true,
    ignore: [...LEGACY_IGNORE, 'apps/web/**', 'assets/**', 'content/**'],
  });
}

function nearestElementorWidget(node) {
  let current = node;
  for (let depth = 0; depth < 10; depth += 1) {
    if (!current.length) return null;
    if (current.hasClass('elementor-element') && current.attr('data-id')) {
      return current;
    }
    current = current.parent();
  }
  return null;
}

function removeWhatsappFromFile($) {
  let removedLinks = 0;
  let removedWidgets = 0;

  $('a[href]').each((_, el) => {
    const link = $(el);
    const href = link.attr('href') ?? '';
    if (!hrefIsWhatsapp(href)) return;

    if (link.hasClass('hero-cta-btn--whatsapp')) {
      link.remove();
      removedLinks += 1;
      return;
    }

    const widget = nearestElementorWidget(link);
    if (widget) {
      widget.remove();
      removedWidgets += 1;
    } else {
      link.remove();
      removedLinks += 1;
    }
  });

  $('.hero-cta-btn--whatsapp').remove();

  $('img[src*="whaggtsapp"]').each((_, el) => {
    const widget = nearestElementorWidget($(el));
    if (widget) {
      widget.remove();
      removedWidgets += 1;
    } else {
      $(el).remove();
      removedLinks += 1;
    }
  });

  return { removedLinks, removedWidgets };
}

async function main() {
  const files = await findLegacyHtmlFiles();
  const report = [];

  for (const relativePath of files) {
    const fullPath = path.join(rootDir, relativePath);
    const original = await fs.readFile(fullPath, 'utf8');
    if (!WHATSAPP_HREF_MARKERS.some((marker) => original.includes(marker)) && !original.includes('whaggtsapp')) {
      continue;
    }

    const $ = load(original, { decodeEntities: false });
    const { removedLinks, removedWidgets } = removeWhatsappFromFile($);

    if (removedLinks || removedWidgets) {
      report.push({ file: relativePath, removedLinks, removedWidgets });
      if (WRITE) {
        await fs.writeFile(fullPath, $.html(), 'utf8');
      }
    }
  }

  if (!report.length) {
    console.log('No WhatsApp buttons found in legacy HTML.');
    return;
  }

  console.log(`${WRITE ? 'Removed' : 'Would remove'} WhatsApp CTAs in ${report.length} file(s):\n`);
  for (const row of report) {
    console.log(
      `  ${row.file} — ${row.removedWidgets} widget(s), ${row.removedLinks} loose link(s)`,
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
