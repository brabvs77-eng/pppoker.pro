import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(rootDir, 'apps/web/public');

const COPY_DIRS = ['assets', 'includes'];
const COPY_FILES = [
  'robots.txt',
  'sitemap.xml',
  'sitemap_index.xml',
  'post-sitemap.xml',
  'page-sitemap.xml',
  'category-sitemap.xml',
  'post_tag-sitemap.xml',
  'main-sitemap.xsl',
  'llms.txt',
  'feed.xml',
];

async function copyDir(from, to) {
  await fs.cp(from, to, { recursive: true, force: true });
}

async function main() {
  await fs.mkdir(publicDir, { recursive: true });

  for (const dir of COPY_DIRS) {
    const source = path.join(rootDir, dir);
    try {
      await copyDir(source, path.join(publicDir, dir));
      console.log(`Copied ${dir}/ -> apps/web/public/${dir}/`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      console.warn(`Skipped missing directory: ${dir}`);
    }
  }

  for (const file of COPY_FILES) {
    const source = path.join(rootDir, file);
    try {
      await fs.copyFile(source, path.join(publicDir, file));
      console.log(`Copied ${file}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
