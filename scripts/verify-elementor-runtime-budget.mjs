import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  bodyNeedsElementorRuntime,
  isBlogArchiveRoute,
} from './lib/elementor-runtime-budget.mjs';
import { taxonomyBlogRedirectDestination } from './lib/taxonomy-blog-redirects.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(rootDir, 'content/manifest.json');
const bodiesDir = path.join(rootDir, 'content/bodies');

function routeToFileId(route) {
  if (route === '/') return '_root';
  return route.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '__');
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const violations = [];
  let runtimeTrue = 0;
  let runtimeFalse = 0;

  for (const page of manifest.pages) {
    if (page.isRedirect) continue;

    const needsRuntime = page.needsElementorRuntime === true;
    if (needsRuntime) runtimeTrue += 1;
    else runtimeFalse += 1;

    if (page.hasStructuredPost && page.needsElementorRuntime !== false) {
      violations.push(`Structured post ${page.route} must not need Elementor runtime`);
    }

    if (page.hasNativePage && page.needsElementorRuntime !== false) {
      violations.push(`Native page ${page.route} must not need Elementor runtime`);
    }

    if (isBlogArchiveRoute(page.route) && page.needsElementorRuntime !== false) {
      violations.push(`Blog archive ${page.route} must not need Elementor runtime`);
    }

    if (taxonomyBlogRedirectDestination(page.route, page.locale) && page.needsElementorRuntime !== false) {
      violations.push(`Taxonomy redirect ${page.route} must not need Elementor runtime`);
    }

    if (!needsRuntime) continue;

    const bodyPath = path.join(bodiesDir, `${routeToFileId(page.route)}.html`);
    let bodyHtml;
    try {
      bodyHtml = await fs.readFile(bodyPath, 'utf8');
    } catch {
      violations.push(`Missing body HTML for runtime page ${page.route}`);
      continue;
    }

    if (!bodyNeedsElementorRuntime(bodyHtml)) {
      violations.push(
        `Page ${page.route} has needsElementorRuntime=true but body has no interactive markers`,
      );
    }
  }

  if (violations.length) {
    console.error('Elementor runtime budget verification failed:');
    violations.slice(0, 25).forEach((line) => console.error(`  - ${line}`));
    if (violations.length > 25) {
      console.error(`  ... and ${violations.length - 25} more`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `Verified Elementor runtime budget: ${runtimeTrue} pages load runtime, ${runtimeFalse} skip it.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
