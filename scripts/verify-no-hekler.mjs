import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SCAN_GLOBS = [
  'content/**/*',
  'apps/web/out/**/*.html',
  'llms.txt',
  'apps/web/public/llms.txt',
];

async function main() {
  const hits = [];

  for (const pattern of SCAN_GLOBS) {
    const files = await glob(pattern, { cwd: rootDir, nodir: true });
    for (const relativePath of files) {
      const fullPath = path.join(rootDir, relativePath);
      let content;
      try {
        content = await fs.readFile(fullPath, 'utf8');
      } catch {
        continue;
      }
      if (/hekler\.info/i.test(content)) {
        hits.push(relativePath);
      }
    }
  }

  if (hits.length) {
    console.error('Found hekler.info in:');
    hits.forEach((file) => console.error(`  - ${file}`));
    process.exitCode = 1;
    return;
  }

  console.log('No hekler.info references in generated content.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
