import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { StaticDocument } from '../src/components/StaticDocument.mjs';
import {
  buildRouteMetadata,
  copyStaticAssets,
  discoverWordPressPages,
  outputPathForRoute,
  parseWordPressHtml,
  writeJson,
} from '../src/lib/wordpressHtml.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'dist');

async function main() {
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  const [pages, copiedAssets] = await Promise.all([
    discoverWordPressPages(rootDir),
    copyStaticAssets(rootDir, outDir),
  ]);

  const manifest = [];

  for (const page of pages) {
    const parsed = await parseWordPressHtml(page.sourcePath);
    const routeMetadata = buildRouteMetadata(page.route, parsed);
    const renderedPage = renderToStaticMarkup(
      React.createElement(StaticDocument, {
        htmlAttributes: parsed.htmlAttributes,
        headHtml: parsed.headHtml,
        bodyAttributes: parsed.bodyAttributes,
        bodyHtml: parsed.bodyHtml,
      }),
    );
    const outputPath = outputPathForRoute(outDir, page.route);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, `<!DOCTYPE html>${renderedPage}\n`, 'utf8');

    manifest.push({
      route: page.route,
      source: page.relativePath,
      output: path.relative(outDir, outputPath).replaceAll(path.sep, '/'),
      ...routeMetadata,
      lang: parsed.lang,
      title: parsed.title,
      description: parsed.description,
      canonical: parsed.canonical,
      isRedirect: parsed.isRedirect,
      alternates: parsed.alternates,
      schemaGraphCount: parsed.schemaGraphCount,
      landmarks: parsed.landmarks,
    });
  }

  await writeJson(path.join(outDir, 'react-route-manifest.json'), {
    generatedAt: new Date().toISOString(),
    pageCount: manifest.length,
    assetCount: copiedAssets.length,
    pages: manifest,
  });

  console.log(`Generated ${manifest.length} React-rendered pages in dist/`);
  console.log(`Copied ${copiedAssets.length} static assets`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
