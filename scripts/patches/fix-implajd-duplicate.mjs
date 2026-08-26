import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const postPath = path.join(
  rootDir,
  'implajd-oddsy-v-pokere-kak-primenyat-potentsialnye-shansy-banka/index.html',
);

export function fixImplajdDuplicatePost({ checkOnly = false } = {}) {
  let html = readFileSync(postPath, 'utf8');
  const original = html;

  html = html.replace(
    'href="http://aebufeu34Hd/"',
    'href="/author-roman-shaposhnikov/"',
  );

  const separator =
    '<p class="has-white-color has-text-color has-link-color wp-elements-61ddc650e6912d83d05b6f4750d91d46">=============================================================</p>';
  const separatorIndex = html.indexOf(separator);
  if (separatorIndex !== -1) {
    const closing = '\n\n\n<p>&nbsp;</p>\n\t\t\t\t</div>';
    const closingIndex = html.indexOf(closing, separatorIndex);
    if (closingIndex !== -1) {
      html = `${html.slice(0, separatorIndex)}${html.slice(closingIndex)}`;
    }
  }

  if (html === original) {
    return { changed: false };
  }

  if (checkOnly) {
    return { changed: true, dryRun: true };
  }

  writeFileSync(postPath, html, 'utf8');
  return { changed: true };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const result = fixImplajdDuplicatePost({ checkOnly: process.argv.includes('--check') });
  if (result.dryRun) {
    console.error('fix-implajd-duplicate: auto-fixable issues remain');
    process.exitCode = 1;
  } else if (result.changed) {
    console.log('fix-implajd-duplicate: cleaned duplicate section and author link');
  } else {
    console.log('fix-implajd-duplicate: nothing to change');
  }
}
