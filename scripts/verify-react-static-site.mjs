import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildRouteMetadata,
  discoverWordPressPages,
  outputPathForRoute,
  parseWordPressHtml,
} from '../src/lib/wordpressHtml.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'dist');

async function main() {
  const sourcePages = await discoverWordPressPages(rootDir);
  const manifest = JSON.parse(
    await fs.readFile(path.join(outDir, 'react-route-manifest.json'), 'utf8'),
  );
  const manifestByRoute = new Map(manifest.pages.map((page) => [page.route, page]));
  const missingOutputs = [];
  const pageMismatches = [];

  for (const page of sourcePages) {
    const outputPath = outputPathForRoute(outDir, page.route);

    try {
      await fs.access(outputPath);
    } catch {
      missingOutputs.push(page.route);
      continue;
    }

    const [sourcePage, generatedPage] = await Promise.all([
      parseWordPressHtml(page.sourcePath),
      parseWordPressHtml(outputPath),
    ]);
    const manifestPage = manifestByRoute.get(page.route);
    const expectedMetadata = buildRouteMetadata(page.route, sourcePage);

    comparePageField(pageMismatches, page.route, 'title', sourcePage.title, generatedPage.title);
    comparePageField(
      pageMismatches,
      page.route,
      'description',
      sourcePage.description,
      generatedPage.description,
    );
    comparePageField(
      pageMismatches,
      page.route,
      'canonical',
      sourcePage.canonical,
      generatedPage.canonical,
    );
    comparePageField(pageMismatches, page.route, 'lang', sourcePage.lang, generatedPage.lang);
    comparePageField(
      pageMismatches,
      page.route,
      'schemaGraphCount',
      sourcePage.schemaGraphCount,
      generatedPage.schemaGraphCount,
    );
    comparePageField(
      pageMismatches,
      page.route,
      'alternateCount',
      sourcePage.alternates.length,
      generatedPage.alternates.length,
    );
    compareFragmentInventory(
      pageMismatches,
      page.route,
      sourcePage.fragmentInventory,
      generatedPage.fragmentInventory,
    );

    if (!manifestPage) {
      pageMismatches.push(`${page.route}: missing route manifest entry`);
    } else {
      comparePageField(pageMismatches, page.route, 'manifest.locale', expectedMetadata.locale, manifestPage.locale);
      comparePageField(pageMismatches, page.route, 'manifest.type', expectedMetadata.type, manifestPage.type);
      compareFragmentInventory(
        pageMismatches,
        page.route,
        sourcePage.fragmentInventory,
        manifestPage.fragmentInventory,
        'manifest.fragmentInventory',
      );
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

  if (pageMismatches.length > 0) {
    throw new Error(`Generated page mismatches:\n${pageMismatches.join('\n')}`);
  }

  console.log(`Verified ${sourcePages.length} generated routes`);
  console.log('Verified SEO snapshots for generated routes');
  console.log(`Verified ${requiredStaticFiles.length} SEO/static support files`);
}

function comparePageField(mismatches, route, field, expected, actual) {
  if (expected !== actual) {
    mismatches.push(`${route}: ${field} mismatch: expected ${formatValue(expected)}, got ${formatValue(actual)}`);
  }
}

function compareFragmentInventory(
  mismatches,
  route,
  expected,
  actual,
  fieldPrefix = 'fragmentInventory',
) {
  for (const key of [
    'hasBeforeHeader',
    'hasHeader',
    'hasFooter',
    'hasAfterFooter',
    'contentLength',
    'afterFooterScriptCount',
  ]) {
    comparePageField(
      mismatches,
      route,
      `${fieldPrefix}.${key}`,
      expected?.[key],
      actual?.[key],
    );
  }
}

function formatValue(value) {
  if (value === '') {
    return '<empty>';
  }

  return JSON.stringify(value);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
