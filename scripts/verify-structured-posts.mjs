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
  }

  const enBlogRoutes = [
    '/en/pppoker-review-2026/',
    '/en/know-your-poker-opponents-secrets-of-winning-strategies/',
  ];
  const uzBlogRoutes = ['/uz/pppoker-2026/'];
  const kzBlogRoutes = ['/kz/pppoker-zheke-poker-klubtary-platformasyny-2026/'];

  for (const route of [...enBlogRoutes, ...uzBlogRoutes, ...kzBlogRoutes]) {
    if (!posts.some((p) => p.route === route)) {
      violations.push(`Missing structured blog post in manifest: ${route}`);
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

  const enCount = posts.filter((p) => p.locale === 'en').length;
  const uzCount = posts.filter((p) => p.locale === 'uz').length;
  const kzCount = posts.filter((p) => p.locale === 'kz').length;
  console.log(
    `Verified ${checked} structured post pages (incl. ${enCount} EN, ${uzCount} UZ, ${kzCount} KZ) use native article layout.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
