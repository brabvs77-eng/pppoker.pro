/**
 * CI guard: verify:links skips /assets/ — this script checks extracted bodies
 * reference files that exist under apps/web/public/.
 *
 * Run after extract:content and prepare:public.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const bodiesDir = path.join(rootDir, 'content/bodies');
const publicDir = path.join(rootDir, 'apps/web/public');

const ASSET_REF_PATTERN = /(?:src|href|poster)="(\/assets\/[^"?#]+)"|url\((\/assets\/[^)?#'"]+)\)/g;

const existsCache = new Map();

async function fileExists(relativePath) {
  if (existsCache.has(relativePath)) return existsCache.get(relativePath);
  try {
    await fs.access(path.join(publicDir, relativePath));
    existsCache.set(relativePath, true);
    return true;
  } catch {
    existsCache.set(relativePath, false);
    return false;
  }
}

async function main() {
  let bodyFiles;
  try {
    bodyFiles = await glob('*.html', { cwd: bodiesDir });
  } catch {
    console.error('content/bodies not found — run npm run extract:content first.');
    process.exitCode = 1;
    return;
  }

  try {
    await fs.access(path.join(publicDir, 'assets'));
  } catch {
    console.error('apps/web/public/assets not found — run npm run prepare:public first.');
    process.exitCode = 1;
    return;
  }

  const missing = [];
  let refCount = 0;

  for (const file of bodyFiles) {
    const html = await fs.readFile(path.join(bodiesDir, file), 'utf8');
    const refs = new Set();
    for (const match of html.matchAll(ASSET_REF_PATTERN)) {
      refs.add(match[1] || match[2]);
    }
    for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
      for (const candidate of match[1].split(',')) {
        const url = candidate.trim().split(/\s+/)[0];
        if (url?.startsWith('/assets/')) refs.add(url);
      }
    }

    for (const ref of refs) {
      refCount += 1;
      const relative = ref.replace(/^\//, '');
      if (!(await fileExists(relative))) {
        missing.push({ file, ref });
        continue;
      }
      if (ref.endsWith('.mp4')) {
        const stat = await fs.stat(path.join(publicDir, relative));
        if (stat.size < 1024) {
          missing.push({ file, ref, reason: `corrupt/stub mp4 (${stat.size} bytes)` });
        }
      }
    }
  }

  if (missing.length) {
    console.error(`Found ${missing.length} /assets/ references with no matching file (out of ${refCount} checked):`);
    missing.slice(0, 40).forEach(({ file, ref, reason }) =>
      console.error(`  ${file}: ${ref}${reason ? ` (${reason})` : ''}`),
    );
    if (missing.length > 40) console.error(`  ... and ${missing.length - 40} more`);
    process.exitCode = 1;
    return;
  }

  console.log(`Verified ${refCount} /assets/ references across ${bodyFiles.length} body files — all resolve to real files.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
