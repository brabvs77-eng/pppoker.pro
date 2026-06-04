import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(rootDir, 'content/manifest.json');
const outputPath = path.join(rootDir, 'apps/web/src/generated/ruHomeBlogPosts.json');

function stripTitleSuffix(title) {
  return title.replace(/\s*-\s*Nuts онлайн покер клуб pppoker россия\s*$/i, '').trim();
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const posts = manifest.pages
    .filter((page) => page.locale === 'ru' && page.type === 'post' && page.publishedAt)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .map((page) => ({
      route: page.route,
      title: stripTitleSuffix(page.title),
      description: page.description,
      publishedAt: page.publishedAt,
      image: page.ogImage || undefined,
    }));

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(posts, null, 2)}\n`, 'utf8');
  console.log(`Generated ${posts.length} RU home blog posts -> ${path.relative(rootDir, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
