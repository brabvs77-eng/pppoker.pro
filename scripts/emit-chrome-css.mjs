import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildChromeOverridesCss } from './lib/elementor-chrome-css.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chromePath = path.join(rootDir, 'apps/web/src/config/elementor-chrome.json');
const outputPath = path.join(rootDir, 'apps/web/src/app/chrome-overrides.css');

async function main() {
  const chrome = JSON.parse(await fs.readFile(chromePath, 'utf8'));
  const css = buildChromeOverridesCss(chrome);
  await fs.writeFile(outputPath, `${css}\n`, 'utf8');
  console.log(`Emitted ${path.relative(rootDir, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
