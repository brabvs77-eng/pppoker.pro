import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(rootDir, 'apps/web/public');
const outDir = path.join(rootDir, 'apps/web/out');

const FEEDS = [
  { label: 'RU', publicPath: 'feed.xml', outPath: 'feed.xml', minItems: 1 },
  { label: 'EN', publicPath: 'en/feed.xml', outPath: 'en/feed.xml', minItems: 1 },
  { label: 'UZ', publicPath: 'uz/feed.xml', outPath: 'uz/feed.xml', minItems: 1 },
  { label: 'KZ', publicPath: 'kz/feed.xml', outPath: 'kz/feed.xml', minItems: 1 },
];

function verifyFeed({ label, publicPath, outPath, minItems }, html, violations, stage) {
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

async function main() {
  const violations = [];
  const checked = [];

  for (const feed of FEEDS) {
    const publicFile = path.join(publicDir, feed.publicPath);
    const outFile = path.join(outDir, feed.outPath);

    let publicXml;
    let outXml;
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

    verifyFeed(feed, publicXml, violations, 'public');
    verifyFeed(feed, outXml, violations, 'out');
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

  console.log(`Verified locale RSS feeds for ${checked.join(', ')} (public + export).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
