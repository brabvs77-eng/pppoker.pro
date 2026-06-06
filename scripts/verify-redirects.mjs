import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  expectedRedirectMaps,
  parseCloudflareRedirects,
} from './lib/collect-redirects.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(rootDir, 'content/manifest.json');
const redirectsPath = path.join(rootDir, 'deploy/cloudflare/_redirects');

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const expected = expectedRedirectMaps(manifest);
  const content = await fs.readFile(redirectsPath, 'utf8');
  const actual = parseCloudflareRedirects(content);

  const missing = [];
  const wrong = [];

  for (const [source, destination] of expected.static) {
    if (!actual.static.has(source)) {
      missing.push(source);
      continue;
    }
    if (actual.static.get(source) !== destination) {
      wrong.push({ source, expected: destination, actual: actual.static.get(source) });
    }
  }

  for (const wildcard of expected.wildcards) {
    const entry = actual.wildcards.find(
      (item) => item.source === wildcard.source && item.destination === wildcard.destination,
    );
    if (!entry) {
      wrong.push({
        source: wildcard.source,
        expected: wildcard.destination,
        actual: '(missing)',
      });
    }
  }

  if (missing.length || wrong.length) {
    console.error('deploy/cloudflare/_redirects out of sync with manifest');
    missing.forEach((source) => console.error(`  missing: ${source}`));
    wrong.forEach(({ source, expected: dest, actual: got }) =>
      console.error(`  wrong ${source}: expected ${dest}, got ${got}`),
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Verified ${expected.static.size} redirects in deploy/cloudflare/_redirects`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
