import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(rootDir, 'apps/web/src/config/post-translations/posts');

const WC = 'has-white-color has-text-color';

export function p(html) {
  return `<p class="${WC}">${html}</p>`;
}

export function h2(html) {
  return `<h2 class="${WC}">${html}</h2>`;
}

export function h3(html) {
  return `<h3 class="${WC}">${html}</h3>`;
}

export function h4(html) {
  return `<h4 class="${WC}">${html}</h4>`;
}

export function writePostTranslation(postId, locales) {
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${postId}.json`);
  writeFileSync(outPath, `${JSON.stringify(locales, null, 2)}\n`, 'utf8');
  return outPath;
}
