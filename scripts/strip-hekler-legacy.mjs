import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';

import { normalizeUrls } from '../src/lib/normalizeUrls.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const LEGACY_GLOBS = [
  '**/index.html',
  'assets/media/simply-static/configs/fuse-index.json',
  'llms.txt',
];

const IGNORE = ['**/node_modules/**', '**/apps/**', '**/content/**', '**/.git/**'];

async function main() {
  let updated = 0;

  for (const pattern of LEGACY_GLOBS) {
    const files = await glob(pattern, { cwd: rootDir, nodir: true, ignore: IGNORE });

    for (const relativePath of files) {
      const fullPath = path.join(rootDir, relativePath);
      const original = await fs.readFile(fullPath, 'utf8');

      if (!/hekler\.info/i.test(original)) continue;

      const next = normalizeUrls(original);
      if (next === original) {
        console.warn(`Still contains hekler after normalize: ${relativePath}`);
        continue;
      }

      await fs.writeFile(fullPath, next, 'utf8');
      updated += 1;
    }
  }

  console.log(`Stripped hekler.info from ${updated} legacy files.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
