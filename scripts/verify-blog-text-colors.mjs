import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const globalsPath = path.join(rootDir, 'apps/web/src/app/globals.css');
const manifestPath = path.join(rootDir, 'content/manifest.json');
const postsDir = path.join(rootDir, 'content/posts');
const outDir = path.join(rootDir, 'apps/web/out');

const DARK_BG = '#131b2b';
const LIGHT_TEXT = '#e8ecf4';
const ACCENT_TEXT = '#fde661';

const SAMPLE_POST_ROUTES = [
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

function assertDarkThemeBlock(css, selector, violations) {
  const blockMatch = css.match(new RegExp(`\\${selector}\\{[^}]+\\}`));
  if (!blockMatch) {
    violations.push(`Missing ${selector} rules in exported CSS`);
    return;
  }

  const block = blockMatch[0];
  if (!block.includes(DARK_BG)) {
    violations.push(`${selector} must use background ${DARK_BG}`);
  }
}

function assertLightTextBlock(css, selector, violations) {
  const blockMatch = css.match(new RegExp(`\\${selector}\\{[^}]+\\}`));
  if (!blockMatch) {
    violations.push(`Missing ${selector} rules in exported CSS`);
    return;
  }

  const block = blockMatch[0];
  if (!block.includes(LIGHT_TEXT)) {
    violations.push(`${selector} must use color ${LIGHT_TEXT}`);
  }
}

async function main() {
  const violations = [];
  const globals = await fs.readFile(globalsPath, 'utf8');

  for (const selector of ['.blog-surface', '.post-article', '.blog-archive']) {
    const block = globals.match(new RegExp(`${selector.replace('.', '\\.')}\\s*\\{[^}]+\\}`));
    if (!block) {
      violations.push(`Missing ${selector} in globals.css`);
      continue;
    }
    if (selector === '.blog-surface' && !block[0].includes(DARK_BG)) {
      violations.push(`${selector} in globals.css must use full-width dark background ${DARK_BG}`);
    }
    if (selector !== '.blog-surface' && !block[0].includes(LIGHT_TEXT)) {
      violations.push(`${selector} in globals.css must use light text ${LIGHT_TEXT}`);
    }
  }

  if (!globals.includes('.blog-breadcrumbs')) {
    violations.push('globals.css must style .blog-breadcrumbs');
  }

  if (!globals.includes('.post-article__hero-image')) {
    violations.push('globals.css must style .post-article__hero-image');
  }

  const accentBlock = globals.match(/\.post-article__content h2[\s\S]*?\{[^}]+\}/);
  if (!accentBlock || !accentBlock[0].includes(ACCENT_TEXT)) {
    violations.push(`post-article headings must use accent color ${ACCENT_TEXT}`);
  }

  const bundlePath = await findNextCssBundle();
  const bundleCss = await fs.readFile(bundlePath, 'utf8');
  assertDarkThemeBlock(bundleCss, '.blog-surface', violations);
  assertLightTextBlock(bundleCss, '.post-article', violations);
  assertLightTextBlock(bundleCss, '.blog-archive', violations);

  for (const route of ['/blog/', ...SAMPLE_POST_ROUTES]) {
    const outputPath = outputPathForRoute(route);
    let html;
    try {
      html = await fs.readFile(outputPath, 'utf8');
    } catch {
      violations.push(`Missing export for sample route: ${route}`);
      continue;
    }

    const shellClass = route.endsWith('/blog/') ? 'blog-archive' : 'post-article';
    if (!html.includes('class="blog-surface"')) {
      violations.push(`${route} missing full-width blog-surface wrapper`);
    }
    if (!html.includes(`class="${shellClass}"`)) {
      violations.push(`${route} missing native ${shellClass} shell`);
    }
    if (!html.includes('class="blog-breadcrumbs"')) {
      violations.push(`${route} missing blog breadcrumbs`);
    }
  }

  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

  for (const route of SAMPLE_POST_ROUTES) {
    const page = manifest.pages.find((entry) => entry.route === route);
    if (!page) {
      violations.push(`Missing manifest entry for ${route}`);
      continue;
    }

    let post;
    try {
      post = JSON.parse(await fs.readFile(path.join(postsDir, `${page.fileId}.json`), 'utf8'));
    } catch {
      violations.push(`Missing post JSON for ${route} (${page.fileId}.json)`);
      continue;
    }

    if (!post.image) {
      violations.push(`${route} post JSON must include featured image`);
      continue;
    }

    const html = await fs.readFile(outputPathForRoute(route), 'utf8');
    if (!html.includes('post-article__hero-image')) {
      violations.push(`${route} export must render post-article__hero-image`);
    }
    if (!html.includes(post.image)) {
      violations.push(`${route} export must include image src ${post.image}`);
    }
  }

  if (violations.length) {
    console.error('Blog text color verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    `Verified blog dark theme + featured images on ${SAMPLE_POST_ROUTES.length} sample posts.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
