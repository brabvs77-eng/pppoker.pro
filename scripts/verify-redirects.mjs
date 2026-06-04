import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(rootDir, 'content/manifest.json');
const vercelPath = path.join(rootDir, 'vercel.json');

function normalizeSource(route) {
  if (route === '/') return '/';
  return route.replace(/\/$/, '');
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const vercel = JSON.parse(await fs.readFile(vercelPath, 'utf8'));

  const STATIC_REDIRECTS = [
    ['/ru', '/'],
    ['/user-agreement', '/en/user-agreement'],
    ['/privacy-policy', '/en/privacy-policy'],
    ['/tag/pppoker-2', '/tag/pppoker'],
  ];

  const STATIC_WILDCARD = [{ source: '/ru/:path*', destination: '/:path*' }];

  const expected = new Map(STATIC_REDIRECTS);
  for (const page of manifest.pages) {
    if (!page.isRedirect || !page.redirectTo) continue;
    expected.set(normalizeSource(page.route), normalizeSource(page.redirectTo));
  }

  const actual = new Map(
    (vercel.redirects ?? []).map((entry) => [entry.source, entry.destination]),
  );

  const missing = [];
  const wrong = [];

  for (const [source, destination] of expected) {
    if (!actual.has(source)) {
      missing.push(source);
      continue;
    }
    if (actual.get(source) !== destination) {
      wrong.push({ source, expected: destination, actual: actual.get(source) });
    }
  }

  for (const { source, destination } of STATIC_WILDCARD) {
    const entry = (vercel.redirects ?? []).find((item) => item.source === source);
    if (!entry || entry.destination !== destination) {
      wrong.push({ source, expected: destination, actual: entry?.destination ?? '(missing)' });
    }
  }

  if (missing.length || wrong.length) {
    console.error('vercel.json redirects out of sync with manifest');
    missing.forEach((source) => console.error(`  missing: ${source}`));
    wrong.forEach(({ source, expected: dest, actual: got }) =>
      console.error(`  wrong ${source}: expected ${dest}, got ${got}`),
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Verified ${expected.size} redirects in vercel.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
