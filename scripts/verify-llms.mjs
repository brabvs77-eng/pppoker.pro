import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');
const llmsPaths = [
  path.join(rootDir, 'llms.txt'),
  path.join(rootDir, 'apps/web/public/llms.txt'),
  path.join(outDir, 'llms.txt'),
];

const HEAD_LINK_SAMPLES = [
  { route: '/', label: 'RU homepage' },
  { route: '/blog/', label: 'RU blog archive (native)' },
  { route: '/en/user-agreement/', label: 'EN native legal page' },
];

/** Broken URL from old generator: https://pppoker.proen/ (missing slash). */
const BROKEN_LOCALE_URL = /pppoker\.pro(?:en|hy|uz|kz|tj|ru)\//;

function outputPathForRoute(route) {
  if (route === '/') return path.join(outDir, 'index.html');
  return path.join(outDir, route.replace(/^\//, ''), 'index.html');
}

function extractMarkdownLinks(text) {
  const links = [];
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    links.push(match[1]);
  }
  return links;
}

async function main() {
  const violations = [];

  for (const llmsPath of llmsPaths) {
    let text;
    try {
      text = await fs.readFile(llmsPath, 'utf8');
    } catch {
      violations.push(`Missing ${path.relative(rootDir, llmsPath)}`);
      continue;
    }

    if (!text.includes('## Страницы')) {
      violations.push(`${path.relative(rootDir, llmsPath)}: missing "## Страницы" section`);
    }

    if (!text.includes('## Записи блога')) {
      violations.push(`${path.relative(rootDir, llmsPath)}: missing "## Записи блога" section`);
    }

    if (!text.includes('https://pppoker.pro/sitemap_index.xml')) {
      violations.push(`${path.relative(rootDir, llmsPath)}: missing sitemap link`);
    }

    const links = extractMarkdownLinks(text);
    if (links.length < 10) {
      violations.push(`${path.relative(rootDir, llmsPath)}: expected at least 10 links, found ${links.length}`);
    }

    for (const href of links) {
      if (BROKEN_LOCALE_URL.test(href)) {
        violations.push(`${path.relative(rootDir, llmsPath)}: broken locale URL ${href}`);
      }

      if (href.startsWith('https://pppoker.pro') && !href.includes('://pppoker.pro/') && href !== 'https://pppoker.pro') {
        violations.push(`${path.relative(rootDir, llmsPath)}: malformed absolute URL ${href}`);
      }
    }
  }

  for (const { route, label } of HEAD_LINK_SAMPLES) {
    const outputPath = outputPathForRoute(route);
    let html;
    try {
      html = await fs.readFile(outputPath, 'utf8');
    } catch {
      violations.push(`[${label}] missing export at ${route}`);
      continue;
    }

    if (!html.includes('href="/llms.txt"') || !html.includes('type="text/plain"')) {
      violations.push(`[${label}] missing llms.txt head link`);
    }
  }

  if (violations.length) {
    console.error('verify-llms failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(`verify-llms: OK (${llmsPaths.length} copies, ${HEAD_LINK_SAMPLES.length} head links)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
