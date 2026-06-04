import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = path.join(rootDir, 'content/posts');
const publicDir = path.join(rootDir, 'apps/web/public');

const SITE_URL = 'https://pppoker.pro';
const FEED_TITLE = 'Nuts PPPoker — блог';
const FEED_DESCRIPTION = 'Статьи о покере, стратегии и клубе Nuts на PPPoker';

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function absolutePostUrl(route) {
  const pathPart = route === '/' ? '' : route.replace(/\/$/, '');
  return `${SITE_URL}${pathPart}/`;
}

async function main() {
  const files = await glob('*.json', { cwd: postsDir, nodir: true });
  const posts = [];

  for (const file of files) {
    const post = JSON.parse(await fs.readFile(path.join(postsDir, file), 'utf8'));
    if (post.locale !== 'ru' || !post.publishedAt) continue;
    posts.push(post);
  }

  posts.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  const items = posts
    .slice(0, 30)
    .map((post) => {
      const link = absolutePostUrl(post.route);
      const description = escapeXml(post.description || stripHtml(post.html).slice(0, 280));
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${description}</description>
    </item>`;
    })
    .join('\n');

  const updated = new Date().toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${SITE_URL}/blog/</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>ru-RU</language>
    <lastBuildDate>${updated}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(path.join(publicDir, 'feed.xml'), xml, 'utf8');
  await fs.writeFile(path.join(rootDir, 'feed.xml'), xml, 'utf8');

  console.log(`Generated RSS feed with ${Math.min(posts.length, 30)} posts -> apps/web/public/feed.xml`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
