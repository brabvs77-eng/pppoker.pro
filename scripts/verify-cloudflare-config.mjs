import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(rootDir, 'apps/web/out');

const REQUIRED_FILES = ['_redirects', '_headers'];

async function main() {
  const violations = [];

  for (const file of REQUIRED_FILES) {
    const target = path.join(outDir, file);
    try {
      await fs.access(target);
    } catch {
      violations.push(`Missing apps/web/out/${file}`);
    }
  }

  const redirectsPath = path.join(outDir, '_redirects');
  try {
    const redirects = await fs.readFile(redirectsPath, 'utf8');
    const ruleCount = redirects
      .split('\n')
      .filter((line) => line.trim() && !line.trim().startsWith('#')).length;
    if (ruleCount < 1) {
      violations.push('apps/web/out/_redirects has no redirect rules');
    }
  } catch {
    // reported above
  }

  const headersPath = path.join(outDir, '_headers');
  try {
    const headers = await fs.readFile(headersPath, 'utf8');
    if (!headers.includes('Cache-Control')) {
      violations.push('apps/web/out/_headers missing Cache-Control rules');
    }
  } catch {
    // reported above
  }

  if (violations.length) {
    console.error('Cloudflare Pages config verification failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log('Verified Cloudflare Pages _redirects and _headers in apps/web/out');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
