import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expectedRedirectMaps } from './lib/collect-redirects.mjs';
import { taxonomyBlogRedirectDestination } from './lib/taxonomy-blog-redirects.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(rootDir, 'content/manifest.json');

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const expected = expectedRedirectMaps(manifest);
  const violations = [];
  let checked = 0;

  for (const page of manifest.pages) {
    if (page.isRedirect) continue;

    const destination = taxonomyBlogRedirectDestination(page.route, page.locale);
    if (!destination) continue;

    checked += 1;
    const source = page.route.replace(/\/$/, '') || '/';

    if (!expected.static.has(source)) {
      violations.push(`Missing taxonomy redirect for ${page.route} -> ${destination}`);
      continue;
    }

    if (expected.static.get(source) !== destination) {
      violations.push(
        `Wrong taxonomy redirect for ${source}: expected ${destination}, got ${expected.static.get(source)}`,
      );
    }
  }

  if (violations.length) {
    console.error('Taxonomy blog redirect verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(`Verified ${checked} category/tag -> native blog redirects in _redirects.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
