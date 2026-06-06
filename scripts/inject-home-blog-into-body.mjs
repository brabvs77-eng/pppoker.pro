import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  loadHomeBlogLabels,
  loadHomeBlogPosts,
  renderHomeBlogSection,
} from './lib/home-blog-static-html.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bodyPath = path.join(rootDir, 'content/bodies/_root-with-blog-slot.html');
const slotId = 'native-home-blog-slot';
const slotPattern = new RegExp(`<div id="${slotId}"></div>`);

async function main() {
  const bodyHtml = await fs.readFile(bodyPath, 'utf8');

  if (!slotPattern.test(bodyHtml)) {
    if (bodyHtml.includes(`id="${slotId}"`) && bodyHtml.includes('class="home-blog"')) {
      console.log('Home blog already present in homepage body');
      return;
    }

    console.error(`Missing empty #${slotId} in _root-with-blog-slot.html`);
    process.exitCode = 1;
    return;
  }

  const posts = loadHomeBlogPosts();
  const labels = loadHomeBlogLabels();
  const blogHtml = renderHomeBlogSection({ posts, labels });

  if (!blogHtml) {
    console.error('No home blog posts to inject into homepage body');
    process.exitCode = 1;
    return;
  }

  const nextBody = bodyHtml.replace(slotPattern, `<div id="${slotId}">${blogHtml}</div>`);
  await fs.writeFile(bodyPath, nextBody, 'utf8');
  console.log(`Injected native home blog into #${slotId} in _root-with-blog-slot.html`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
