import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cloudflareDir = path.join(rootDir, 'deploy/cloudflare');
const outDir = path.join(rootDir, 'apps/web/out');

const COPY_FILES = ['_redirects', '_headers'];

async function main() {
  try {
    await fs.access(outDir);
  } catch {
    console.error('apps/web/out not found — run Next build before emit-cloudflare-config');
    process.exitCode = 1;
    return;
  }

  for (const file of COPY_FILES) {
    const source = path.join(cloudflareDir, file);
    const target = path.join(outDir, file);
    await fs.copyFile(source, target);
    console.log(`Copied deploy/cloudflare/${file} -> apps/web/out/${file}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
