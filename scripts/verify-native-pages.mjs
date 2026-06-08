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

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const pages = manifest.pages.filter((p) => p.hasNativePage && !p.isRedirect);
  const violations = [];
  let checked = 0;

  for (const page of pages) {
    const outputPath = outputPathForRoute(page.route);
    let html;
    try {
      html = await fs.readFile(outputPath, 'utf8');
    } catch {
      violations.push(`Missing output for native page: ${page.route}`);
      continue;
    }

    checked += 1;

    if (!html.includes('class="native-page"')) {
      violations.push(`No native-page shell on ${page.route}`);
    }

    if (html.includes('id="wordpress-page-root"')) {
      violations.push(`Legacy wordpress-page-root still present on ${page.route}`);
    }

    if (html.includes('elementor-frontend-js')) {
      violations.push(`Elementor runtime still loaded on native page ${page.route}`);
    }

    if (page.type !== 'page') {
      violations.push(`Manifest type should be page for native page ${page.route}, got ${page.type}`);
    }

    if (page.hasStructuredPost) {
      violations.push(`Native page ${page.route} must not have hasStructuredPost`);
    }
  }

  if (violations.length) {
    console.error('Native pages verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(`Verified ${checked} native pages (legal/about) without Elementor body/runtime.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
