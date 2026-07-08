import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(rootDir, 'content/manifest.json');
const outputDir = path.join(rootDir, 'apps/web/src/generated');

const localeConfigs = [
  {
    locale: 'ru',
    outputFile: 'ruHomeBlogPosts.json',
    stripTitleSuffix: (title) =>
      title.replace(/\s*-\s*Nuts онлайн покер клуб pppoker россия\s*$/i, '').trim(),
  },
  {
    locale: 'en',
    outputFile: 'enHomeBlogPosts.json',
    stripTitleSuffix: (title) =>
      title.replace(/\s*-\s*Online poker club pppoker Nuts\s*$/i, '').trim(),
  },
  {
    locale: 'uz',
    outputFile: 'uzHomeBlogPosts.json',
    stripTitleSuffix: (title) =>
      title
        .replace(/\s*-\s*Онлайн покер клуби Узбекистонда — PPPoker Nuts, Тошкент\s*$/i, '')
        .trim(),
  },
  {
    locale: 'kz',
    outputFile: 'kzHomeBlogPosts.json',
    stripTitleSuffix: (title) =>
      title
        .replace(/\s*-\s*Қазақстандағы онлайн покер клубы — pppoker Nuts, Астана\s*$/i, '')
        .trim(),
  },
];

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  await fs.mkdir(outputDir, { recursive: true });

  for (const { locale, outputFile, stripTitleSuffix } of localeConfigs) {
    const posts = manifest.pages
      .filter((page) => page.locale === locale && page.type === 'post' && page.publishedAt)
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
      .map((page) => ({
        route: page.route,
        title: stripTitleSuffix(page.title),
        description: page.description,
        publishedAt: page.publishedAt,
        image: page.ogImage || undefined,
      }));

    const outputPath = path.join(outputDir, outputFile);
    await fs.writeFile(outputPath, `${JSON.stringify(posts, null, 2)}\n`, 'utf8');
    console.log(
      `Generated ${posts.length} ${locale.toUpperCase()} home blog posts -> ${path.relative(rootDir, outputPath)}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
