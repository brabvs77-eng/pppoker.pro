/**
 * Regression guard for blog post tags + related-posts pipeline (pppoker-patches §9).
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(rootDir, 'content');

async function main() {
  const violations = [];

  const tagNamesPath = path.join(contentDir, 'tag-names.json');
  try {
    await fs.access(tagNamesPath);
  } catch {
    violations.push('content/tag-names.json missing — run npm run extract:content');
    report(violations);
    return;
  }

  const tagNames = JSON.parse(await fs.readFile(tagNamesPath, 'utf8'));
  const tagSlugCount = Object.keys(tagNames).length;
  if (tagSlugCount < 4) {
    violations.push(`tag-names.json has only ${tagSlugCount} entries (expected ≥4 RU tags)`);
  }

  const manifest = JSON.parse(await fs.readFile(path.join(contentDir, 'manifest.json'), 'utf8'));
  const posts = manifest.pages.filter((page) => page.type === 'post' && page.hasStructuredPost);
  const taggedPosts = posts.filter((page) => Array.isArray(page.tags) && page.tags.length > 0);

  if (taggedPosts.length < 10) {
    violations.push(
      `Only ${taggedPosts.length} structured posts have tags (expected ≥10 from RU tag archives)`,
    );
  }

  const sample = taggedPosts.find((page) => page.route.includes('/blog-chto-takoe-ev-v-pokere/'));
  if (sample && (!sample.tags || sample.tags.length === 0)) {
    violations.push('Sample post /blog-chto-takoe-ev-v-pokere/ has no tags');
  }

  report(violations);
}

function report(violations) {
  if (violations.length) {
    console.error('verify-post-tags failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log('verify-post-tags: OK');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
