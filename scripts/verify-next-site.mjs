import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');
const manifestPath = path.join(rootDir, 'content/manifest.json');

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const missing = [];

  for (const page of manifest.pages) {
    if (page.isRedirect) continue;

    const outputPath =
      page.route === '/'
        ? path.join(outDir, 'index.html')
        : path.join(outDir, page.route.replace(/^\//, ''), 'index.html');

    try {
      await fs.access(outputPath);
    } catch {
      missing.push(page.route);
    }
  }

  if (missing.length) {
    console.error(`Missing ${missing.length} routes in apps/web/out:`);
    missing.slice(0, 20).forEach((route) => console.error(`  - ${route}`));
    process.exitCode = 1;
    return;
  }

  const active = manifest.pages.filter((page) => !page.isRedirect).length;
  console.log(`Verified ${active} routes in apps/web/out`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
