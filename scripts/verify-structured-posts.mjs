import { readFileSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(rootDir, 'content/manifest.json');
const outDir = path.join(rootDir, 'apps/web/out');
const expectedRoutesPath = path.join(
  rootDir,
  'apps/web/src/config/structured-post-routes.json',
);

/** @type {Record<string, string[]>} */
const expectedRoutesByLocale = JSON.parse(readFileSync(expectedRoutesPath, 'utf8'));

function outputPathForRoute(route) {
  if (route === '/') return path.join(outDir, 'index.html');
  return path.join(outDir, route.replace(/^\//, ''), 'index.html');
}

function verifyStructuredPostPage(page, html, violations) {
  if (!html.includes('class="post-article"')) {
    violations.push(`No native post-article shell on ${page.route}`);
  }

  if (html.includes('id="wordpress-page-root"')) {
    violations.push(`Legacy wordpress-page-root still present on ${page.route}`);
  }

  if (html.includes('elementor-frontend-js')) {
    violations.push(`Elementor runtime still loaded on structured post ${page.route}`);
  }

  if (page.ogImage && !html.includes('post-article__hero-image')) {
    violations.push(`Missing featured image on ${page.route}`);
  }

  if (page.needsElementorRuntime !== false) {
    violations.push(`Structured post ${page.route} must have needsElementorRuntime=false`);
  }
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const posts = manifest.pages.filter((p) => p.type === 'post' && p.hasStructuredPost && !p.isRedirect);
  const violations = [];
  let checked = 0;

  for (const page of posts) {
    const outputPath = outputPathForRoute(page.route);
    let html;
    try {
      html = await fs.readFile(outputPath, 'utf8');
    } catch {
      violations.push(`Missing output for structured post: ${page.route}`);
      continue;
    }

    checked += 1;
    verifyStructuredPostPage(page, html, violations);
  }

  for (const [locale, routes] of Object.entries(expectedRoutesByLocale)) {
    for (const route of routes) {
      if (!posts.some((p) => p.route === route)) {
        violations.push(`Missing structured blog post in manifest: ${route} (${locale})`);
      }
    }
  }

  const hyTjPosts = manifest.pages.filter(
    (p) => ['hy', 'tj'].includes(p.locale) && p.type === 'post' && !p.isRedirect,
  );

  for (const page of hyTjPosts) {
    if (!page.hasStructuredPost) {
      violations.push(
        `HY/TJ post ${page.route} is in export but hasStructuredPost=false — check extractPostArticleHtml`,
      );
    }
  }

  if (violations.length) {
    console.error('Structured posts verification failed:');
    violations.slice(0, 20).forEach((line) => console.error(`  - ${line}`));
    if (violations.length > 20) {
      console.error(`  ... and ${violations.length - 20} more`);
    }
    process.exitCode = 1;
    return;
  }

  const counts = Object.fromEntries(
    ['en', 'uz', 'kz', 'hy', 'tj'].map((locale) => [
      locale,
      posts.filter((p) => p.locale === locale).length,
    ]),
  );

  console.log(
    `Verified ${checked} structured post pages (EN ${counts.en}, UZ ${counts.uz}, KZ ${counts.kz}, HY ${counts.hy}, TJ ${counts.tj}).`,
  );

  if (hyTjPosts.length === 0) {
    console.log('HY/TJ: no post HTML in static export yet — add routes to structured-post-routes.json after re-export.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
