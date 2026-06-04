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
  const generatedRoutes = new Set(sourcePages.map((page) => page.route));
  const manifest = JSON.parse(
    await fs.readFile(path.join(outDir, 'react-route-manifest.json'), 'utf8'),
  );
  const snippetManifest = JSON.parse(
    await fs.readFile(path.join(outDir, 'site-snippets.json'), 'utf8'),
  );
  const manifestByRoute = new Map(manifest.pages.map((page) => [page.route, page]));
  const nonRedirectRouteCount = manifest.pages.filter((page) => !page.isRedirect).length;
  const missingOutputs = [];
  const pageMismatches = [];
  const sourceHomepage = await parseWordPressHtml(path.join(rootDir, 'index.html'), {
    applyTransforms: false,
    route: '/',
  });

  verifyHomepageBlogLoop(pageMismatches, sourceHomepage.homepageBlogLoop, 'source homepage');

  for (const page of sourcePages) {
    const outputPath = outputPathForRoute(outDir, page.route);

    try {
      await fs.access(outputPath);
    } catch {
      missingOutputs.push(page.route);
      continue;
    }

    const [sourcePage, generatedPage] = await Promise.all([
      parseWordPressHtml(page.sourcePath, { generatedRoutes, route: page.route }),
      parseWordPressHtml(outputPath, { applyTransforms: false, route: page.route }),
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
    verifyLoadMoreTargets(pageMismatches, page.route, generatedPage.loadMoreNextPages, generatedRoutes);

    if (page.route === '/') {
      verifyHomepageBlogLoop(pageMismatches, generatedPage.homepageBlogLoop);
    }

    verifySeoSnippet(pageMismatches, page.route, generatedPage.seoSnippet, generatedPage.isRedirect);

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
      verifySeoSnippet(pageMismatches, page.route, manifestPage.seoSnippet, generatedPage.isRedirect, 'manifest.seoSnippet');
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
    'site-snippets.json',
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

  if (snippetManifest.snippetCount !== nonRedirectRouteCount) {
    throw new Error(
      `Snippet count mismatch: snippet manifest has ${snippetManifest.snippetCount}, non-redirect routes have ${nonRedirectRouteCount}`,
    );
  }

  for (const snippet of snippetManifest.snippets) {
    verifySeoSnippet(pageMismatches, snippet.route, snippet, false, 'site-snippets');
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
  console.log(`Verified ${snippetManifest.snippetCount} generated snippets`);
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
    'contentScriptCount',
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

function verifyHomepageBlogLoop(mismatches, homepageBlogLoop, label = 'homepage') {
  if (!homepageBlogLoop) {
    mismatches.push(`/: missing ${label} blog loop inventory`);
    return;
  }

  if (homepageBlogLoop.loadMoreAnchorCount > 0) {
    mismatches.push(
      `/: ${label} blog loop still has ${homepageBlogLoop.loadMoreAnchorCount} load-more anchors`,
    );
  }

  if (homepageBlogLoop.paginationType === 'load_more_infinite_scroll') {
    mismatches.push(`/: ${label} blog loop still has infinite-scroll pagination enabled`);
  }

  if (homepageBlogLoop.dynamicLoopGridCount > 0) {
    mismatches.push(`/: ${label} still exposes ${homepageBlogLoop.dynamicLoopGridCount} Elementor dynamic loop-grid widgets`);
  }

  if (homepageBlogLoop.staticBlogGridCount !== 1) {
    mismatches.push(`/: ${label} should expose exactly one static homepage blog grid, got ${homepageBlogLoop.staticBlogGridCount}`);
  }

  if (homepageBlogLoop.duplicateHrefs.length > 0) {
    mismatches.push(
      `/: ${label} blog loop has duplicate article links: ${homepageBlogLoop.duplicateHrefs
        .map((duplicate) => `${duplicate.value} (${duplicate.count})`)
        .join(', ')}`,
    );
  }
}

function verifySeoSnippet(mismatches, route, snippet, isRedirect, fieldPrefix = 'seoSnippet') {
  if (isRedirect) {
    return;
  }

  if (!snippet) {
    mismatches.push(`${route}: missing ${fieldPrefix}`);
    return;
  }

  for (const field of [
    'title',
    'description',
    'canonical',
    'ogTitle',
    'ogDescription',
    'ogUrl',
    'ogImage',
    'twitterCard',
    'twitterTitle',
    'twitterDescription',
    'twitterImage',
  ]) {
    if (!snippet[field]) {
      mismatches.push(`${route}: ${fieldPrefix}.${field} is empty`);
    }
  }
}

function verifyLoadMoreTargets(mismatches, route, nextPages, generatedRoutes) {
  for (const nextPage of nextPages) {
    const nextRoute = routeFromUrl(nextPage);

    if (nextRoute && !generatedRoutes.has(nextRoute)) {
      mismatches.push(`${route}: load-more target is not generated: ${nextPage}`);
    }
  }
}

function routeFromUrl(value) {
  try {
    const url = new URL(value, 'https://pppoker.pro');

    if (url.hostname !== 'pppoker.pro') {
      return null;
    }

    return url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
  } catch {
    return null;
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
