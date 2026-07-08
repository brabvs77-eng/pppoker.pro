import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { LOCALE_RSS_FEEDS } from './lib/rss-feeds.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(rootDir, 'apps/web/public');
const outDir = path.join(rootDir, 'apps/web/out');

function verifyFeedXml({ label, publicPath, minItems }, html, violations, stage) {
  const itemCount = (html.match(/<item>/g) ?? []).length;
  if (itemCount < minItems) {
    violations.push(`[${label}] ${stage}: expected at least ${minItems} RSS items, found ${itemCount}`);
  }

  const feedUrl = `https://pppoker.pro/${publicPath}`;
  if (!html.includes(`href="${feedUrl}"`)) {
    violations.push(`[${label}] ${stage}: missing atom self link ${feedUrl}`);
  }

  if (!html.includes('<rss version="2.0"')) {
    violations.push(`[${label}] ${stage}: invalid RSS root element`);
  }
}

function verifyHomepageRssLink({ label, homepageOutPath, feedHref }, html, violations) {
  const needle = `type="application/rss+xml"`;
  if (!html.includes(needle)) {
    violations.push(`[${label}] homepage missing RSS alternate link`);
    return;
  }

  if (!html.includes(`href="${feedHref}"`)) {
    violations.push(`[${label}] homepage RSS link must point to ${feedHref}`);
  }
}

async function main() {
  const violations = [];
  const checked = [];

  for (const feed of LOCALE_RSS_FEEDS) {
    const publicFile = path.join(publicDir, feed.publicPath);
    const outFile = path.join(outDir, feed.outPath);
    const homepageFile = path.join(outDir, feed.homepageOutPath);

    let publicXml;
    let outXml;
    let homepageHtml;
    try {
      publicXml = await fs.readFile(publicFile, 'utf8');
    } catch {
      violations.push(`[${feed.label}] Missing generated feed: apps/web/public/${feed.publicPath}`);
      continue;
    }

    try {
      outXml = await fs.readFile(outFile, 'utf8');
    } catch {
      violations.push(`[${feed.label}] Missing exported feed: apps/web/out/${feed.outPath}`);
      continue;
    }

    try {
      homepageHtml = await fs.readFile(homepageFile, 'utf8');
    } catch {
      violations.push(`[${feed.label}] Missing homepage for RSS head link: ${feed.homepageOutPath}`);
      continue;
    }

    verifyFeedXml(feed, publicXml, violations, 'public');
    verifyFeedXml(feed, outXml, violations, 'out');
    verifyHomepageRssLink(feed, homepageHtml, violations);

    if (!violations.some((line) => line.startsWith(`[${feed.label}]`))) {
      checked.push(feed.label);
    }
  }

  if (violations.length) {
    console.error('RSS verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    `Verified locale RSS feeds for ${checked.join(', ')} (public, export, homepage head link).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
