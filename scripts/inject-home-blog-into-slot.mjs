import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  loadHomeBlogLabels,
  loadHomeBlogPosts,
  renderHomeBlogSection,
} from './lib/home-blog-static-html.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const homepagePath = path.join(rootDir, 'apps/web/out/index.html');
const slotId = 'native-home-blog-slot';
const slotPattern = new RegExp(`<div id="${slotId}"></div>`);

async function main() {
  const html = await fs.readFile(homepagePath, 'utf8');

  if (!html.includes(`id="${slotId}"`)) {
    console.error(`Missing #${slotId} in out/index.html`);
    process.exitCode = 1;
    return;
  }

  const posts = loadHomeBlogPosts();
  const labels = loadHomeBlogLabels();
  const blogHtml = renderHomeBlogSection({ posts, labels });
  const slotted = `<div id="${slotId}">${blogHtml}</div>`;

  if (!blogHtml) {
    console.error('No home blog posts to inject');
    process.exitCode = 1;
    return;
  }

  let nextHtml = html.replace(slotPattern, slotted);

  // Remove duplicate section exported as a React sibling (client-only rotator).
  const duplicatePattern = /<section class="home-blog"[\s\S]*?<\/section>/;
  const matches = nextHtml.match(new RegExp(duplicatePattern.source, 'g')) ?? [];
  if (matches.length > 1) {
    nextHtml = nextHtml.replace(duplicatePattern, '');
  }

  if (!nextHtml.includes('class="home-blog"')) {
    console.error('Failed to inject home-blog section into homepage slot');
    process.exitCode = 1;
    return;
  }

  await fs.writeFile(homepagePath, nextHtml, 'utf8');
  console.log(`Injected native home blog into #${slotId} on out/index.html`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
