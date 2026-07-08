import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = path.join(rootDir, 'content/posts');
const publicDir = path.join(rootDir, 'apps/web/public');

const SITE_URL = 'https://pppoker.pro';

const FEEDS = [
  {
    locale: 'ru',
    publicPath: 'feed.xml',
    language: 'ru-RU',
    title: 'Nuts PPPoker — блог',
    description: 'Статьи о покере, стратегии и клубе Nuts на PPPoker',
    blogLink: '/blog/',
  },
  {
    locale: 'en',
    publicPath: 'en/feed.xml',
    language: 'en-US',
    title: 'Nuts PPPoker — Blog',
    description: 'Articles on poker, strategy, and the Nuts club on PPPoker',
    blogLink: '/en/blog/',
  },
  {
    locale: 'uz',
    publicPath: 'uz/feed.xml',
    language: 'uz-UZ',
    title: 'Nuts PPPoker — Blog',
    description: 'Poker, strategiya va Nuts klubi haqida maqolalar',
    blogLink: '/uz/blog/',
  },
  {
    locale: 'kz',
    publicPath: 'kz/feed.xml',
    language: 'kk-KZ',
    title: 'Nuts PPPoker — Блог',
    description: 'Покер, стратегия және Nuts клубы туралы мақалалар',
    blogLink: '/kz/blog/',
  },
];

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

function buildFeedXml({ title, description, language, blogLink, feedUrl, posts }) {
  const items = posts
    .slice(0, 30)
    .map((post) => {
      const link = absolutePostUrl(post.route);
      const itemDescription = escapeXml(post.description || stripHtml(post.html).slice(0, 280));
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${itemDescription}</description>
    </item>`;
    })
    .join('\n');

  const updated = new Date().toUTCString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${SITE_URL}${blogLink}</link>
    <description>${escapeXml(description)}</description>
    <language>${language}</language>
    <lastBuildDate>${updated}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

async function main() {
  const files = await glob('*.json', { cwd: postsDir, nodir: true });
  const postsByLocale = new Map();

  for (const file of files) {
    const post = JSON.parse(await fs.readFile(path.join(postsDir, file), 'utf8'));
    if (!post.publishedAt) continue;
    const bucket = postsByLocale.get(post.locale) ?? [];
    bucket.push(post);
    postsByLocale.set(post.locale, bucket);
  }

  await fs.mkdir(publicDir, { recursive: true });
  const summaries = [];

  for (const feed of FEEDS) {
    const posts = (postsByLocale.get(feed.locale) ?? []).sort(
      (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
    );

    if (posts.length === 0) {
      console.log(`Skipped ${feed.locale.toUpperCase()} RSS feed — no published posts`);
      continue;
    }

    const feedUrl = `${SITE_URL}/${feed.publicPath}`;
    const xml = buildFeedXml({ ...feed, feedUrl, posts });
    const outputPath = path.join(publicDir, feed.publicPath);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, xml, 'utf8');

    if (feed.locale === 'ru') {
      await fs.writeFile(path.join(rootDir, 'feed.xml'), xml, 'utf8');
    }

    summaries.push(`${feed.locale.toUpperCase()}: ${Math.min(posts.length, 30)} posts -> ${feed.publicPath}`);
  }

  console.log(`Generated RSS feeds: ${summaries.join('; ')}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
