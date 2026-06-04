import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { discoverWordPressPages, outputPathForRoute } from '../src/lib/wordpressHtml.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'dist');

async function main() {
  const sourcePages = await discoverWordPressPages(rootDir);
  const manifest = JSON.parse(
    await fs.readFile(path.join(outDir, 'react-route-manifest.json'), 'utf8'),
  );
  const missingOutputs = [];

  for (const page of sourcePages) {
    const outputPath = outputPathForRoute(outDir, page.route);

    try {
      await fs.access(outputPath);
    } catch {
      missingOutputs.push(page.route);
    }
  }

  const requiredStaticFiles = [
    'robots.txt',
    'sitemap_index.xml',
    'page-sitemap.xml',
    'post-sitemap.xml',
    'category-sitemap.xml',
    'post_tag-sitemap.xml',
    'main-sitemap.xsl',
  ];

  const missingStaticFiles = [];

  for (const relativePath of requiredStaticFiles) {
    try {
      await fs.access(path.join(outDir, relativePath));
    } catch {
      missingStaticFiles.push(relativePath);
    }
  }

  if (manifest.pageCount !== sourcePages.length) {
    throw new Error(
      `Route count mismatch: manifest has ${manifest.pageCount}, source has ${sourcePages.length}`,
    );
  }

  if (missingOutputs.length > 0) {
    throw new Error(`Missing generated pages: ${missingOutputs.join(', ')}`);
  }

  if (missingStaticFiles.length > 0) {
    throw new Error(`Missing static files: ${missingStaticFiles.join(', ')}`);
  }

  console.log(`Verified ${sourcePages.length} generated routes`);
  console.log(`Verified ${requiredStaticFiles.length} SEO/static support files`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
