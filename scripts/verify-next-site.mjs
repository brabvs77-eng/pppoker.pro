import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { taxonomyBlogRedirectDestination } from './lib/taxonomy-blog-redirects.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');
const manifestPath = path.join(rootDir, 'content/manifest.json');

function outputPathForRoute(route) {
  if (route === '/') {
    return path.join(outDir, 'index.html');
  }

  return path.join(outDir, route.replace(/^\//, ''), 'index.html');
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const missing = [];

  for (const page of manifest.pages) {
    if (page.isRedirect) continue;
    if (page.route.includes('/apps/web/')) continue;
    if (taxonomyBlogRedirectDestination(page.route, page.locale)) continue;

    const outputPath = outputPathForRoute(page.route);

    try {
      await fs.access(outputPath);
    } catch {
      missing.push(page.route);
    }
  }

  if (missing.length) {
    console.error(`Missing ${missing.length} routes in apps/web/out:`);
    missing.slice(0, 25).forEach((route) => console.error(`  - ${route}`));
    process.exitCode = 1;
    return;
  }

  const active = manifest.pages.filter(
    (p) =>
      !p.isRedirect &&
      !p.route.includes('/apps/web/') &&
      !taxonomyBlogRedirectDestination(p.route, p.locale),
  ).length;
  console.log(`Verified ${active} routes in apps/web/out`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
