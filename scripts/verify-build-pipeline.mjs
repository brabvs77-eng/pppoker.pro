import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const workflow = readFileSync(path.join(rootDir, '.github/workflows/build.yml'), 'utf8');
const cloudflareReadme = readFileSync(
  path.join(rootDir, 'deploy/cloudflare/README.md'),
  'utf8',
);

const violations = [];

if (pkg.scripts['build:next']?.includes('smoke:homepage')) {
  violations.push('build:next must not invoke smoke:homepage (Cloudflare Pages has no Playwright)');
}

if (pkg.scripts.build?.includes('smoke:homepage')) {
  violations.push('npm run build must not invoke smoke:homepage');
}

if (!workflow.includes('npm run smoke:homepage')) {
  violations.push('GitHub Actions workflow must run smoke:homepage after npm run build');
}

if (!cloudflareReadme.includes('npm run build')) {
  violations.push('deploy/cloudflare/README.md must document npm run build for Cloudflare Pages');
}

if (!cloudflareReadme.toLowerCase().includes('playwright')) {
  violations.push('deploy/cloudflare/README.md must note Playwright smoke is GHA-only');
}

if (!pkg.scripts.prebuild?.includes('apps/web ci')) {
  violations.push('prebuild must run npm --prefix apps/web ci (Cloudflare only installs root deps)');
}

if (violations.length) {
  console.error('Build pipeline verification failed:');
  violations.forEach((line) => console.error(`  - ${line}`));
  process.exitCode = 1;
} else {
  console.log(
    'Verified build pipeline: npm run build is Playwright-free; smoke runs in GitHub Actions.',
  );
}
