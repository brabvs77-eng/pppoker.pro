import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const homepagePath = path.join(rootDir, 'apps/web/out/index.html');

async function main() {
  const html = await fs.readFile(homepagePath, 'utf8');
  const violations = [];

  if (!html.includes('data-hide-legacy-blog')) {
    violations.push('Missing data-hide-legacy-blog on RU homepage');
  }

  if (!html.includes('class="home-blog"')) {
    violations.push('Missing native home-blog section in out/index.html');
  }

  const cardCount = (html.match(/class="home-blog__card"/g) ?? []).length;
  if (cardCount < 6) {
    violations.push(`Expected at least 6 home-blog cards on homepage, found ${cardCount}`);
  }

  if (html.includes('data-id="39eeae8"')) {
    violations.push(
      'Legacy Elementor blog loop widget (39eeae8) still in homepage HTML',
    );
  }

  const homeBlogIndex = html.indexOf('class="home-blog"');
  const footerIndex = html.indexOf('id="colophon"');
  if (homeBlogIndex !== -1 && footerIndex !== -1 && homeBlogIndex > footerIndex) {
    violations.push('home-blog section renders after footer — placement regression');
  }

  if (violations.length) {
    console.error('Home blog verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(`Verified native home blog on homepage (${cardCount} cards, before footer).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
