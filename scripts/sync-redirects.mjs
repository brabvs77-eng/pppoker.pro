import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  collectRedirects,
  formatCloudflareRedirects,
} from './lib/collect-redirects.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(rootDir, 'content/manifest.json');
const cloudflareDir = path.join(rootDir, 'deploy/cloudflare');
const redirectsPath = path.join(cloudflareDir, '_redirects');

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const redirects = collectRedirects(manifest);

  await fs.mkdir(cloudflareDir, { recursive: true });
  await fs.writeFile(redirectsPath, formatCloudflareRedirects(redirects), 'utf8');

  const total = redirects.static.length + redirects.wildcards.length;
  console.log(`Synced ${total} redirects to deploy/cloudflare/_redirects`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
