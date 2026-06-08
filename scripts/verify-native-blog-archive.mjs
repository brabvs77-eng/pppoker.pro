import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(rootDir, 'content/manifest.json');
const outDir = path.join(rootDir, 'apps/web/out');

function outputPathForRoute(route) {
  if (route === '/') return path.join(outDir, 'index.html');
  return path.join(outDir, route.replace(/^\//, ''), 'index.html');
}

function isBlogArchiveRoute(route) {
  if (route === '/blog/') return true;
  if (/^\/blog\/page\/\d+\/$/.test(route)) return true;
  return /^\/(en|uz|kz|hy|tj)\/blog(\/page\/\d+)?\/?$/.test(route);
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const archivePages = manifest.pages.filter(
    (page) => !page.isRedirect && isBlogArchiveRoute(page.route),
  );
  const violations = [];
  let checked = 0;

  for (const page of archivePages) {
    const outputPath = outputPathForRoute(page.route);
    let html;
    try {
      html = await fs.readFile(outputPath, 'utf8');
    } catch {
      violations.push(`Missing output for blog archive: ${page.route}`);
      continue;
    }

    checked += 1;

    if (!html.includes('class="blog-archive"')) {
      violations.push(`No native blog-archive shell on ${page.route}`);
    }

    if (html.includes('id="wordpress-page-root"')) {
      violations.push(`Legacy wordpress-page-root still present on ${page.route}`);
    }

    if (html.includes('elementor-frontend-js')) {
      violations.push(`Elementor runtime still loaded on blog archive ${page.route}`);
    }

    if (page.needsElementorRuntime !== false) {
      violations.push(`Manifest needsElementorRuntime should be false for ${page.route}`);
    }
  }

  if (violations.length) {
    console.error('Native blog archive verification failed:');
    violations.slice(0, 20).forEach((line) => console.error(`  - ${line}`));
    if (violations.length > 20) {
      console.error(`  ... and ${violations.length - 20} more`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Verified ${checked} native blog archive pages (no Elementor body/runtime).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
