import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { load } from 'cheerio';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { HomepageBlogSection } from '../src/components/HomepageBlogSection.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(rootDir, 'index.html');

async function main() {
  const source = await fs.readFile(indexPath, 'utf8');
  const $ = load(source, { decodeEntities: false });
  const oldBlogBlock = $('.static-homepage-blog-grid, .react-homepage-blog')
    .first()
    .closest('.elementor-element-39311d7, .react-homepage-blog');

  if (oldBlogBlock.length === 0) {
    throw new Error('Homepage blog block was not found in index.html');
  }

  oldBlogBlock.replaceWith(renderToStaticMarkup(
    React.createElement(HomepageBlogSection),
  ));

  await fs.writeFile(indexPath, $.html(), 'utf8');
  console.log('Rendered new homepage blog section into index.html');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
