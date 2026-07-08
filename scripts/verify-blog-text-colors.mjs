import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const globalsPath = path.join(rootDir, 'apps/web/src/app/globals.css');
const outDir = path.join(rootDir, 'apps/web/out');

const DARK_TEXT = '#1a1a1a';
const WHITE_BG = '#fff';

const SAMPLE_ROUTES = [
  '/blog/',
  '/en/blog/',
  '/blog-chto-takoe-ev-v-pokere/',
  '/en/pppoker-review-2026/',
];

function outputPathForRoute(route) {
  if (route === '/') return path.join(outDir, 'index.html');
  return path.join(outDir, route.replace(/^\//, ''), 'index.html');
}

async function findNextCssBundle() {
  const cssDir = path.join(outDir, '_next/static/css');
  const files = await fs.readdir(cssDir);
  const bundle = files.find((file) => file.endsWith('.css'));
  if (!bundle) throw new Error('No Next.js CSS bundle in apps/web/out/_next/static/css');
  return path.join(cssDir, bundle);
}

function assertDarkOnLightBlock(css, selector, violations) {
  const blockMatch = css.match(new RegExp(`\\${selector}\\{[^}]+\\}`));
  if (!blockMatch) {
    violations.push(`Missing ${selector} rules in exported CSS`);
    return;
  }

  const block = blockMatch[0];
  if (!block.includes(`background:${WHITE_BG}`) && !block.includes(`background: ${WHITE_BG}`)) {
    violations.push(`${selector} must use background ${WHITE_BG}`);
  }
  if (!block.includes(`color:${DARK_TEXT}`) && !block.includes(`color: ${DARK_TEXT}`)) {
    violations.push(`${selector} must use color ${DARK_TEXT}`);
  }
  if (block.includes('color:#fff') || block.includes('color: #fff')) {
    violations.push(`${selector} must not use white text on a light surface`);
  }
}

async function main() {
  const violations = [];
  const globals = await fs.readFile(globalsPath, 'utf8');

  for (const selector of ['.blog-archive', '.post-article', '.native-page']) {
    const block = globals.match(new RegExp(`${selector.replace('.', '\\.')}\\s*\\{[^}]+\\}`));
    if (!block) {
      violations.push(`Missing ${selector} in globals.css`);
      continue;
    }
    if (block[0].includes('color: #fff') || block[0].includes('color:#fff')) {
      violations.push(`${selector} in globals.css must not set color: #fff`);
    }
  }

  const bundlePath = await findNextCssBundle();
  const bundleCss = await fs.readFile(bundlePath, 'utf8');
  assertDarkOnLightBlock(bundleCss, '.blog-archive', violations);
  assertDarkOnLightBlock(bundleCss, '.post-article', violations);

  for (const route of SAMPLE_ROUTES) {
    const outputPath = outputPathForRoute(route);
    let html;
    try {
      html = await fs.readFile(outputPath, 'utf8');
    } catch {
      violations.push(`Missing export for sample route: ${route}`);
      continue;
    }

    const shellClass = route.includes('/blog/') && !route.includes('-')
      ? 'blog-archive'
      : 'post-article';
    if (!html.includes(`class="${shellClass}"`)) {
      violations.push(`${route} missing native ${shellClass} shell`);
    }
  }

  if (violations.length) {
    console.error('Blog text color verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    `Verified blog text colors: ${SAMPLE_ROUTES.length} sample routes, dark text on white in CSS bundle.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
