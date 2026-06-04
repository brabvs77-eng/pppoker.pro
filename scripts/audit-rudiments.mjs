import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'glob';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Paths that must not exist after cleanup. */
const FORBIDDEN_PATHS = [
  'scripts/build-react-static-site.mjs',
  'scripts/verify-react-static-site.mjs',
  'src/components/StaticDocument.mjs',
  'apps/web/src/components/BlogArchive.tsx',
  'apps/web/src/components/PostArticle.tsx',
  'apps/web/src/app/page.module.css',
  'apps/web/src/app/sitemap.ts',
];

/** Source files that must not import removed modules. */
const FORBIDDEN_IMPORTS = [
  'PostArticle',
  'StaticDocument',
  'build-react-static-site',
  'from \'@/components/BlogArchive\'',
];

async function main() {
  const violations = [];

  for (const relativePath of FORBIDDEN_PATHS) {
    try {
      await fs.access(path.join(rootDir, relativePath));
      violations.push(`Legacy file still present: ${relativePath}`);
    } catch {
      // expected
    }
  }

  const sources = await glob('apps/web/src/**/*.{ts,tsx}', { cwd: rootDir, nodir: true });
  for (const relativePath of sources) {
    const content = await fs.readFile(path.join(rootDir, relativePath), 'utf8');
    for (const token of FORBIDDEN_IMPORTS) {
      if (content.includes(token)) {
        violations.push(`Forbidden reference "${token}" in ${relativePath}`);
      }
    }
  }

  const rootPkg = JSON.parse(await fs.readFile(path.join(rootDir, 'package.json'), 'utf8'));
  for (const dep of ['react', 'react-dom', 'sharp']) {
    if (rootPkg.dependencies?.[dep]) {
      violations.push(`Root package.json should not depend on ${dep}`);
    }
  }

  for (const script of ['build:legacy-react', 'migrate:react']) {
    if (rootPkg.scripts?.[script]) {
      violations.push(`Legacy npm script still present: ${script}`);
    }
  }

  if (violations.length) {
    console.error('Rudiment audit failed:');
    violations.forEach((line) => console.error(`  - ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log('Rudiment audit passed (no forbidden legacy artifacts).');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
